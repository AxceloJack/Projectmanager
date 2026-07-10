import { create } from 'zustand';
import { Workspace } from '../types/index.js';

interface AuthState {
  token: string | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  setAuth: (token: string, workspace: Workspace) => void;
  logout: () => void;
  hydrate: () => void;
}

// Read synchronously so ProtectedRoute never sees a logged-out state
// on a hard refresh while a valid session exists.
const storedToken = localStorage.getItem('token');
const storedWorkspace = localStorage.getItem('workspace');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  workspace: storedWorkspace ? JSON.parse(storedWorkspace) : null,
  isAuthenticated: !!(storedToken && storedWorkspace),
  setAuth: (token: string, workspace: Workspace) => {
    localStorage.setItem('token', token);
    localStorage.setItem('workspace', JSON.stringify(workspace));
    set({ token, workspace, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('workspace');
    set({ token: null, workspace: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = localStorage.getItem('token');
    const workspace = localStorage.getItem('workspace');
    if (token && workspace) {
      set({
        token,
        workspace: JSON.parse(workspace),
        isAuthenticated: true,
      });
    }
  },
}));
