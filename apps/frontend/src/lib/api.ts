import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, workspaceName: string) =>
    API.post('/auth/register', { email, password, workspaceName }),
  login: (email: string, password: string) =>
    API.post('/auth/login', { email, password }),
  refresh: () => API.post('/auth/refresh'),
};

export const clientsAPI = {
  list: () => API.get('/clients'),
  get: (id: string) => API.get(`/clients/${id}`),
  create: (data: { name: string; email?: string }) =>
    API.post('/clients', data),
  update: (id: string, data: any) =>
    API.patch(`/clients/${id}`, data),
  delete: (id: string) => API.delete(`/clients/${id}`),
};

export const tasksAPI = {
  list: (clientId?: string) =>
    API.get('/tasks', { params: { clientId } }),
  get: (id: string) => API.get(`/tasks/${id}`),
  create: (data: any) => API.post('/tasks', data),
  update: (id: string, data: any) =>
    API.patch(`/tasks/${id}`, data),
  delete: (id: string) => API.delete(`/tasks/${id}`),
  addComment: (taskId: string, content: string) =>
    API.post(`/tasks/${taskId}/comments`, { content }),
};

export const publicAPI = {
  getClient: (publicKey: string) =>
    API.get(`/public/clients/${publicKey}`),
  addComment: (publicKey: string, taskId: string, content: string, clientName: string) =>
    API.post(`/public/clients/${publicKey}/comments`, {
      taskId,
      content,
      clientName,
    }),
  approveTask: (publicKey: string, taskId: string) =>
    API.post(`/public/clients/${publicKey}/tasks/${taskId}/approve`),
  requestRevisions: (publicKey: string, taskId: string, reason: string) =>
    API.post(`/public/clients/${publicKey}/tasks/${taskId}/request-revisions`, {
      reason,
    }),
};

export default API;
