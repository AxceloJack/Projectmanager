import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';
const API = axios.create({
    baseURL,
});
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const authAPI = {
    register: (email, password, workspaceName) => API.post('/auth/register', { email, password, workspaceName }),
    login: (email, password) => API.post('/auth/login', { email, password }),
    refresh: () => API.post('/auth/refresh'),
};
export const clientsAPI = {
    list: () => API.get('/clients'),
    get: (id) => API.get(`/clients/${id}`),
    create: (data) => API.post('/clients', data),
    update: (id, data) => API.patch(`/clients/${id}`, data),
    delete: (id) => API.delete(`/clients/${id}`),
};
export const tasksAPI = {
    list: (clientId) => API.get('/tasks', { params: { clientId } }),
    get: (id) => API.get(`/tasks/${id}`),
    create: (data) => API.post('/tasks', data),
    update: (id, data) => API.patch(`/tasks/${id}`, data),
    delete: (id) => API.delete(`/tasks/${id}`),
    addComment: (taskId, content) => API.post(`/tasks/${taskId}/comments`, { content }),
};
export const publicAPI = {
    getClient: (publicKey) => API.get(`/public/clients/${publicKey}`),
    addComment: (publicKey, taskId, content, clientName) => API.post(`/public/clients/${publicKey}/comments`, {
        taskId,
        content,
        clientName,
    }),
    approveTask: (publicKey, taskId) => API.post(`/public/clients/${publicKey}/tasks/${taskId}/approve`),
    requestRevisions: (publicKey, taskId, reason) => API.post(`/public/clients/${publicKey}/tasks/${taskId}/request-revisions`, {
        reason,
    }),
};
export const adminAPI = {
    getPendingUsers: () => API.get('/admin/users/pending'),
    approveUser: (userId) => API.post(`/admin/users/${userId}/approve`),
    rejectUser: (userId) => API.post(`/admin/users/${userId}/reject`),
};
export const slackAPI = {
    getIntegration: () => API.get('/slack/integration'),
    connectWorkspace: (data) => API.post('/slack/workspace-connect', data),
};
export default API;
//# sourceMappingURL=api.js.map