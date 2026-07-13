import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
import { Client } from '../types/index.js';
import AxceloLogo from './AxceloLogo.js';

interface SidebarProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onClientsChange: () => void;
}

export default function Sidebar({ clients, selectedClient, onSelectClient }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="w-72 neu-surface flex flex-col h-screen z-10"
      style={{ boxShadow: '10px 0 24px -12px rgba(163,177,198,0.55)' }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="neu-raised-sm w-11 h-11 rounded-[14px] flex items-center justify-center">
            <AxceloLogo className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#474747] tracking-tight">Axcelo</h1>
            <p className="text-xs text-[#7b879c] mt-0.5">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Client list */}
      <nav className="flex-1 overflow-y-auto px-4">
        <div className="space-y-2.5">
          {clients.length === 0 ? (
            <p className="text-xs text-[#7b879c] px-2 py-4 text-center">No clients yet</p>
          ) : (
            clients.map((client) => {
              const active = selectedClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold truncate ${
                    active ? 'neu-nav-active' : 'neu-nav'
                  }`}
                >
                  {client.name}
                </button>
              );
            })
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-semibold text-[#7b879c] hover:text-[#fe7300] rounded-2xl transition-colors flex items-center gap-2"
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
