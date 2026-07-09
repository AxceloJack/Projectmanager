import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import ClientsPage from '../components/ClientsPage.js';
import AdminPage from './AdminPage.js';
import { clientsAPI } from '../lib/api.js';
import { useAuthStore } from '../store/auth.js';
export default function DashboardPage() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('calendar');
    const token = useAuthStore((state) => state.token);
    useEffect(() => {
        fetchClients();
    }, []);
    const fetchClients = async () => {
        try {
            const response = await clientsAPI.list();
            setClients(response.data);
            if (response.data.length > 0) {
                setSelectedClient(response.data[0]);
            }
        }
        catch (error) {
            console.error('Failed to fetch clients:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setActiveTab('calendar');
    };
    if (loading) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center bg-black", children: _jsx("p", { className: "text-gray-400", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "flex h-screen bg-black", children: [_jsx(Sidebar, { clients: clients, selectedClient: selectedClient, onSelectClient: setSelectedClient, onClientsChange: fetchClients }), _jsxs("main", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "border-b border-gray-800 px-8 flex gap-8", children: [_jsx("button", { onClick: () => setActiveTab('calendar'), className: `py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'calendar'
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'}`, children: "Calendar" }), _jsx("button", { onClick: () => setActiveTab('clients'), className: `py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'clients'
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'}`, children: "Clients" }), _jsx("button", { onClick: () => setActiveTab('admin'), className: `py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'admin'
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'}`, children: "Admin" })] }), activeTab === 'calendar' ? (selectedClient ? (_jsx(CalendarView, { client: selectedClient, onTasksChange: fetchClients })) : (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "Select a client from the sidebar to get started." }) }))) : activeTab === 'clients' ? (_jsx(ClientsPage, { onClientSelect: handleClientSelect })) : (_jsx(AdminPage, {}))] })] }));
}
//# sourceMappingURL=DashboardPage.js.map