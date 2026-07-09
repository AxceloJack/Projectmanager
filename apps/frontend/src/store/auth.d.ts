import { Workspace } from '../types/index.js';
interface AuthState {
    token: string | null;
    workspace: Workspace | null;
    isAuthenticated: boolean;
    setAuth: (token: string, workspace: Workspace) => void;
    logout: () => void;
    hydrate: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
//# sourceMappingURL=auth.d.ts.map