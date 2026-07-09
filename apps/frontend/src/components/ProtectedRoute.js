import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuthStore } from '../store/auth.js';
import { Navigate } from 'react-router-dom';
export default function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=ProtectedRoute.js.map