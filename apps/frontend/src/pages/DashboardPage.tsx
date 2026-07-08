import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import CalendarView from '../components/CalendarView.js';
import ClientDetail from '../components/ClientDetail.js';
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
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onClientsChange={fetchClients}
      />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              selectedClient ? (
                <CalendarView client={selectedClient} onTasksChange={fetchClients} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No clients yet. Create one to get started.</p>
                </div>
              )
            }
          />
          <Route
            path="/client/:clientId"
            element={<ClientDetail onTasksChange={fetchClients} />}
          />
        </Routes>
      </main>
    </div>
  );
}
