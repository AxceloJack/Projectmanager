import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api.js';
import { useAuthStore } from '../store/auth.js';
export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const response = await authAPI.register(email, password, workspaceName);
            const { token, workspace } = response.data;
            setAuth(token, workspace);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Email CRM" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Create your account" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [error && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: error }) })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "workspace", className: "block text-sm font-medium text-gray-700", children: "Workspace Name" }), _jsx("input", { id: "workspace", type: "text", required: true, className: "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Your workspace name", value: workspaceName, onChange: (e) => setWorkspaceName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email Address" }), _jsx("input", { id: "email", type: "email", autoComplete: "email", required: true, className: "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Email address", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", type: "password", autoComplete: "new-password", required: true, className: "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700", children: "Confirm Password" }), _jsx("input", { id: "confirmPassword", type: "password", autoComplete: "new-password", required: true, className: "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Confirm password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400", children: loading ? 'Creating account...' : 'Sign up' }), _jsxs("p", { className: "text-center text-sm text-gray-600", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-blue-600 hover:text-blue-500", children: "Sign in" })] })] })] }) }));
}
//# sourceMappingURL=RegisterPage.js.map