import { useState } from 'react';

export default function Task({ task, column, columns, accent, onMove, onDelete }) {
    const [showMove, setShowMove] = useState(false);
    const otherColumns = columns.filter(c => c.id !== column.id);

    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
    const dueColor = isOverdue ? '#c05040' : '#b8967a';
    const dueBg = isOverdue ? '#fff0ed' : '#fdf0e0';

    return (
        <div style={{ ...s.card, borderLeftColor: accent }}>
            <div style={s.title}>{task.title}</div>
            {task.description && <div style={s.desc}>{task.description}</div>}
            <div style={s.footer}>
                {task.due_date && (
                    <span style={{ ...s.due, color: dueColor, background: dueBg }}>
                        {isOverdue ? '⚠ ' : '📅 '}
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                )}
                <div style={s.actions}>
                    {otherColumns.length > 0 && (
                        <div style={s.moveWrap}>
                            <button style={s.moveBtn} onClick={() => setShowMove(!showMove)}>Move ▾</button>
                            {showMove && (
                                <div style={s.dropdown}>
                                    <div style={s.dropHeader}>Move to</div>
                                    {otherColumns.map(col => (
                                        <button key={col.id} style={s.dropItem}
                                            onClick={() => { onMove(task.id, column.id, col.id); setShowMove(false); }}>
                                            {col.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button style={s.delBtn} onClick={() => onDelete(task.id, column.id)}>✕</button>
                </div>
            </div>
        </div>
    );
}

const s = {
    card: { background: '#fffdf9', border: '1px solid rgba(200,150,100,0.18)', borderLeft: '3px solid', borderRadius: '11px', padding: '0.75rem 0.85rem', boxShadow: '0 1px 6px rgba(180,100,40,0.07)' },
    title: { fontWeight: 600, fontSize: '0.875rem', color: '#3d2c1e', marginBottom: '0.3rem', lineHeight: 1.4 },
    desc: { fontSize: '0.8rem', color: '#9c7c62', marginBottom: '0.5rem', lineHeight: 1.45 },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', gap: '0.4rem' },
    due: { fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '20px' },
    actions: { display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' },
    moveWrap: { position: 'relative' },
    moveBtn: { padding: '0.2rem 0.5rem', background: '#fdf0e0', border: '1px solid rgba(200,150,100,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', color: '#b8967a', fontWeight: 500 },
    dropdown: { position: 'absolute', bottom: '100%', left: 0, background: '#fffbf7', border: '1px solid rgba(200,150,100,0.25)', borderRadius: '11px', boxShadow: '0 6px 24px rgba(180,100,40,0.15)', zIndex: 20, minWidth: '155px', marginBottom: '4px', overflow: 'hidden' },
    dropHeader: { padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, color: '#c4a882', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(200,150,100,0.15)' },
    dropItem: { display: 'block', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: '#5a3e28', fontWeight: 500 },
    delBtn: { background: 'none', border: 'none', color: '#d4b896', cursor: 'pointer', fontSize: '0.8rem', padding: '0.15rem 0.25rem' },
};
