import { useState } from 'react';
import Task from './Task';

const ACCENT_COLORS = {
    'To Do': '#7bafd4',
    'In Progress': '#d4a040',
    'Completed': '#6ab87a',
};

const FALLBACK_COLORS = ['#c278b0', '#e07878', '#7ab8c8', '#c2a050', '#8878c8'];

function getAccent(name, index) {
    return ACCENT_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function Column({ column, index, tasks, columns, onAddTask, onMoveTask, onDeleteTask, onDeleteColumn }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
    const accent = getAccent(column.name, index);

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.title.trim()) return;
        await onAddTask(column.id, form.title.trim(), form.description.trim(), form.dueDate);
        setForm({ title: '', description: '', dueDate: '' });
        setAdding(false);
    }

    return (
        <div style={s.col}>
            <div style={{ ...s.accentBar, background: accent }} />
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <span style={{ ...s.dot, background: accent }} />
                    <span style={s.name}>{column.name}</span>
                </div>
                <div style={s.headerRight}>
                    <span style={s.count}>{tasks.length}</span>
                    <button style={s.delCol} onClick={() => onDeleteColumn(column.id)}>✕</button>
                </div>
            </div>

            <div style={s.tasks}>
                {tasks.map(task => (
                    <Task key={task.id} task={task} column={column} columns={columns}
                        accent={accent} onMove={onMoveTask} onDelete={onDeleteTask} />
                ))}
                {tasks.length === 0 && <div style={s.empty}>No tasks yet</div>}
            </div>

            {adding ? (
                <form style={s.addForm} onSubmit={handleAdd}>
                    <input style={s.input} placeholder="Task title" autoFocus
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input style={s.input} placeholder="Description (optional)"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <input style={s.input} type="date"
                        value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                    <div style={s.formBtns}>
                        <button style={{ ...s.addBtn, background: accent }} type="submit">Add task</button>
                        <button style={s.cancelBtn} type="button" onClick={() => setAdding(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <button style={s.addTaskBtn} onClick={() => setAdding(true)}>+ Add a task</button>
            )}
        </div>
    );
}

const s = {
    col: { background: '#fffbf7', border: '1px solid rgba(200,150,100,0.2)', borderRadius: '16px', width: '272px', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 110px)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(180,100,40,0.07)' },
    accentBar: { height: '3px', borderRadius: '16px 16px 0 0' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0.85rem 0.65rem' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    name: { fontWeight: 600, fontSize: '0.875rem', color: '#3d2c1e' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    count: { background: 'rgba(194,114,58,0.1)', color: '#c2723a', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 },
    delCol: { background: 'none', border: 'none', color: '#d4b896', cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem 0.2rem' },
    tasks: { display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, padding: '0 0.7rem 0.5rem' },
    empty: { textAlign: 'center', padding: '1.75rem 0', fontSize: '0.8rem', color: '#d4b896', fontStyle: 'italic' },
    addForm: { margin: '0.5rem 0.7rem 0.7rem', background: '#fdf6ee', border: '1px solid rgba(200,150,100,0.2)', borderRadius: '11px', padding: '0.75rem' },
    input: { display: 'block', width: '100%', padding: '0.5rem 0.6rem', marginBottom: '0.4rem', background: '#fffbf7', border: '1px solid rgba(200,150,100,0.25)', borderRadius: '8px', fontSize: '0.85rem', color: '#3d2c1e' },
    formBtns: { display: 'flex', gap: '0.4rem', marginTop: '0.2rem' },
    addBtn: { padding: '0.42rem 0.9rem', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 },
    cancelBtn: { padding: '0.42rem 0.5rem', background: 'none', border: 'none', color: '#b8967a', cursor: 'pointer', fontSize: '0.82rem' },
    addTaskBtn: { margin: '0.4rem 0.7rem 0.7rem', padding: '0.6rem', background: 'none', border: '1px dashed rgba(200,150,100,0.3)', borderRadius: '9px', color: '#c4a882', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' },
};
