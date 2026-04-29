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
    const [addingCol, setAddingCol] = useState(false);

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
        setAddingCol(false);
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
        const movedTask = tasks[fromColumnId].find(t => t.id === taskId);
        const position = (tasks[toColumnId] || []).length;
        await moveTask(taskId, toColumnId, position);
        setTasks({
            ...tasks,
            [fromColumnId]: tasks[fromColumnId].filter(t => t.id !== taskId),
            [toColumnId]: [...(tasks[toColumnId] || []), { ...movedTask, column_id: toColumnId }],
        });
    }

    const totalTasks = Object.values(tasks).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div style={s.page}>
            <header style={s.header}>
                <div style={s.headerLeft}>
                    <button style={s.backBtn} onClick={() => navigate('/')}>← Boards</button>
                    <div style={s.divider} />
                    <div>
                        <h2 style={s.title}>{boardName}</h2>
                        <span style={s.meta}>{columns.length} columns · {totalTasks} tasks</span>
                    </div>
                </div>
                <button style={s.addColTrigger} onClick={() => setAddingCol(true)}>+ Add column</button>
            </header>

            <div style={s.board}>
                {columns.map((col, i) => (
                    <Column
                        key={col.id}
                        column={col}
                        index={i}
                        tasks={tasks[col.id] || []}
                        columns={columns}
                        onAddTask={handleAddTask}
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                        onDeleteColumn={handleDeleteColumn}
                    />
                ))}
                {addingCol ? (
                    <form style={s.addColForm} onSubmit={handleAddColumn}>
                        <p style={s.addColLabel}>New column</p>
                        <input style={s.addColInput} placeholder="Column name" autoFocus
                            value={newColName} onChange={e => setNewColName(e.target.value)} />
                        <div style={s.addColBtns}>
                            <button style={s.addColConfirm} type="submit">Add</button>
                            <button style={s.addColCancel} type="button" onClick={() => setAddingCol(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button style={s.addColGhost} onClick={() => setAddingCol(true)}>
                        <span>+</span> Add column
                    </button>
                )}
            </div>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg, #fdf0dc 0%, #fce8d0 60%, #fdf6ee 100%)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px', background: 'rgba(255,251,247,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(200,150,100,0.2)', position: 'sticky', top: 0, zIndex: 10 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    backBtn: { background: 'rgba(194,114,58,0.08)', color: '#9c7c62', border: '1px solid rgba(194,114,58,0.2)', borderRadius: '8px', padding: '0.35rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 },
    divider: { width: '1px', height: '24px', background: 'rgba(200,150,100,0.25)' },
    title: { fontSize: '1rem', fontWeight: 700, color: '#3d2c1e' },
    meta: { fontSize: '0.75rem', color: '#b8967a' },
    addColTrigger: { padding: '0.4rem 1rem', background: 'rgba(194,114,58,0.1)', color: '#c2723a', border: '1px solid rgba(194,114,58,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
    board: { display: 'flex', alignItems: 'flex-start', padding: '1.5rem', gap: '1rem', overflowX: 'auto', flex: 1, paddingBottom: '3rem' },
    addColForm: { background: '#fffbf7', border: '1px solid rgba(200,150,100,0.25)', borderRadius: '16px', padding: '1rem', width: '260px', flexShrink: 0, boxShadow: '0 2px 12px rgba(180,100,40,0.08)' },
    addColLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#b8967a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
    addColInput: { width: '100%', padding: '0.6rem 0.75rem', background: '#fdf6ee', border: '1px solid rgba(200,150,100,0.3)', borderRadius: '9px', fontSize: '0.9rem', color: '#3d2c1e', marginBottom: '0.6rem' },
    addColBtns: { display: 'flex', gap: '0.5rem' },
    addColConfirm: { padding: '0.45rem 1rem', background: 'linear-gradient(135deg, #c2723a, #d4926a)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
    addColCancel: { padding: '0.45rem 0.75rem', background: 'none', border: 'none', color: '#b8967a', cursor: 'pointer', fontSize: '0.85rem' },
    addColGhost: { width: '260px', flexShrink: 0, height: '60px', background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(200,150,100,0.35)', borderRadius: '16px', color: '#c4a882', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
};
