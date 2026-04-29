import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard } from '../api';

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
                <h1 style={s.logo}>Task Board</h1>
                <div style={s.headerRight}>
                    <span style={s.username}>{user.username}</span>
                    <button style={s.logoutBtn} onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
                        Logout
                    </button>
                </div>
            </header>
            <main style={s.main}>
                <h2 style={s.sectionTitle}>My Boards</h2>
                {error && <p style={s.error}>{error}</p>}
                <form style={s.form} onSubmit={handleCreate}>
                    <input style={s.input} placeholder="New board name"
                        value={newName} onChange={e => setNewName(e.target.value)} />
                    <button style={s.createBtn} type="submit">+ Create Board</button>
                </form>
                <div style={s.grid}>
                    {boards.map(board => (
                        <div key={board.id} style={s.card} onClick={() => navigate(`/boards/${board.id}`)}>
                            <span style={s.boardName}>{board.name}</span>
                            <button style={s.deleteBtn} onClick={e => handleDelete(e, board.id)}>✕</button>
                        </div>
                    ))}
                    {boards.length === 0 && <p style={s.empty}>No boards yet. Create one above.</p>}
                </div>
            </main>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', background: '#f4f5f7' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '56px', background: '#0052cc', color: '#fff' },
    logo: { fontSize: '1.2rem', fontWeight: 700 },
    headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
    username: { fontSize: '0.9rem' },
    logoutBtn: { padding: '0.3rem 0.75rem', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
    main: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
    sectionTitle: { marginBottom: '1.25rem', color: '#172b4d' },
    error: { color: '#de350b', marginBottom: '1rem', fontSize: '0.9rem' },
    form: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
    input: { flex: 1, padding: '0.6rem 0.75rem', border: '1px solid #dfe1e6', borderRadius: '4px', fontSize: '0.95rem' },
    createBtn: { padding: '0.6rem 1rem', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
    card: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'box-shadow 0.15s' },
    boardName: { fontWeight: 600, color: '#172b4d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    deleteBtn: { background: 'none', border: 'none', color: '#97a0af', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem', flexShrink: 0 },
    empty: { color: '#5e6c84', gridColumn: '1 / -1' },
};
