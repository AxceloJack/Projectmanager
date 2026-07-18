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
    <div className="w-72 bg-white flex flex-col h-screen border-r border-[#eceef2] z-10">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#fff2e8]">
            <AxceloLogo className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#17181c] tracking-tight">Axcelo</h1>
            <p className="text-xs text-[#9aa0ab] mt-0.5">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Client list */}
      <nav className="flex-1 overflow-y-auto px-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#9aa0ab] px-3 mb-2">Clients</p>
        <div className="space-y-1">
          {clients.length === 0 ? (
            <p className="text-xs text-[#9aa0ab] px-3 py-4 text-center">No clients yet</p>
          ) : (
            clients.map((client) => {
              const active = selectedClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-[#fff2e8] text-[#e56100]' : 'text-[#3a3f4a] hover:bg-[#f2f3f6]'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: active ? '#fe7300' : '#c0c5cf' }}
                  />
                  <span className="truncate">{client.name}</span>
                </button>
              );
            })
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#eceef2]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#626875] hover:bg-[#f2f3f6] hover:text-[#17181c] rounded-xl transition-colors"
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
