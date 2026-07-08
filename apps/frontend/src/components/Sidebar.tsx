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
  const [isCreating, setIsCreating] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
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
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-72 bg-gradient-to-b from-gray-950 to-black border-r border-gray-800 flex flex-col h-screen shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Axcelo</h1>
            <p className="text-xs text-gray-500">Campaign Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* New Client Button */}
        <button
          onClick={() => setShowNewClientForm(!showNewClientForm)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 text-sm font-semibold transition-all shadow-lg hover:shadow-orange-500/25 mb-6 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Client
        </button>

        {/* New Client Form */}
        {showNewClientForm && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6 space-y-3">
            <input
              type="text"
              placeholder="Client name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateClient}
                disabled={isCreating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowNewClientForm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Clients List */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
            Clients ({clients.length})
          </h2>
          <div className="space-y-2">
            {clients.length === 0 ? (
              <p className="text-xs text-gray-600 px-3 py-4 text-center">No clients yet</p>
            ) : (
              clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all ${
                    selectedClient?.id === client.id
                      ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400 font-semibold shadow-lg shadow-orange-500/10'
                      : 'text-gray-300 hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="font-medium truncate">{client.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {client.tasks?.length || 0} tasks
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-black/50 backdrop-blur space-y-2">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        <p className="text-xs text-gray-600 text-center pt-2">v1.0</p>
      </div>
    </div>
  );
}
