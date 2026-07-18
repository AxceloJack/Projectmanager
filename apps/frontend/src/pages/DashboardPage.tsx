import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import ClientsPage from '../components/ClientsPage.js';
import FormsPage from '../components/FormsPage.js';
import { CAMPAIGN_CONFIG, ONBOARDING_CONFIG } from '../lib/formConfig.js';
import FinancePage from '../components/FinancePage.js';
import AdminPage from './AdminPage.js';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

type TabType = 'calendar' | 'clients' | 'forms' | 'onboarding' | 'finance' | 'admin';

const TABS: { id: TabType; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'clients', label: 'Clients' },
  { id: 'forms', label: 'Campaign Forms' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'finance', label: 'Finance' },
  { id: 'admin', label: 'Admin' },
];

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

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
      <div className="neu-surface flex h-screen items-center justify-center">
        <p className="text-[#626875]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="neu-surface flex h-screen">
      <Sidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onClientsChange={fetchClients}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tab navigation */}
        <div className="px-8 pt-4 flex gap-7 border-b border-[#eceef2]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold text-sm border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-[#fe7300] text-[#fe7300]'
                  : 'border-transparent text-[#626875] hover:text-[#17181c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'calendar' ? (
          selectedClient ? (
            <CalendarView client={selectedClient} onTasksChange={fetchClients} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#626875]">Select a client from the sidebar to get started.</p>
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
