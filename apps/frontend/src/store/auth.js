import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    token: null,
    workspace: null,
    isAuthenticated: false,
    setAuth: (token, workspace) => {
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
//# sourceMappingURL=auth.js.map