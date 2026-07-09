import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { format } from 'date-fns';
import { clientsAPI } from '../lib/api.js';
const SERVICE_TYPES = [
    { value: 'FLOW_ONLY', label: 'Flow Build Only' },
    { value: 'FULL_EMAIL_MARKETING', label: 'Full Email Marketing' },
    { value: 'CAMPAIGNS_ONLY', label: 'Campaigns Only' },
];
export default function ClientForm({ client, onSave, onCancel }) {
    const [name, setName] = useState(client?.name || '');
    const [email, setEmail] = useState(client?.email || '');
    const [serviceType, setServiceType] = useState(client?.serviceType || 'FLOW_ONLY');
    const [kickOffDate, setKickOffDate] = useState(client?.kickOffDate ? format(new Date(client.kickOffDate), 'yyyy-MM-dd') : '');
    const [klaviyoBillingDate, setKlaviyoBillingDate] = useState(client?.klaviyoBillingDate ? format(new Date(client.klaviyoBillingDate), 'yyyy-MM-dd') : '');
    const [slackId, setSlackId] = useState(client?.slackId || '');
    const [slackUserId, setSlackUserId] = useState(client?.slackUserId || '');
    const [klaviyoApi, setKlaviyoApi] = useState(client?.klaviyoApi || '');
    const [figmaLink, setFigmaLink] = useState(client?.figmaLink || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                name,
                email: email || undefined,
                serviceType,
                kickOffDate: kickOffDate || undefined,
                klaviyoBillingDate: klaviyoBillingDate || undefined,
                slackId: slackId || undefined,
                slackUserId: slackUserId || undefined,
                klaviyoApi: klaviyoApi || undefined,
                figmaLink: figmaLink || undefined,
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
    return (_jsxs("div", { className: "bg-gray-900/95 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl", children: [_jsxs("div", { className: "p-6 border-b border-gray-800", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: client ? 'Edit Client' : 'New Client' }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: client ? 'Update client information and timeline' : 'Create a new client and set up their workflow' })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto", children: [error && (_jsx("div", { className: "bg-red-900/20 border border-red-500/30 rounded-lg p-3", children: _jsx("p", { className: "text-red-400 text-sm", children: error }) })), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, placeholder: "Client name *", className: "px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Email", className: "px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider", children: "Service & Timeline" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("select", { value: serviceType, onChange: (e) => setServiceType(e.target.value), className: "px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30", children: SERVICE_TYPES.map((type) => (_jsx("option", { value: type.value, children: type.label }, type.value))) }), _jsx("input", { type: "date", value: kickOffDate, onChange: (e) => setKickOffDate(e.target.value), placeholder: "Kick-off date", className: "px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" })] }), _jsx("input", { type: "date", value: klaviyoBillingDate, onChange: (e) => setKlaviyoBillingDate(e.target.value), placeholder: "Klaviyo billing date", className: "w-full mt-3 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider", children: "Integrations" }), _jsx("input", { type: "text", value: slackId, onChange: (e) => setSlackId(e.target.value), placeholder: "Slack Channel ID", className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2" }), _jsx("input", { type: "text", value: slackUserId, onChange: (e) => setSlackUserId(e.target.value), placeholder: "Slack User ID", className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2" }), _jsx("input", { type: "text", value: klaviyoApi, onChange: (e) => setKlaviyoApi(e.target.value), placeholder: "Klaviyo API Key", className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2" }), _jsx("input", { type: "url", value: figmaLink, onChange: (e) => setFigmaLink(e.target.value), placeholder: "Figma project link", className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30" })] })] }), _jsxs("div", { className: "border-t border-gray-800 p-6 bg-gray-900/50 flex gap-3", children: [_jsx("button", { onClick: handleSubmit, disabled: loading || !name, className: "flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm", children: loading ? 'Saving...' : client ? 'Update' : 'Create' }), _jsx("button", { onClick: onCancel, className: "flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg font-semibold transition text-sm", children: "Cancel" })] })] }));
}
//# sourceMappingURL=ClientForm.js.map