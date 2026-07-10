import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';
import AxceloLogo from './AxceloLogo.js';

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
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-72 bg-black border-r border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <AxceloLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">Axcelo</h1>
            <p className="text-xs text-gray-500 mt-0.5">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Clients List */}
        <div className="mb-4">
          <div className="space-y-1 px-2">
            {clients.length === 0 ? (
              <p className="text-xs text-gray-600 px-2 py-4 text-center">No clients yet</p>
            ) : (
              clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm transition-all ${
                    selectedClient?.id === client.id
                      ? 'bg-orange-500 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  <div className="font-medium truncate">{client.name}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-900 rounded transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
