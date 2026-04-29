import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard } from '../api';

const GRADIENTS = [
    'linear-gradient(135deg, #f7c59f, #eb9065)',
    'linear-gradient(135deg, #a8d5a2, #6fb86a)',
    'linear-gradient(135deg, #f9e4a0, #f5c94e)',
    'linear-gradient(135deg, #c9b8e8, #a88fd4)',
    'linear-gradient(135deg, #f7b8c0, #e8849a)',
    'linear-gradient(135deg, #a8d4e8, #6aaed4)',
];

function initials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Boards() {
    const [boards, setBoards] = useState([]);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        getBoards(user.id).then(setBoards).catch(() => setError('Failed to load boards'));
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            const board = await createBoard(newName.trim(), user.id);
            setBoards([board, ...boards]);
            setNewName('');
        } catch {
            setError('Failed to create board');
        }
    }

    async function handleDelete(e, boardId) {
        e.stopPropagation();
        try {
            await deleteBoard(boardId);
            setBoards(boards.filter(b => b.id !== boardId));
        } catch {
            setError('Failed to delete board');
        }
    }

    return (
        <div style={s.page}>
            <header style={s.header}>
                <div style={s.logoWrap}>
                    <span style={s.logoIcon}>✦</span>
                    <span style={s.logoText}>Taskflow</span>
                </div>
                <div style={s.headerRight}>
                    <div style={s.avatar}>{initials(user.username)}</div>
                    <span style={s.username}>{user.username}</span>
                    <button style={s.logoutBtn} onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
                        Sign out
                    </button>
                </div>
            </header>

            <main style={s.main}>
                <h1 style={s.title}>My Boards</h1>
                <p style={s.subtitle}>{boards.length} board{boards.length !== 1 ? 's' : ''}</p>

                {error && <div style={s.error}>{error}</div>}

                <form style={s.form} onSubmit={handleCreate}>
                    <input style={s.input} placeholder="Give your board a name…"
                        value={newName} onChange={e => setNewName(e.target.value)} />
                    <button style={s.createBtn} type="submit">+ New Board</button>
                </form>

                <div style={s.grid}>
                    {boards.map((board, i) => (
                        <div key={board.id} style={{ ...s.card, background: GRADIENTS[i % GRADIENTS.length] }}
                            onClick={() => navigate(`/boards/${board.id}`)}>
                            <div style={s.cardOverlay} />
                            <div style={s.cardContent}>
                                <div style={s.cardInitials}>{initials(board.name)}</div>
                                <span style={s.cardName}>{board.name}</span>
                                <span style={s.cardDate}>{new Date(board.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <button style={s.deleteBtn} onClick={e => handleDelete(e, board.id)}>✕</button>
                        </div>
                    ))}
                    {boards.length === 0 && (
                        <div style={s.empty}>
                            <div style={s.emptyIcon}>🌿</div>
                            <p style={s.emptyText}>No boards yet</p>
                            <p style={s.emptySub}>Create your first board above to get started</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', background: '#fdf6ee' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', background: 'rgba(255,251,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(200,150,100,0.2)', position: 'sticky', top: 0, zIndex: 10 },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    logoIcon: { fontSize: '1.2rem', color: '#c2723a' },
    logoText: { fontSize: '1.1rem', fontWeight: 700, color: '#3d2c1e', letterSpacing: '-0.02em' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #c2723a, #d4926a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(194,114,58,0.3)' },
    username: { fontSize: '0.875rem', color: '#9c7c62', fontWeight: 500 },
    logoutBtn: { padding: '0.35rem 0.85rem', background: 'rgba(194,114,58,0.08)', color: '#9c7c62', border: '1px solid rgba(194,114,58,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' },
    title: { fontSize: '1.75rem', fontWeight: 700, color: '#3d2c1e', letterSpacing: '-0.03em' },
    subtitle: { fontSize: '0.875rem', color: '#b8967a', marginTop: '0.25rem', marginBottom: '2rem' },
    error: { background: '#fff0ed', border: '1px solid #f5c4b8', color: '#c05040', borderRadius: '10px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', marginBottom: '1.25rem' },
    form: { display: 'flex', gap: '0.75rem', marginBottom: '2rem' },
    input: { flex: 1, padding: '0.75rem 1rem', background: '#fffbf7', border: '1px solid rgba(200,150,100,0.3)', borderRadius: '11px', fontSize: '0.9rem', color: '#3d2c1e' },
    createBtn: { padding: '0.75rem 1.4rem', background: 'linear-gradient(135deg, #c2723a, #d4926a)', color: '#fff', border: 'none', borderRadius: '11px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(194,114,58,0.3)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
    card: { position: 'relative', borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', minHeight: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.1)' },
    cardOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.18) 100%)', pointerEvents: 'none' },
    cardContent: { position: 'relative', zIndex: 1 },
    cardInitials: { fontSize: '1.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem', letterSpacing: '-0.03em' },
    cardName: { display: 'block', fontWeight: 700, color: '#fff', fontSize: '1rem', letterSpacing: '-0.01em', marginBottom: '0.3rem', textShadow: '0 1px 3px rgba(0,0,0,0.2)' },
    cardDate: { display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' },
    deleteBtn: { position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.3)', border: 'none', color: '#fff', cursor: 'pointer', width: '26px', height: '26px', borderRadius: '6px', fontSize: '0.75rem', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    empty: { gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' },
    emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
    emptyText: { fontSize: '1.1rem', fontWeight: 600, color: '#c4a882', marginBottom: '0.5rem' },
    emptySub: { fontSize: '0.875rem', color: '#d4b896' },
};
