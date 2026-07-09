import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.js';
import LoginPage from './pages/LoginPage.js';
import SignUpPage from './pages/SignUpPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ClientViewPage from './pages/ClientViewPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
function App() {
    const hydrate = useAuthStore((state) => state.hydrate);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "/dashboard/*", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/public/:publicKey", element: _jsx(ClientViewPage, {}) })] }) }));
}
export default App;
//# sourceMappingURL=App.js.map