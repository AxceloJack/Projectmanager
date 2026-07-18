import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formsAPI, clientsAPI, shareOrigin } from '../lib/api.js';
import { CampaignForm, Client } from '../types/index.js';
import { FormConfig } from '../lib/formConfig.js';

const inputCls = 'neu-input w-full px-4 py-2.5 rounded-xl focus:outline-none';

function formatMonth(month?: string | null) {
  if (!month) return '';
  const [year, m] = month.split('-').map(Number);
  return format(new Date(year, m - 1, 1), 'MMMM yyyy');
}

export default function FormsPage({ config }: { config: FormConfig }) {
  const [forms, setForms] = useState<CampaignForm[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingForm, setViewingForm] = useState<CampaignForm | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [config.type]);

  const fetchData = async () => {
    try {
      const [formsRes, clientsRes] = await Promise.all([
        formsAPI.list(config.type),
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
    const subject = config.hasMonth
      ? `${formatMonth(form.month)} form for ${form.client?.name}`
      : `onboarding form for ${form.client?.name}`;
    if (!confirm(`Delete the ${subject}?`)) return;
    try {
      await formsAPI.delete(form.id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  if (loading) {
    return (
      <div className="neu-surface flex-1 flex items-center justify-center">
        <p className="text-[#626875]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="neu-surface flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#17181c]">{config.pageTitle}</h1>
            <p className="text-[#626875] text-sm mt-1">{config.pageSubtitle}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-accent px-4 py-2.5 rounded-2xl font-semibold text-sm"
          >
            + New form
          </button>
        </div>

        {forms.length === 0 ? (
          <div className="neu-inset rounded-2xl p-12 text-center">
            <p className="text-[#626875]">No forms yet. Create one and send the link to your client.</p>
          </div>
        ) : (
          <div className="neu-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[#626875] text-xs uppercase tracking-wider border-b border-[#eceef2]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Client</th>
                  {config.hasMonth && <th className="px-6 py-3.5 font-semibold">Planning month</th>}
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Sent</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef2]">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-[#eef0f3]/60 transition-colors">
                    <td className="px-6 py-4 text-[#17181c] font-semibold">{form.client?.name}</td>
                    {config.hasMonth && (
                      <td className="px-6 py-4 text-[#17181c]">{formatMonth(form.month)}</td>
                    )}
                    <td className="px-6 py-4">
                      {form.status === 'SUBMITTED' ? (
                        <span className="pill pill-green">Submitted</span>
                      ) : (
                        <span className="pill pill-gray">Waiting on client</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#626875] text-sm">
                      {format(new Date(form.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {form.status === 'SUBMITTED' && (
                          <button
                            onClick={() => setViewingForm(form)}
                            className="btn-accent px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            View responses
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyLink(form)}
                          className="neu-pressable px-3.5 py-1.5 text-[#17181c] rounded-lg text-xs font-semibold"
                        >
                          {copiedId === form.id ? 'Copied!' : 'Copy link'}
                        </button>
                        <button
                          onClick={() => handleDelete(form)}
                          className="neu-pressable px-3.5 py-1.5 text-[#c0392b] rounded-lg text-xs font-semibold"
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
          config={config}
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      )}

      {viewingForm && (
        <FormResponsesModal config={config} form={viewingForm} onClose={() => setViewingForm(null)} />
      )}
    </div>
  );
}

function CreateFormModal({
  config,
  clients,
  onClose,
  onCreated,
}: {
  config: FormConfig;
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!clientId) {
      setError('Select a client');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await formsAPI.create(clientId, config.type, config.hasMonth ? month : undefined);
      onCreated();
    } catch (err) {
      console.error(err);
      setError('Failed to create form');
      setSaving(false);
    }
  };

  return (
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#17181c]">
            New {config.hasMonth ? 'campaign' : 'onboarding'} form
          </h2>
          <p className="text-[#626875] text-sm mt-1">
            {config.hasMonth
              ? "Pick the client and the month you're planning for."
              : 'Pick the client you want to onboard.'}
          </p>
        </div>

        <div className="px-6 space-y-5">
          {error && (
            <div className="neu-inset rounded-2xl p-3">
              <p className="text-[#c0392b] text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {config.hasMonth && (
            <div>
              <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Planning month</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
            </div>
          )}
        </div>

        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="neu-pressable flex-1 py-3 px-4 rounded-2xl font-semibold text-[#17181c]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn-accent flex-1 py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating…' : 'Create form'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormResponsesModal({
  config,
  form,
  onClose,
}: {
  config: FormConfig;
  form: CampaignForm;
  onClose: () => void;
}) {
  const answers = form as unknown as Record<string, string | null | undefined>;
  const heading = config.hasMonth
    ? `${form.client?.name} — ${formatMonth(form.month)}`
    : `${form.client?.name} — Onboarding`;

  return (
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#17181c] mb-1">{heading}</h2>
          <p className="text-[#626875] text-sm">
            Submitted{' '}
            {form.submittedAt ? format(new Date(form.submittedAt), "MMM d, yyyy 'at' h:mma") : ''}
          </p>
        </div>

        <div className="px-6 space-y-6">
          {config.questions.map((q) => (
            <div key={q.key}>
              <h3 className="font-semibold text-[#17181c] mb-2">{q.label}</h3>
              {answers[q.key] ? (
                <p className="text-[#17181c] whitespace-pre-wrap neu-inset rounded-xl p-3.5">
                  {answers[q.key]}
                </p>
              ) : (
                <p className="text-[#9aa0ab] italic text-sm">Nothing provided</p>
              )}
            </div>
          ))}
        </div>

        <div className="p-6">
          <button
            onClick={onClose}
            className="neu-pressable w-full py-3 px-4 rounded-2xl font-semibold text-[#17181c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
