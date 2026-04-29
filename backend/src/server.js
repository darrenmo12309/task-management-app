const express = require('express');
const pool = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from your Node.js backend!');
});

// Kubernetes liveness and readiness probes hit this endpoint to verify the pod is healthy
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Stores plain-text password for simplicity; production would use bcrypt hashing
app.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email, username, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, email, username, created_at FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );
        if (!result.rows[0]) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all boards for a user
app.get('/users/:userId/boards', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, created_at FROM boards WHERE owner_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single board
app.get('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, owner_id, created_at FROM boards WHERE id = $1',
            [boardId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a board and immediately seed it with three default columns in parallel
app.post('/boards', async (req, res) => {
    const { name, owner_id } = req.body;
    try {
        const boardResult = await pool.query(
            'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id, name, owner_id, created_at',
            [name, owner_id]
        );
        const board = boardResult.rows[0];

        // Fire all three column inserts concurrently instead of sequentially
        const defaultColumns = ['To Do', 'In Progress', 'Completed'];
        await Promise.all(defaultColumns.map((colName, position) =>
            pool.query(
                'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3)',
                [board.id, colName, position]
            )
        ));

        res.status(201).json(board);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a board name
app.put('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query(
            'UPDATE boards SET name = $1 WHERE id = $2 RETURNING id, name, owner_id, created_at',
            [name, boardId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a board — cascades to columns and tasks via ON DELETE CASCADE in schema
app.delete('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM boards WHERE id = $1 RETURNING id',
            [boardId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.status(200).json({ deleted: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all columns for a board
app.get('/boards/:boardId/columns', async (req, res) => {
    const { boardId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, position FROM columns WHERE board_id = $1 ORDER BY position ASC',
            [boardId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a column on a board
app.post('/boards/:boardId/columns', async (req, res) => {
    const { boardId } = req.params;
    const { name, position } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id, board_id, name, position',
            [boardId, name, position]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a column (rename or reorder)
app.put('/columns/:columnId', async (req, res) => {
    const { columnId } = req.params;
    const { name, position } = req.body;
    try {
        const result = await pool.query(
            'UPDATE columns SET name = $1, position = $2 WHERE id = $3 RETURNING id, board_id, name, position',
            [name, position, columnId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a column — cascades to its tasks via ON DELETE CASCADE in schema
app.delete('/columns/:columnId', async (req, res) => {
    const { columnId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM columns WHERE id = $1 RETURNING id',
            [columnId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json({ deleted: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tasks in a column
app.get('/columns/:columnId/tasks', async (req, res) => {
    const { columnId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, title, description, position, due_date, created_at FROM tasks WHERE column_id = $1 ORDER BY position ASC',
            [columnId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single task
app.get('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, column_id, title, description, position, due_date, created_at FROM tasks WHERE id = $1',
            [taskId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a task in a column
app.post('/columns/:columnId/tasks', async (req, res) => {
    const { columnId } = req.params;
    const { title, description, position, due_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (column_id, title, description, position, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, column_id, title, description, position, due_date, created_at',
            [columnId, title, description, position, due_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task (edit title, description, due date, or reorder)
app.put('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { title, description, position, due_date } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, position = $3, due_date = $4 WHERE id = $5 RETURNING id, column_id, title, description, position, due_date, created_at',
            [title, description, position, due_date, taskId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH instead of PUT — only column_id and position change when moving a task
app.patch('/tasks/:taskId/move', async (req, res) => {
    const { taskId } = req.params;
    const { column_id, position } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET column_id = $1, position = $2 WHERE id = $3 RETURNING id, column_id, title, position',
            [column_id, position, taskId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
app.delete('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING id',
            [taskId]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ deleted: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
