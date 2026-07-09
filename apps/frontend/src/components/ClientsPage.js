import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { clientsAPI } from '../lib/api.js';
import ClientFormModal from './ClientFormModal.js';
import { format } from 'date-fns';
const SERVICE_TYPE_LABELS = {
    FLOW_ONLY: 'Flow Build',
    FULL_EMAIL_MARKETING: 'Full Email',
    CAMPAIGNS_ONLY: 'Campaigns',
};
export default function ClientsPage({ onClientSelect }) {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
    useEffect(() => {
        fetchClients();
    }, []);
    const fetchClients = async () => {
        try {
            const response = await clientsAPI.list();
            setClients(response.data);
        }
        catch (error) {
            console.error('Failed to fetch clients:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = (client) => {
        fetchClients();
        setShowForm(false);
        setSelectedClientForEdit(null);
    };
    const handleDeleteClient = async (clientId) => {
        if (!confirm('Delete this client and all associated tasks? This cannot be undone.'))
            return;
        try {
            await clientsAPI.delete(clientId);
            fetchClients();
        }
        catch (error) {
            console.error('Failed to delete client:', error);
            alert('Failed to delete client');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("p", { className: "text-gray-400", children: "Loading clients..." }) }));
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col bg-black", children: [_jsx("div", { className: "border-b border-gray-800 px-8 py-6", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-white", children: "Clients" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Manage all your client projects and workflows" })] }), _jsxs("button", { onClick: () => {
                                setSelectedClientForEdit(null);
                                setShowForm(true);
                            }, className: "bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded font-semibold text-sm transition flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "New Client"] })] }) }), _jsx("div", { className: "flex-1 overflow-auto p-8", children: clients.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center", children: [_jsx("svg", { className: "w-16 h-16 text-gray-700 mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-300 mb-2", children: "No clients yet" }), _jsx("p", { className: "text-gray-500 mb-6", children: "Create your first client to get started" }), _jsx("button", { onClick: () => setShowForm(true), className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-lg hover:shadow-orange-500/25", children: "Create Client" })] })) : (_jsx("div", { className: "grid gap-3", children: clients.map((client) => (_jsx("div", { className: "bg-gray-900 border border-gray-800 rounded p-6 hover:border-orange-500/50 hover:bg-gray-800/50 transition cursor-pointer group", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: client.name }), _jsx("span", { className: "bg-gray-800 text-gray-300 text-xs font-medium px-2.5 py-1 rounded border border-gray-700", children: SERVICE_TYPE_LABELS[client.serviceType] || client.serviceType })] }), _jsxs("div", { className: "text-sm text-gray-400 space-y-1", children: [client.kickOffDate && (_jsxs("p", { children: ["\uD83D\uDCC5 Kick off Date: ", format(new Date(client.kickOffDate), 'MMM d, yyyy')] })), client.klaviyoBillingDate && (_jsxs("p", { children: ["\uD83D\uDCB3 Klaviyo Billing Date: ", format(new Date(client.klaviyoBillingDate), 'MMM d, yyyy')] })), client.tasks && (_jsxs("p", { children: ["\uD83D\uDCCB ", client.tasks.length, " tasks scheduled"] }))] })] }), _jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex-wrap", children: [_jsx("button", { onClick: () => {
                                                setSelectedClientForEdit(client);
                                                setShowForm(true);
                                            }, className: "px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs sm:text-sm rounded transition whitespace-nowrap", children: "Edit" }), _jsx("button", { onClick: () => onClientSelect(client), className: "px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs sm:text-sm rounded border border-orange-500/30 transition whitespace-nowrap", children: "View" }), _jsx("button", { onClick: () => handleDeleteClient(client.id), className: "px-3 py-2 bg-red-950 hover:bg-red-900 text-red-400 text-xs sm:text-sm rounded border border-red-900 transition whitespace-nowrap", children: "Delete" })] })] }) }, client.id))) })) }), showForm && (_jsx(ClientFormModal, { client: selectedClientForEdit || undefined, onSave: handleSave, onCancel: () => {
                    setShowForm(false);
                    setSelectedClientForEdit(null);
                } }))] }));
}
//# sourceMappingURL=ClientsPage.js.map