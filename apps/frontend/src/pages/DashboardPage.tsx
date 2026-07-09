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
            <svg className="w-5 h-5 inline mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M21.8178 7.68475C22.5632 8.25194 23 9.13431 23 10.071V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V10.071C1 9.13431 1.43675 8.25194 2.18224 7.68475C4.36739 6.02221 8.93135 2.55149 10.2 1.6C11.2667 0.8 12.7333 0.8 13.8 1.6C15.0686 2.55148 19.6326 6.02221 21.8178 7.68475ZM3 10.1688L10.1411 15.8065C11.231 16.667 12.769 16.667 13.8589 15.8065L21 10.1688V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.1688ZM12.6 3.2L19.7792 8.58443L12.6196 14.2367C12.2563 14.5236 11.7437 14.5236 11.3804 14.2367L4.22077 8.58443L11.4 3.2C11.7556 2.93333 12.2444 2.93333 12.6 3.2Z" fill="currentColor"></path>
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
