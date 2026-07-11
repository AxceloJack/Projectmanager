import axios from 'axios';

const baseURL = '/api';

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
  register: (email: string, password: string, workspaceName: string) =>
    API.post('/auth/register', { email, password, workspaceName }),
  login: (email: string, password: string) =>
    API.post('/auth/login', { email, password }),
  refresh: () => API.post('/auth/refresh'),
};

export const clientsAPI = {
  list: () => API.get('/clients'),
  get: (id: string) => API.get(`/clients/${id}`),
  create: (data: any) =>
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

// Public links always use the canonical domain in production,
// regardless of which domain the team member is browsing on.
export const shareOrigin = import.meta.env.PROD
  ? 'https://app.axcelo.co'
  : window.location.origin;

export const publicAPI = {
  getClient: (publicKey: string) =>
    API.get(`/public/clients/${publicKey}`),
  getForm: (publicKey: string) => API.get(`/public/forms/${publicKey}`),
  submitForm: (publicKey: string, data: Record<string, string>) =>
    API.post(`/public/forms/${publicKey}`, data),
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

export const adminAPI = {
  getPendingUsers: () =>
    API.get('/admin/users/pending'),
  approveUser: (userId: string) =>
    API.post(`/admin/users/${userId}/approve`),
  rejectUser: (userId: string) =>
    API.post(`/admin/users/${userId}/reject`),
};

export const formsAPI = {
  list: (type: string) => API.get('/forms', { params: { type } }),
  create: (clientId: string, type: string, month?: string) =>
    API.post('/forms', { clientId, type, month }),
  delete: (id: string) => API.delete(`/forms/${id}`),
};

export const financeAPI = {
  list: () => API.get('/finance'),
  create: (data: any) => API.post('/finance', data),
  update: (id: string, data: any) => API.patch(`/finance/${id}`, data),
  delete: (id: string) => API.delete(`/finance/${id}`),
  setCurrency: (currency: string) => API.patch('/finance/currency', { currency }),
};

export const slackAPI = {
  getIntegration: () =>
    API.get('/slack/integration'),
  connectWorkspace: (data: any) =>
    API.post('/slack/workspace-connect', data),
};

export default API;
