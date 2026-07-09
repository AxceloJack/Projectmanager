import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { format } from 'date-fns';
import { clientsAPI } from '../lib/api.js';
const SERVICE_TYPES = [
    { value: 'FLOW_ONLY', label: 'Flow Build Only' },
    { value: 'FULL_EMAIL_MARKETING', label: 'Full Email Marketing' },
    { value: 'CAMPAIGNS_ONLY', label: 'Campaigns Only' },
];
export default function ClientFormModal({ client, onSave, onCancel }) {
    const [name, setName] = useState(client?.name || '');
    const [serviceType, setServiceType] = useState(client?.serviceType || 'FLOW_ONLY');
    const [kickOffDate, setKickOffDate] = useState(client?.kickOffDate ? format(new Date(client.kickOffDate), 'yyyy-MM-dd') : '');
    const [klaviyoBillingDate, setKlaviyoBillingDate] = useState(client?.klaviyoBillingDate ? format(new Date(client.klaviyoBillingDate), 'yyyy-MM-dd') : '');
    const [klaviyoApi, setKlaviyoApi] = useState(client?.klaviyoApi || '');
    const [figmaLink, setFigmaLink] = useState(client?.figmaLink || '');
    const [slackId, setSlackId] = useState(client?.slackId || '');
    const [slackUserId, setSlackUserId] = useState(client?.slackUserId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                name,
                serviceType,
                kickOffDate: kickOffDate || undefined,
                klaviyoBillingDate: klaviyoBillingDate || undefined,
                klaviyoApi: klaviyoApi || undefined,
                figmaLink: figmaLink || undefined,
                slackId: slackId || undefined,
                slackUserId: slackUserId || undefined,
            };
            let response;
            if (client) {
                response = await clientsAPI.update(client.id, payload);
            }
            else {
                response = await clientsAPI.create(payload);
            }
            onSave(response.data);
        }
        catch (err) {
            console.error('Form error:', err);
            setError(err.response?.data?.error || 'Failed to save client');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-black border border-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-gray-800 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: client ? 'Edit Client' : 'New Client' }), _jsx("button", { onClick: onCancel, className: "text-gray-400 hover:text-white text-2xl", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex-1 overflow-y-auto p-6 space-y-5", children: [error && (_jsx("div", { className: "bg-red-950 border border-red-900 rounded p-3", children: _jsx("p", { className: "text-red-400 text-sm", children: error }) })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Client Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, placeholder: "Enter client name", className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Service" }), _jsx("select", { value: serviceType, onChange: (e) => setServiceType(e.target.value), className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50", children: SERVICE_TYPES.map((type) => (_jsx("option", { value: type.value, children: type.label }, type.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Timeline" }), _jsx("input", { type: "date", value: kickOffDate, onChange: (e) => setKickOffDate(e.target.value), className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { className: "border-t border-gray-800 pt-5", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-300 mb-3", children: "Integrations" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Figma" }), _jsx("input", { type: "url", value: figmaLink, onChange: (e) => setFigmaLink(e.target.value), placeholder: "Figma project link", className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Slack Channel ID" }), _jsx("input", { type: "text", value: slackId, onChange: (e) => setSlackId(e.target.value), placeholder: "e.g., C1234567890", className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Slack User ID" }), _jsx("input", { type: "text", value: slackUserId, onChange: (e) => setSlackUserId(e.target.value), placeholder: "e.g., U1234567890 or user@company.com", className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Klaviyo" }), _jsx("input", { type: "text", value: klaviyoApi, onChange: (e) => setKlaviyoApi(e.target.value), placeholder: "Klaviyo API Key", className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Billing Date" }), _jsx("input", { type: "date", value: klaviyoBillingDate, onChange: (e) => setKlaviyoBillingDate(e.target.value), className: "w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50", title: "Cleanup task will be scheduled 1 day before" })] })] })] })] }), _jsxs("div", { className: "border-t border-gray-800 p-6 bg-black flex gap-3", children: [_jsx("button", { type: "button", onClick: handleSubmit, disabled: loading || !name, className: "flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Saving...' : client ? 'Update Client' : 'Create Client' }), _jsx("button", { type: "button", onClick: onCancel, className: "flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-semibold transition", children: "Cancel" })] })] }) }));
}
//# sourceMappingURL=ClientFormModal.js.map