import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import ClientsPage from '../components/ClientsPage.js';
import FormsPage from '../components/FormsPage.js';
import { CAMPAIGN_CONFIG, ONBOARDING_CONFIG } from '../lib/formConfig.js';
import FinancePage from '../components/FinancePage.js';
import AdminPage from './AdminPage.js';
import { clientsAPI } from '../lib/api.js';
import { useAuthStore } from '../store/auth.js';
import { Client } from '../types/index.js';

type TabType = 'calendar' | 'clients' | 'forms' | 'onboarding' | 'finance' | 'admin';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.list();
      const list: Client[] = response.data;
      setClients(list);
      // Keep the client the user is currently viewing (refreshed to the
      // latest data); only fall back to the first client if none is
      // selected or the selected one no longer exists.
      setSelectedClient((prev) => {
        if (prev) {
          const stillThere = list.find((c) => c.id === prev.id);
          if (stillThere) return stillThere;
        }
        return list[0] || null;
      });
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('calendar');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onClientsChange={fetchClients}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-800 px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'calendar'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'clients'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'forms'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Campaign Forms
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'onboarding'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Onboarding
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'finance'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Finance
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'admin'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Content */}
        {activeTab === 'calendar' ? (
          selectedClient ? (
            <CalendarView client={selectedClient} onTasksChange={fetchClients} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a client from the sidebar to get started.</p>
            </div>
          )
        ) : activeTab === 'clients' ? (
          <ClientsPage onClientSelect={handleClientSelect} onClientsChange={fetchClients} />
        ) : activeTab === 'forms' ? (
          <FormsPage config={CAMPAIGN_CONFIG} />
        ) : activeTab === 'onboarding' ? (
          <FormsPage config={ONBOARDING_CONFIG} />
        ) : activeTab === 'finance' ? (
          <FinancePage />
        ) : (
          <AdminPage />
        )}
      </main>
    </div>
  );
}
