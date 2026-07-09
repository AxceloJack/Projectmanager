import { useState, useEffect } from 'react';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';
import ClientFormModal from './ClientFormModal.js';
import { format } from 'date-fns';

interface ClientsPageProps {
  onClientSelect: (client: Client) => void;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  FLOW_ONLY: 'Flow Build',
  FULL_EMAIL_MARKETING: 'Full Email',
  CAMPAIGNS_ONLY: 'Campaigns',
};

export default function ClientsPage({ onClientSelect }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.list();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (client: Client) => {
    fetchClients();
    setShowForm(false);
    setSelectedClientForEdit(null);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Delete this client and all associated tasks? This cannot be undone.')) return;

    try {
      await clientsAPI.delete(clientId);
      fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-white">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all your client projects and workflows</p>
          </div>
          <button
            onClick={() => {
              setSelectedClientForEdit(null);
              setShowForm(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded font-semibold text-sm transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Client
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No clients yet</h3>
            <p className="text-gray-500 mb-6">Create your first client to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-lg hover:shadow-orange-500/25"
            >
              Create Client
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-gray-900 border border-gray-800 rounded p-6 hover:border-orange-500/50 hover:bg-gray-800/50 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                      <span className="bg-gray-800 text-gray-300 text-xs font-medium px-2.5 py-1 rounded border border-gray-700">
                        {SERVICE_TYPE_LABELS[client.serviceType as keyof typeof SERVICE_TYPE_LABELS] || client.serviceType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      {client.kickOffDate && (
                        <p>📅 Kick off Date: {format(new Date(client.kickOffDate), 'MMM d, yyyy')}</p>
                      )}
                      {client.klaviyoBillingDate && (
                        <p>💳 Klaviyo Billing Date: {format(new Date(client.klaviyoBillingDate), 'MMM d, yyyy')}</p>
                      )}
                      {client.tasks && (
                        <p>📋 {client.tasks.length} tasks scheduled</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedClientForEdit(client);
                        setShowForm(true);
                      }}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs sm:text-sm rounded transition whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onClientSelect(client)}
                      className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs sm:text-sm rounded border border-orange-500/30 transition whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-400 text-xs sm:text-sm rounded border border-red-900 transition whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <ClientFormModal
          client={selectedClientForEdit || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedClientForEdit(null);
          }}
        />
      )}
    </div>
  );
}
