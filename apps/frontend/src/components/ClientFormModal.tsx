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

export default function ClientFormModal({ client, onSave, onCancel }: ClientFormModalProps) {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [serviceType, setServiceType] = useState(client?.serviceType || 'FLOW_ONLY');
  const [kickOffDate, setKickOffDate] = useState(
    client?.kickOffDate ? format(new Date(client.kickOffDate), 'yyyy-MM-dd') : ''
  );
  const [slackId, setSlackId] = useState(client?.slackId || '');
  const [klaviyoApi, setKlaviyoApi] = useState(client?.klaviyoApi || '');
  const [googleDriveLink, setGoogleDriveLink] = useState(client?.googleDriveLink || '');
  const [figmaLink, setFigmaLink] = useState(client?.figmaLink || '');
  const [contactName, setContactName] = useState(client?.contactName || '');
  const [contactEmail, setContactEmail] = useState(client?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(client?.contactPhone || '');
  const [notes, setNotes] = useState(client?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email: email || undefined,
        serviceType,
        kickOffDate: kickOffDate || undefined,
        slackId: slackId || undefined,
        klaviyoApi: klaviyoApi || undefined,
        googleDriveLink: googleDriveLink || undefined,
        figmaLink: figmaLink || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        notes: notes || undefined,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {client ? 'Edit Client' : 'New Client'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {client ? 'Update client information' : 'Create a new client and set up timeline'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-950 border border-red-900 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Basic Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Client name *"
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Service & Timeline</h3>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={kickOffDate}
                onChange={(e) => setKickOffDate(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Contact</h3>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 mb-2"
            />
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contact email"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 mb-2"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Contact phone"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Integrations</h3>
            <input
              type="text"
              value={slackId}
              onChange={(e) => setSlackId(e.target.value)}
              placeholder="Slack ID or workspace URL"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 mb-2"
            />
            <input
              type="text"
              value={klaviyoApi}
              onChange={(e) => setKlaviyoApi(e.target.value)}
              placeholder="Klaviyo API Key"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 mb-2"
            />
            <input
              type="url"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="Google Drive folder link"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 mb-2"
            />
            <input
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              placeholder="Figma project link"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 resize-none"
              rows={3}
            />
          </div>
        </form>

        {/* Fixed Footer Buttons */}
        <div className="border-t border-gray-800 p-6 bg-black flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
