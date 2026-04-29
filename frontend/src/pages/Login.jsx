import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.username, form.password);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={s.page}>
            <div style={s.orb1} />
            <div style={s.orb2} />
            <div style={s.card}>
                <div style={s.logoWrap}>
                    <div style={s.logoIcon}>✦</div>
                    <span style={s.logoText}>Taskflow</span>
                </div>
                <h2 style={s.heading}>Welcome back</h2>
                <p style={s.sub}>Sign in to continue to your boards</p>
                {error && <div style={s.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label style={s.label}>Username</label>
                    <input style={s.input} placeholder="your_username"
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                    <label style={s.label}>Password</label>
                    <input style={s.input} type="password" placeholder="••••••••"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
                <p style={s.foot}>No account? <Link to="/signup">Create one</Link></p>
            </div>
        </div>
    );
}

const s = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(145deg, #fdf0e0 0%, #fce4cc 100%)', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,168,100,0.2) 0%, transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' },
    orb2: { position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,114,58,0.12) 0%, transparent 70%)', bottom: '-100px', left: '-80px', pointerEvents: 'none' },
    card: { background: '#fffbf7', border: '1px solid rgba(210,160,100,0.25)', borderRadius: '22px', padding: '2.5rem', width: '380px', position: 'relative', zIndex: 1, boxShadow: '0 8px 40px rgba(180,100,40,0.1)' },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' },
    logoIcon: { fontSize: '1.4rem', color: '#c2723a' },
    logoText: { fontSize: '1.2rem', fontWeight: 700, color: '#3d2c1e', letterSpacing: '-0.02em' },
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#3d2c1e', marginBottom: '0.35rem', letterSpacing: '-0.02em' },
    sub: { fontSize: '0.875rem', color: '#9c7c62', marginBottom: '1.75rem' },
    error: { background: '#fff0ed', border: '1px solid #f5c4b8', color: '#c05040', borderRadius: '10px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9c7c62', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
    input: { display: 'block', width: '100%', padding: '0.75rem 0.9rem', marginBottom: '1rem', background: '#fdf6ee', border: '1px solid rgba(200,150,100,0.3)', borderRadius: '11px', fontSize: '0.95rem', color: '#3d2c1e' },
    btn: { width: '100%', padding: '0.82rem', background: 'linear-gradient(135deg, #c2723a, #d4926a)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 16px rgba(194,114,58,0.35)' },
    foot: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#b8967a' },
};
