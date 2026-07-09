import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { publicAPI } from '../lib/api.js';
import { Client } from '../types/index.js';
import ClientCalendar from '../components/ClientCalendar.js';

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">{error || 'Client not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Axcelo Header */}
      <div className="border-b border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6" fill="#ff7b00" viewBox="-64 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M80.95 472.23c-4.28 17.16 6.14 34.53 23.28 38.81 2.61.66 5.22.95 7.8.95 14.33 0 27.37-9.7 31.02-24.23l25.24-100.97-52.78-52.78-34.56 138.22zm14.89-196.12L137 117c2.19-8.42-3.14-16.95-11.92-19.06-43.88-10.52-88.35 15.07-99.32 57.17L.49 253.24c-2.19 8.42 3.14 16.95 11.92 19.06l63.56 15.25c8.79 2.1 17.68-3.02 19.87-11.44zM368 160h-16c-8.84 0-16 7.16-16 16v16h-34.75l-46.78-46.78C243.38 134.11 228.61 128 212.91 128c-27.02 0-50.47 18.3-57.03 44.52l-26.92 107.72a32.012 32.012 0 0 0 8.42 30.39L224 397.25V480c0 17.67 14.33 32 32 32s32-14.33 32-32v-82.75c0-17.09-6.66-33.16-18.75-45.25l-46.82-46.82c.15-.5.49-.89.62-1.41l19.89-79.57 22.43 22.43c6 6 14.14 9.38 22.62 9.38h48v240c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16V176c.01-8.84-7.15-16-15.99-16zM240 96c26.51 0 48-21.49 48-48S266.51 0 240 0s-48 21.49-48 48 21.49 48 48 48z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Axcelo</p>
              <p className="text-xs text-gray-500">Campaign Management</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Project: {client.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-800 pb-8">
          <h1 className="text-3xl font-bold text-white">{client.name}</h1>
          <p className="mt-2 text-gray-500">Campaign Timeline & Deliverables</p>
        </div>

        <ClientCalendar client={client} publicKey={publicKey!} />
      </div>
    </div>
  );
}
