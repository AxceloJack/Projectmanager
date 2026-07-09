import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { publicAPI } from '../lib/api.js';
import ClientCalendar from '../components/ClientCalendar.js';
export default function ClientViewPage() {
    const { publicKey } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!publicKey)
            return;
        const fetchClient = async () => {
            try {
                const response = await publicAPI.getClient(publicKey);
                setClient(response.data);
            }
            catch (err) {
                setError(err.response?.data?.error || 'Failed to load client view');
            }
            finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [publicKey]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-black", children: _jsx("p", { className: "text-gray-400", children: "Loading..." }) }));
    }
    if (error || !client) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-black", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-2", children: "Access Denied" }), _jsx("p", { className: "text-gray-400", children: error || 'Client not found' })] }) }));
    }
    const handleTaskUpdate = async () => {
        if (!publicKey)
            return;
        try {
            const response = await publicAPI.getClient(publicKey);
            setClient(response.data);
        }
        catch (err) {
            console.error('Failed to refresh client data:', err);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-black", children: [_jsx("div", { className: "border-b border-gray-800 bg-black/50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6", fill: "#ff7b00", viewBox: "-64 0 512 512", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M80.95 472.23c-4.28 17.16 6.14 34.53 23.28 38.81 2.61.66 5.22.95 7.8.95 14.33 0 27.37-9.7 31.02-24.23l25.24-100.97-52.78-52.78-34.56 138.22zm14.89-196.12L137 117c2.19-8.42-3.14-16.95-11.92-19.06-43.88-10.52-88.35 15.07-99.32 57.17L.49 253.24c-2.19 8.42 3.14 16.95 11.92 19.06l63.56 15.25c8.79 2.1 17.68-3.02 19.87-11.44zM368 160h-16c-8.84 0-16 7.16-16 16v16h-34.75l-46.78-46.78C243.38 134.11 228.61 128 212.91 128c-27.02 0-50.47 18.3-57.03 44.52l-26.92 107.72a32.012 32.012 0 0 0 8.42 30.39L224 397.25V480c0 17.67 14.33 32 32 32s32-14.33 32-32v-82.75c0-17.09-6.66-33.16-18.75-45.25l-46.82-46.82c.15-.5.49-.89.62-1.41l19.89-79.57 22.43 22.43c6 6 14.14 9.38 22.62 9.38h48v240c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16V176c.01-8.84-7.15-16-15.99-16zM240 96c26.51 0 48-21.49 48-48S266.51 0 240 0s-48 21.49-48 48 21.49 48 48 48z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-white", children: "Axcelo" }), _jsx("p", { className: "text-xs text-gray-500", children: "Project Management" })] })] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mb-8 border-b border-gray-800 pb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: client.name }), _jsx("p", { className: "mt-2 text-gray-500", children: "Project Timeline & Deliverables" })] }), _jsx(ClientCalendar, { client: client, publicKey: publicKey, onTaskUpdate: handleTaskUpdate })] })] }));
}
//# sourceMappingURL=ClientViewPage.js.map