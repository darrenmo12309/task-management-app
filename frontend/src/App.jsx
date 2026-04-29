import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Boards from './pages/Boards';
import Board from './pages/Board';

// Redirects to /login if no user session exists in localStorage
function PrivateRoute({ children }) {
    return localStorage.getItem('user') ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* Both board routes are protected — unauthenticated users are redirected */}
                <Route path="/" element={<PrivateRoute><Boards /></PrivateRoute>} />
                <Route path="/boards/:boardId" element={<PrivateRoute><Board /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
