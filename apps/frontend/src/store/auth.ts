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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  workspace: null,
  isAuthenticated: false,
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
