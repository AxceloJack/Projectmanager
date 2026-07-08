import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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
        {selectedClient ? (
          <CalendarView client={selectedClient} onTasksChange={fetchClients} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a client from the sidebar to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
