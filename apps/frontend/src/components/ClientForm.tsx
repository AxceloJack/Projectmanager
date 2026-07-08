import { useState, useEffect } from 'react';
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
      if (client) {
        const response = await clientsAPI.update(client.id, {
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
        });
        onSave(response.data);
      } else {
        const response = await clientsAPI.create({
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
        });
        onSave(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/95 border border-gray-800 rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {client ? 'Edit Client' : 'New Client'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {client ? 'Update client information and timeline' : 'Create a new client and set up their workflow'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Info Section */}
        <div className="border-b border-gray-800 pb-6">
          <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Client Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
                placeholder="client@company.com"
              />
            </div>
          </div>
        </div>

        {/* Service & Timeline Section */}
        <div className="border-b border-gray-800 pb-6">
          <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Service & Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Service Type *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {serviceType === 'FLOW_ONLY' && '8 flows across a 21-day timeline'}
                {serviceType === 'FULL_EMAIL_MARKETING' && 'Complete email marketing setup + flows'}
                {serviceType === 'CAMPAIGNS_ONLY' && 'Campaign creation and setup only'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Kick-off Date</label>
              <input
                type="date"
                value={kickOffDate}
                onChange={(e) => setKickOffDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
              />
              <p className="text-xs text-gray-500 mt-2">Timeline will auto-generate from this date</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-b border-gray-800 pb-6">
          <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Primary Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contact email"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Contact phone"
              className="col-span-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
          </div>
        </div>

        {/* API & Links Section */}
        <div className="border-b border-gray-800 pb-6">
          <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Integration Links</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={slackId}
              onChange={(e) => setSlackId(e.target.value)}
              placeholder="Slack ID or Workspace URL"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="password"
              value={klaviyoApi}
              onChange={(e) => setKlaviyoApi(e.target.value)}
              placeholder="Klaviyo API Key"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="url"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="Google Drive folder link"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
            <input
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              placeholder="Figma project link"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="pb-6">
          <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this client, campaign strategy, special requirements, etc."
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition resize-none"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-gray-800 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-orange-500/25"
          >
            {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-4 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
