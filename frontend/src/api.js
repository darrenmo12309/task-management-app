// All requests go through /api/ — Vite proxies this to localhost:3000 in dev,
// and nginx proxies it to the backend Kubernetes service in production.
const BASE = '/api';

async function request(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    // Throw so callers can catch and display the error message from the backend
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const login = (username, password) =>
    request('POST', '/login', { username, password });

export const signup = (email, username, password) =>
    request('POST', '/signup', { email, username, password });

export const getBoard = (boardId) =>
    request('GET', `/boards/${boardId}`);

export const getBoards = (userId) =>
    request('GET', `/users/${userId}/boards`);

export const createBoard = (name, owner_id) =>
    request('POST', '/boards', { name, owner_id });

export const deleteBoard = (boardId) =>
    request('DELETE', `/boards/${boardId}`);

export const getColumns = (boardId) =>
    request('GET', `/boards/${boardId}/columns`);

export const createColumn = (boardId, name, position) =>
    request('POST', `/boards/${boardId}/columns`, { name, position });

export const deleteColumn = (columnId) =>
    request('DELETE', `/columns/${columnId}`);

export const getTasks = (columnId) =>
    request('GET', `/columns/${columnId}/tasks`);

export const createTask = (columnId, title, description, position, due_date) =>
    request('POST', `/columns/${columnId}/tasks`, { title, description, position, due_date });

export const deleteTask = (taskId) =>
    request('DELETE', `/tasks/${taskId}`);

export const moveTask = (taskId, column_id, position) =>
    request('PATCH', `/tasks/${taskId}/move`, { column_id, position });
