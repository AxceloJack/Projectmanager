import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { publicAPI } from '../lib/api.js';
import { Client } from '../types/index.js';
import ClientCalendar from '../components/ClientCalendar.js';
import AxceloLogo from '../components/AxceloLogo.js';

export default function ClientViewPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!publicKey) return;

    const fetchClient = async () => {
      try {
        const response = await publicAPI.getClient(publicKey);
        setClient(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load client view');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [publicKey]);

  if (loading) {
    return (
      <div className="neu-surface min-h-screen flex items-center justify-center">
        <p className="text-[#626875]">Loading…</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="neu-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#17181c] mb-2">Access denied</h1>
          <p className="text-[#626875]">{error || 'Client not found'}</p>
        </div>
      </div>
    );
  }

  const handleTaskUpdate = async () => {
    if (!publicKey) return;
    try {
      const response = await publicAPI.getClient(publicKey);
      setClient(response.data);
    } catch (err) {
      console.error('Failed to refresh client data:', err);
    }
  };

  return (
    <div className="neu-surface min-h-screen">
      {/* Axcelo header */}
      <div className="border-b border-[#eceef2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neu-raised-sm w-10 h-10 rounded-xl flex items-center justify-center">
              <AxceloLogo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#17181c]">Axcelo</p>
              <p className="text-xs text-[#626875]">Project management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#eceef2] pb-8">
          <h1 className="text-3xl font-bold text-[#17181c]">{client.name}</h1>
          <p className="mt-2 text-[#626875]">Project timeline &amp; deliverables</p>
        </div>

        <ClientCalendar client={client} publicKey={publicKey!} onTaskUpdate={handleTaskUpdate} />
      </div>
    </div>
  );
}
