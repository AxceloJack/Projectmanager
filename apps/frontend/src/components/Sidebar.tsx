import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

interface SidebarProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onClientsChange: () => void;
}

export default function Sidebar({
  clients,
  selectedClient,
  onSelectClient,
  onClientsChange,
}: SidebarProps) {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const logout = useAuthStore((state) => state.logout);
  const workspace = useAuthStore((state) => state.workspace);
  const navigate = useNavigate();

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientsAPI.create({
        name: newClientName,
        email: newClientEmail,
      });
      setNewClientName('');
      setNewClientEmail('');
      setShowNewClientForm(false);
      onClientsChange();
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg overflow-y-auto">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">{workspace?.name}</h1>
        <p className="text-xs text-gray-500 mt-1">Email Marketing CRM</p>
      </div>

      <nav className="p-4">
        <div className="mb-6">
          <button
            onClick={() => setShowNewClientForm(!showNewClientForm)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + New Client
          </button>

          {showNewClientForm && (
            <form onSubmit={handleCreateClient} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Client name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700"
              >
                Create
              </button>
            </form>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Clients
          </h2>
          <ul className="space-y-2">
            {clients.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => onSelectClient(client)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedClient?.id === client.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="truncate">{client.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {client.tasks?.length || 0} tasks
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
