import { useState, useEffect } from 'react';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';
import ClientFormModal from './ClientFormModal.js';
import { format } from 'date-fns';

interface ClientsPageProps {
  onClientSelect: (client: Client) => void;
  // Notify the dashboard so the sidebar client list stays in sync.
  onClientsChange?: () => void;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  FLOW_ONLY: 'Flow Build',
  FULL_EMAIL_MARKETING: 'Full Email',
  CAMPAIGNS_ONLY: 'Campaigns',
};

export default function ClientsPage({ onClientSelect, onClientsChange }: ClientsPageProps) {
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

  const handleSave = () => {
    fetchClients();
    onClientsChange?.();
    setShowForm(false);
    setSelectedClientForEdit(null);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Delete this client and all associated tasks? This cannot be undone.')) return;

    try {
      await clientsAPI.delete(clientId);
      fetchClients();
      onClientsChange?.();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="neu-surface flex-1 flex items-center justify-center">
        <p className="text-[#7b879c]">Loading clients…</p>
      </div>
    );
  }

  return (
    <div className="neu-surface flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-[#cdd4de] px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#474747]">Clients</h1>
            <p className="text-[#7b879c] text-sm mt-1">Manage all your client projects and workflows</p>
          </div>
          <button
            onClick={() => {
              setSelectedClientForEdit(null);
              setShowForm(true);
            }}
            className="btn-accent px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New client
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="neu-raised w-20 h-20 rounded-3xl flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-[#9aa6b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#474747] mb-2">No clients yet</h3>
            <p className="text-[#7b879c] mb-6">Create your first client to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-accent px-6 py-2.5 rounded-2xl font-semibold"
            >
              Create client
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => (
              <div key={client.id} className="neu-card rounded-2xl p-6 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-[#474747]">{client.name}</h3>
                      <span className="neu-inset text-[#5f6b7a] text-xs font-semibold px-3 py-1 rounded-full">
                        {SERVICE_TYPE_LABELS[client.serviceType as keyof typeof SERVICE_TYPE_LABELS] ||
                          client.serviceType}
                      </span>
                    </div>
                    <div className="text-sm text-[#7b879c] space-y-1">
                      {client.kickOffDate && (
                        <p>Kick-off: {format(new Date(client.kickOffDate), 'MMM d, yyyy')}</p>
                      )}
                      {client.klaviyoBillingDate && (
                        <p>Klaviyo billing: {format(new Date(client.klaviyoBillingDate), 'MMM d, yyyy')}</p>
                      )}
                      {client.tasks && <p>{client.tasks.length} tasks scheduled</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedClientForEdit(client);
                        setShowForm(true);
                      }}
                      className="neu-pressable px-4 py-2 text-[#474747] text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onClientSelect(client)}
                      className="neu-pressable px-4 py-2 text-[#fe7300] text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="neu-pressable px-4 py-2 text-[#c0392b] text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap"
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

      {/* Modal */}
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
