import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formsAPI, clientsAPI, shareOrigin } from '../lib/api.js';
import { CampaignForm, Client } from '../types/index.js';

function formatMonth(month: string) {
  const [year, m] = month.split('-').map(Number);
  return format(new Date(year, m - 1, 1), 'MMMM yyyy');
}

export default function CampaignFormsPage() {
  const [forms, setForms] = useState<CampaignForm[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingForm, setViewingForm] = useState<CampaignForm | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [formsRes, clientsRes] = await Promise.all([
        formsAPI.list(),
        clientsAPI.list(),
      ]);
      setForms(formsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (form: CampaignForm) => {
    navigator.clipboard.writeText(`${shareOrigin}/form/${form.publicKey}`);
    setCopiedId(form.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (form: CampaignForm) => {
    if (!confirm(`Delete the ${formatMonth(form.month)} form for ${form.client?.name}?`)) {
      return;
    }
    try {
      await formsAPI.delete(form.id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      <div className="px-8 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Campaign Forms</h1>
            <p className="text-gray-500 text-sm mt-1">
              Send clients a strategy form for the month ahead • Sales, launches, key dates
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition"
          >
            + New Form
          </button>
        </div>

        {forms.length === 0 ? (
          <div className="border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-500">
              No campaign forms yet. Create one and send the link to your client.
            </p>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Client</th>
                  <th className="px-6 py-3 font-semibold">Planning Month</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Sent</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-6 py-4 text-white font-medium">
                      {form.client?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{formatMonth(form.month)}</td>
                    <td className="px-6 py-4">
                      {form.status === 'SUBMITTED' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-950 text-green-300 border border-green-800">
                          Submitted
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-400 border border-gray-800">
                          Waiting on client
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {format(new Date(form.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {form.status === 'SUBMITTED' && (
                          <button
                            onClick={() => setViewingForm(form)}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition"
                          >
                            View Responses
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyLink(form)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded text-xs font-medium transition"
                        >
                          {copiedId === form.id ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={() => handleDelete(form)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-red-950 border border-gray-800 hover:border-red-900 text-gray-500 hover:text-red-400 rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateFormModal
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}

      {viewingForm && (
        <FormResponsesModal form={viewingForm} onClose={() => setViewingForm(null)} />
      )}
    </div>
  );
}

function CreateFormModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!clientId || !month) {
      setError('Select a client and month');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await formsAPI.create(clientId, month);
      onCreated();
    } catch (err) {
      console.error(err);
      setError('Failed to create form');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">New Campaign Form</h2>
          <p className="text-gray-500 text-sm mt-1">
            Pick the client and the month you're planning for.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-950 border border-red-900 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Planning Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
            />
          </div>
        </div>

        <div className="border-t border-gray-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Creating...' : 'Create Form'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormResponsesModal({
  form,
  onClose,
}: {
  form: CampaignForm;
  onClose: () => void;
}) {
  const sections: { label: string; value?: string | null }[] = [
    { label: 'Sales & Promotions', value: form.sales },
    { label: 'Product Launches & New Arrivals', value: form.launches },
    { label: 'Special Dates & Events', value: form.specialDates },
    { label: 'Things to Avoid', value: form.avoidances },
    { label: 'Anything Else', value: form.notes },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-1">
            {form.client?.name} — {formatMonth(form.month)}
          </h2>
          <p className="text-gray-500 text-sm">
            Submitted{' '}
            {form.submittedAt ? format(new Date(form.submittedAt), "MMM d, yyyy 'at' h:mma") : ''}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <h3 className="font-semibold text-gray-300 mb-2">{section.label}</h3>
              {section.value ? (
                <p className="text-gray-400 whitespace-pre-wrap bg-gray-900 border border-gray-800 rounded p-3">
                  {section.value}
                </p>
              ) : (
                <p className="text-gray-600 italic text-sm">Nothing provided</p>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 p-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-2 px-4 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
