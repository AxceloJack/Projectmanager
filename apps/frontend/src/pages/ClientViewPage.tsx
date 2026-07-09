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
