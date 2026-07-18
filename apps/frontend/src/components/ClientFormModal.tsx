import { useState } from 'react';
import { format } from 'date-fns';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

interface ClientFormModalProps {
  client?: Client;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const SERVICE_TYPES = [
  { value: 'FLOW_ONLY', label: 'Flow Build Only' },
  { value: 'FULL_EMAIL_MARKETING', label: 'Full Email Marketing' },
  { value: 'CAMPAIGNS_ONLY', label: 'Campaigns Only' },
];

const inputCls = 'neu-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none';

export default function ClientFormModal({ client, onSave, onCancel }: ClientFormModalProps) {
  const [name, setName] = useState(client?.name || '');
  const [serviceType, setServiceType] = useState(client?.serviceType || 'FLOW_ONLY');
  const [kickOffDate, setKickOffDate] = useState(
    client?.kickOffDate ? format(new Date(client.kickOffDate), 'yyyy-MM-dd') : ''
  );
  const [klaviyoBillingDate, setKlaviyoBillingDate] = useState(
    client?.klaviyoBillingDate ? format(new Date(client.klaviyoBillingDate), 'yyyy-MM-dd') : ''
  );
  const [klaviyoApi, setKlaviyoApi] = useState(client?.klaviyoApi || '');
  const [figmaLink, setFigmaLink] = useState(client?.figmaLink || '');
  const [slackId, setSlackId] = useState(client?.slackId || '');
  const [slackUserId, setSlackUserId] = useState(client?.slackUserId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        serviceType,
        kickOffDate: kickOffDate || undefined,
        klaviyoBillingDate: klaviyoBillingDate || undefined,
        klaviyoApi: klaviyoApi || undefined,
        figmaLink: figmaLink || undefined,
        slackId: slackId || undefined,
        slackUserId: slackUserId || undefined,
      };

      let response;
      if (client) {
        response = await clientsAPI.update(client.id, payload);
      } else {
        response = await clientsAPI.create(payload);
      }
      onSave(response.data);
    } catch (err: any) {
      console.error('Form error:', err);
      setError(err.response?.data?.error || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#17181c]">{client ? 'Edit client' : 'New client'}</h2>
          <button
            onClick={onCancel}
            className="neu-pressable text-[#626875] hover:text-[#fe7300] w-9 h-9 rounded-xl flex items-center justify-center text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 space-y-5">
          {error && (
            <div className="neu-inset rounded-2xl p-3">
              <p className="text-[#c0392b] text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Client name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter client name"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Service</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={inputCls}>
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Timeline</label>
            <input
              type="date"
              value={kickOffDate}
              onChange={(e) => setKickOffDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="border-t border-[#eceef2] pt-5">
            <h3 className="text-sm font-semibold text-[#17181c] mb-3 ml-1">Integrations</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#626875] mb-2 ml-1">Figma</label>
                <input
                  type="url"
                  value={figmaLink}
                  onChange={(e) => setFigmaLink(e.target.value)}
                  placeholder="Figma project link"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#626875] mb-2 ml-1">Slack channel ID</label>
                <input
                  type="text"
                  value={slackId}
                  onChange={(e) => setSlackId(e.target.value)}
                  placeholder="e.g. C1234567890"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#626875] mb-2 ml-1">Slack user ID</label>
                <input
                  type="text"
                  value={slackUserId}
                  onChange={(e) => setSlackUserId(e.target.value)}
                  placeholder="e.g. U1234567890 or user@company.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#626875] mb-2 ml-1">Klaviyo</label>
                <input
                  type="text"
                  value={klaviyoApi}
                  onChange={(e) => setKlaviyoApi(e.target.value)}
                  placeholder="Klaviyo API key"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#626875] mb-2 ml-1">Billing date</label>
                <input
                  type="date"
                  value={klaviyoBillingDate}
                  onChange={(e) => setKlaviyoBillingDate(e.target.value)}
                  className={inputCls}
                  title="Cleanup task will be scheduled 1 day before"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
            className="btn-accent flex-1 py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : client ? 'Update client' : 'Create client'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="neu-pressable flex-1 py-3 px-4 rounded-2xl font-semibold text-[#17181c]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
