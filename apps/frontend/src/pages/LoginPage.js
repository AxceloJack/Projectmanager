import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api.js';
import { useAuthStore } from '../store/auth.js';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authAPI.login(email, password);
            const { token, workspace } = response.data;
            setAuth(token, workspace);
            navigate('/dashboard');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error;
            if (errorMsg === 'Your account is pending admin approval') {
                setError('Your account is pending admin approval. Please contact your administrator.');
            }
            else {
                setError(errorMsg || 'Invalid credentials');
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-10 blur-3xl rounded-full" }), _jsx("div", { className: "absolute bottom-0 left-0 w-96 h-96 bg-orange-500 opacity-5 blur-3xl rounded-full" })] }), _jsxs("div", { className: "relative z-10 w-full max-w-md", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4 shadow-lg", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z", clipRule: "evenodd" }) }) }), _jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Axcelo" }), _jsx("p", { className: "text-gray-400 text-sm tracking-wide", children: "Email Campaign Command Center" })] }), _jsxs("div", { className: "bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [error && (_jsx("div", { className: "bg-red-900/20 border border-red-500/30 rounded-lg p-3", children: _jsx("p", { className: "text-red-400 text-sm font-medium", children: error }) })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition", placeholder: "name@axcelo.co" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-orange-500/25", children: loading ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "w-5 h-5 animate-spin mr-2", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Signing in..."] })) : ('Sign In') })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-800", children: _jsxs("p", { className: "text-gray-500 text-sm text-center", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "text-orange-500 hover:text-orange-400 font-semibold transition", children: "Sign Up" })] }) })] }), _jsx("p", { className: "text-center text-gray-600 text-xs mt-6", children: "\u00A9 2026 Axcelo. All campaigns managed with precision." })] })] }));
}
//# sourceMappingURL=LoginPage.js.map