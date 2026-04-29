import { useState } from 'react';

export default function Task({ task, column, columns, onMove, onDelete }) {
    const [showMove, setShowMove] = useState(false);

    const otherColumns = columns.filter(c => c.id !== column.id);

    return (
        <div style={s.card}>
            <div style={s.title}>{task.title}</div>
            {task.description && <div style={s.desc}>{task.description}</div>}
            {task.due_date && (
                <div style={s.due}>Due: {new Date(task.due_date).toLocaleDateString()}</div>
            )}
            <div style={s.actions}>
                {otherColumns.length > 0 && (
                    <div style={s.moveWrap}>
                        <button style={s.moveBtn} onClick={() => setShowMove(!showMove)}>Move</button>
                        {showMove && (
                            <div style={s.dropdown}>
                                {otherColumns.map(col => (
                                    <button key={col.id} style={s.dropItem}
                                        onClick={() => { onMove(task.id, column.id, col.id); setShowMove(false); }}>
                                        → {col.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <button style={s.delBtn} onClick={() => onDelete(task.id, column.id)}>✕</button>
            </div>
        </div>
    );
}

const s = {
    card: { background: '#fff', borderRadius: '6px', padding: '0.6rem 0.7rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    title: { fontWeight: 500, fontSize: '0.9rem', color: '#172b4d', marginBottom: '0.25rem' },
    desc: { fontSize: '0.8rem', color: '#5e6c84', marginBottom: '0.25rem' },
    due: { fontSize: '0.75rem', color: '#97a0af', marginBottom: '0.4rem' },
    actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' },
    moveWrap: { position: 'relative' },
    moveBtn: { padding: '0.2rem 0.5rem', background: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#5e6c84' },
    dropdown: { position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #dfe1e6', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '130px', marginTop: '2px' },
    dropItem: { display: 'block', width: '100%', padding: '0.4rem 0.6rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: '#172b4d' },
    delBtn: { background: 'none', border: 'none', color: '#97a0af', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.1rem' },
};
