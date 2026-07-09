import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { adminAPI, slackAPI } from '../lib/api.js';
import { format } from 'date-fns';
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('users');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [slackIntegration, setSlackIntegration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [slackForm, setSlackForm] = useState({ teamId: '', botToken: '' });
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersResponse, slackResponse] = await Promise.all([
                adminAPI.getPendingUsers(),
                slackAPI.getIntegration(),
            ]);
            setPendingUsers(usersResponse.data);
            setSlackIntegration(slackResponse.data);
            setError('');
        }
        catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.error || 'Failed to fetch data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await adminAPI.approveUser(userId);
            setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to approve user');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleReject = async (userId) => {
        if (!confirm('Are you sure you want to reject this user? This cannot be undone.')) {
            return;
        }
        setActionLoading(userId);
        try {
            await adminAPI.rejectUser(userId);
            setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to reject user');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleConnectSlack = async () => {
        if (!slackForm.teamId || !slackForm.botToken) {
            setError('Slack Team ID and Bot Token are required');
            return;
        }
        setActionLoading('slack-connect');
        try {
            const response = await slackAPI.connectWorkspace(slackForm);
            setSlackIntegration(response.data);
            setSlackForm({ teamId: '', botToken: '' });
            setError('');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to connect Slack workspace');
        }
        finally {
            setActionLoading(null);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-black", children: [_jsxs("div", { className: "border-b border-gray-800 px-8 py-6", children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Admin Settings" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Manage team members and integrations" })] }), _jsxs("div", { className: "border-b border-gray-800 px-8 flex gap-8", children: [_jsx("button", { onClick: () => setActiveTab('users'), className: `py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-transparent text-gray-400 hover:text-gray-300'}`, children: "Users" }), _jsx("button", { onClick: () => setActiveTab('slack'), className: `py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'slack'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-transparent text-gray-400 hover:text-gray-300'}`, children: "Slack Integration" })] }), _jsxs("div", { className: "p-8 max-w-4xl mx-auto", children: [error && (_jsx("div", { className: "bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6", children: _jsx("p", { className: "text-red-400 text-sm font-medium", children: error }) })), activeTab === 'users' ? (_jsx(_Fragment, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("p", { className: "text-gray-400", children: "Loading pending users..." }) })) : pendingUsers.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "w-16 h-16 text-gray-700 mx-auto mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-300 mb-2", children: "No Pending Users" }), _jsx("p", { className: "text-gray-500", children: "All team members have been approved!" })] })) : (_jsx("div", { className: "space-y-4", children: pendingUsers.map((user) => (_jsx("div", { className: "bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500/50 transition", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center", children: _jsx("span", { className: "text-white font-semibold text-sm", children: user.email.charAt(0).toUpperCase() }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold", children: user.email }), _jsxs("p", { className: "text-gray-500 text-xs", children: ["Requested ", format(new Date(user.createdAt), 'MMM d, yyyy • h:mm a')] })] })] }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleApprove(user.id), disabled: actionLoading === user.id, className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: actionLoading === user.id ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-4 h-4 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), "Approve"] })) }), _jsx("button", { onClick: () => handleReject(user.id), disabled: actionLoading === user.id, className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: actionLoading === user.id ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-4 h-4 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }), "Decline"] })) })] })] }) }, user.id))) })) })) : (_jsx("div", { className: "space-y-6", children: slackIntegration ? (_jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center", children: _jsx("span", { className: "text-white text-sm font-bold", children: "S" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Slack Workspace Connected" }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Connected since ", format(new Date(slackIntegration.createdAt), 'MMM d, yyyy')] })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("p", { className: "text-gray-400 text-sm", children: [_jsx("strong", { children: "Team ID:" }), " ", slackIntegration.teamId] }), _jsxs("p", { className: "text-gray-400 text-sm", children: [_jsx("strong", { children: "Channel ID:" }), " ", slackIntegration.channelId] })] }), _jsx("button", { onClick: () => setActiveTab('slack'), className: "px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition", children: "Update Configuration" })] })) : (_jsxs("div", { className: "bg-gray-900 border border-gray-800 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Connect Slack Workspace" }), _jsx("p", { className: "text-gray-400 text-sm mb-6", children: "Connect your Slack workspace to receive notifications when tasks are ready for client review." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Slack Team ID" }), _jsx("input", { type: "text", value: slackForm.teamId, onChange: (e) => setSlackForm({ ...slackForm, teamId: e.target.value }), placeholder: "e.g., T12345678", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Bot Token" }), _jsx("input", { type: "password", value: slackForm.botToken, onChange: (e) => setSlackForm({ ...slackForm, botToken: e.target.value }), placeholder: "e.g., xoxb-...", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500" })] }), _jsx("button", { onClick: handleConnectSlack, disabled: actionLoading === 'slack-connect', className: "w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed", children: actionLoading === 'slack-connect' ? 'Connecting...' : 'Connect Workspace' })] })] })) }))] })] }));
}
//# sourceMappingURL=AdminPage.js.map