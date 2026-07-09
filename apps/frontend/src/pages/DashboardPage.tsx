import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import ClientsPage from '../components/ClientsPage.js';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

type TabType = 'calendar' | 'clients';

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
      setClients(response.data);
      if (response.data.length > 0) {
        setSelectedClient(response.data[0]);
      }
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
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 20a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Clients
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
        ) : (
          <ClientsPage onClientSelect={handleClientSelect} />
        )}
      </main>
    </div>
  );
}
