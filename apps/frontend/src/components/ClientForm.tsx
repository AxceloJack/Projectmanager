import { useState } from 'react';
import { format } from 'date-fns';
import { clientsAPI } from '../lib/api.js';
import { Client } from '../types/index.js';

interface ClientFormProps {
  client?: Client;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const SERVICE_TYPES = [
  { value: 'FLOW_ONLY', label: 'Flow Build Only' },
  { value: 'FULL_EMAIL_MARKETING', label: 'Full Email Marketing' },
  { value: 'CAMPAIGNS_ONLY', label: 'Campaigns Only' },
];

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
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
    <div className="bg-gray-900/95 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white">
          {client ? 'Edit Client' : 'New Client'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {client ? 'Update client information and timeline' : 'Create a new client and set up their workflow'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Info Section */}
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Client name *"
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
            />
          </div>
        </div>

        {/* Service & Timeline */}
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">Service & Timeline</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
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
              placeholder="Kick-off date"
              className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">Primary Contact</h3>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact name"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2"
          />
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Contact email"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2"
          />
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Contact phone"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        {/* Integrations */}
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">Integration Links</h3>
          <input
            type="text"
            value={slackId}
            onChange={(e) => setSlackId(e.target.value)}
            placeholder="Slack ID or Workspace URL"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2"
          />
          <input
            type="text"
            value={klaviyoApi}
            onChange={(e) => setKlaviyoApi(e.target.value)}
            placeholder="Klaviyo API Key"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2"
          />
          <input
            type="url"
            value={googleDriveLink}
            onChange={(e) => setGoogleDriveLink(e.target.value)}
            placeholder="Google Drive folder link"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 mb-2"
          />
          <input
            type="url"
            value={figmaLink}
            onChange={(e) => setFigmaLink(e.target.value)}
            placeholder="Figma project link"
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes..."
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none"
            rows={3}
          />
        </div>
      </form>

      {/* Sticky Buttons */}
      <div className="border-t border-gray-800 p-6 bg-gray-900/50 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm"
        >
          {loading ? 'Saving...' : client ? 'Update' : 'Create'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg font-semibold transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
