import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, getColumns, createColumn, deleteColumn, getTasks, createTask, deleteTask, moveTask } from '../api';
import Column from '../components/Column';

export default function Board() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [boardName, setBoardName] = useState('');
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState({});
    const [newColName, setNewColName] = useState('');

    useEffect(() => {
        async function load() {
            const [board, cols] = await Promise.all([getBoard(boardId), getColumns(boardId)]);
            setBoardName(board.name);
            setColumns(cols);
            const taskMap = {};
            await Promise.all(cols.map(async col => {
                taskMap[col.id] = await getTasks(col.id);
            }));
            setTasks(taskMap);
        }
        load();
    }, [boardId]);

    async function handleAddColumn(e) {
        e.preventDefault();
        if (!newColName.trim()) return;
        const col = await createColumn(boardId, newColName.trim(), columns.length);
        setColumns([...columns, col]);
        setTasks({ ...tasks, [col.id]: [] });
        setNewColName('');
    }

    async function handleDeleteColumn(columnId) {
        await deleteColumn(columnId);
        setColumns(columns.filter(c => c.id !== columnId));
        const updated = { ...tasks };
        delete updated[columnId];
        setTasks(updated);
    }

    async function handleAddTask(columnId, title, description, dueDate) {
        const position = (tasks[columnId] || []).length;
        const task = await createTask(columnId, title, description, position, dueDate || null);
        setTasks({ ...tasks, [columnId]: [...(tasks[columnId] || []), task] });
    }

    async function handleDeleteTask(taskId, columnId) {
        await deleteTask(taskId);
        setTasks({ ...tasks, [columnId]: tasks[columnId].filter(t => t.id !== taskId) });
    }

    async function handleMoveTask(taskId, fromColumnId, toColumnId) {
        if (fromColumnId === toColumnId) return;
        const position = (tasks[toColumnId] || []).length;
        const movedTask = tasks[fromColumnId].find(t => t.id === taskId);
        await moveTask(taskId, toColumnId, position);
        setTasks({
            ...tasks,
            [fromColumnId]: tasks[fromColumnId].filter(t => t.id !== taskId),
            [toColumnId]: [...(tasks[toColumnId] || []), { ...movedTask, column_id: toColumnId }],
        });
    }

    return (
        <div style={s.page}>
            <header style={s.header}>
                <div style={s.headerLeft}>
                    <button style={s.backBtn} onClick={() => navigate('/')}>← Boards</button>
                    <h2 style={s.title}>{boardName}</h2>
                </div>
            </header>
            <div style={s.board}>
                {columns.map(col => (
                    <Column
                        key={col.id}
                        column={col}
                        tasks={tasks[col.id] || []}
                        columns={columns}
                        onAddTask={handleAddTask}
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                        onDeleteColumn={handleDeleteColumn}
                    />
                ))}
                <div style={s.addColBox}>
                    <form onSubmit={handleAddColumn}>
                        <input style={s.input} placeholder="Column name"
                            value={newColName} onChange={e => setNewColName(e.target.value)} />
                        <button style={s.addColBtn} type="submit">+ Add Column</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', background: '#0079bf', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', padding: '0 1rem', height: '52px', background: 'rgba(0,0,0,0.2)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    backBtn: { background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' },
    title: { color: '#fff', fontSize: '1.1rem', fontWeight: 700 },
    board: { display: 'flex', alignItems: 'flex-start', padding: '1rem', gap: '0.75rem', overflowX: 'auto', flex: 1 },
    addColBox: { background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.75rem', minWidth: '200px', flexShrink: 0 },
    input: { width: '100%', padding: '0.5rem 0.6rem', marginBottom: '0.5rem', border: 'none', borderRadius: '4px', fontSize: '0.9rem' },
    addColBtn: { width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.3)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
};
