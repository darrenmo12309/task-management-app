import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api';

export default function Signup() {
    const [form, setForm] = useState({ email: '', username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await signup(form.email, form.username, form.password);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    }

    const field = (key, type, placeholder) => (
        <input style={s.input} type={type} placeholder={placeholder}
            value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    );

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h2 style={s.logo}>Task Board</h2>
                <h3 style={s.heading}>Create account</h3>
                {error && <p style={s.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    {field('email', 'email', 'Email')}
                    {field('username', 'text', 'Username')}
                    {field('password', 'password', 'Password')}
                    <button style={s.btn} type="submit">Sign Up</button>
                </form>
                <p style={s.foot}>Have an account? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
}

const s = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' },
    card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: '340px' },
    logo: { color: '#0052cc', marginBottom: '0.25rem' },
    heading: { fontWeight: 400, color: '#5e6c84', marginBottom: '1.5rem' },
    error: { color: '#de350b', fontSize: '0.85rem', marginBottom: '0.75rem' },
    input: { display: 'block', width: '100%', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', border: '1px solid #dfe1e6', borderRadius: '4px', fontSize: '0.95rem' },
    btn: { width: '100%', padding: '0.7rem', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
    foot: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#5e6c84' },
};
