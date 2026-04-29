import { useState } from 'react';
import Task from './Task';

export default function Column({ column, tasks, columns, onAddTask, onMoveTask, onDeleteTask, onDeleteColumn }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '' });

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.title.trim()) return;
        await onAddTask(column.id, form.title.trim(), form.description.trim(), form.dueDate);
        setForm({ title: '', description: '', dueDate: '' });
        setAdding(false);
    }

    return (
        <div style={s.col}>
            <div style={s.header}>
                <span style={s.name}>{column.name}</span>
                <span style={s.count}>{tasks.length}</span>
                <button style={s.delCol} onClick={() => onDeleteColumn(column.id)}>✕</button>
            </div>

            <div style={s.tasks}>
                {tasks.map(task => (
                    <Task
                        key={task.id}
                        task={task}
                        column={column}
                        columns={columns}
                        onMove={onMoveTask}
                        onDelete={onDeleteTask}
                    />
                ))}
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
                        <button style={s.addBtn} type="submit">Add Task</button>
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
    col: { background: '#ebecf0', borderRadius: '8px', padding: '0.6rem', width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 120px)' },
    header: { display: 'flex', alignItems: 'center', padding: '0.25rem 0.25rem 0.6rem', gap: '0.5rem' },
    name: { fontWeight: 600, fontSize: '0.9rem', color: '#172b4d', flex: 1 },
    count: { background: '#dfe1e6', color: '#5e6c84', borderRadius: '10px', padding: '0 0.4rem', fontSize: '0.75rem' },
    delCol: { background: 'none', border: 'none', color: '#97a0af', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.2rem' },
    tasks: { display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, marginBottom: '0.5rem' },
    addForm: { background: '#fff', borderRadius: '6px', padding: '0.6rem' },
    input: { display: 'block', width: '100%', padding: '0.45rem 0.5rem', marginBottom: '0.4rem', border: '1px solid #dfe1e6', borderRadius: '4px', fontSize: '0.85rem' },
    formBtns: { display: 'flex', gap: '0.5rem' },
    addBtn: { padding: '0.4rem 0.75rem', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
    cancelBtn: { padding: '0.4rem 0.5rem', background: 'none', border: 'none', color: '#5e6c84', cursor: 'pointer', fontSize: '0.85rem' },
    addTaskBtn: { width: '100%', padding: '0.5rem', background: 'none', border: 'none', color: '#5e6c84', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontSize: '0.85rem' },
};
