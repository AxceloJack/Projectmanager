import { useState, useEffect } from 'react';
import { adminAPI, slackAPI } from '../lib/api.js';
import { format } from 'date-fns';

interface PendingUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface SlackIntegration {
  teamId: string;
  channelId: string;
  createdAt: string;
}

type AdminTab = 'users' | 'slack';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [slackIntegration, setSlackIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [slackForm, setSlackForm] = useState({ teamId: '', botToken: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, slackResponse] = await Promise.all([
        adminAPI.getPendingUsers(),
        slackAPI.getIntegration(),
      ]);
      setPendingUsers(usersResponse.data);
      setSlackIntegration(slackResponse.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminAPI.approveUser(userId);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user? This cannot be undone.')) {
      return;
    }
    setActionLoading(userId);
    try {
      await adminAPI.rejectUser(userId);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectSlack = async () => {
    if (!slackForm.teamId || !slackForm.botToken) {
      setError('Slack Team ID and Bot Token are required');
      return;
    }
    setActionLoading('slack-connect');
    try {
      const response = await slackAPI.connectWorkspace(slackForm);
      setSlackIntegration(response.data);
      setSlackForm({ teamId: '', botToken: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect Slack workspace');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage team members and integrations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-8 flex gap-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('slack')}
          className={`py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'slack'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Slack Integration
        </button>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {activeTab === 'users' ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-400">Loading pending users...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Pending Users</h3>
                <p className="text-gray-500">All team members have been approved!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.email}</p>
                            <p className="text-gray-500 text-xs">
                              Requested {format(new Date(user.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === user.id ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === user.id ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {slackIntegration ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Slack Workspace Connected</h3>
                    <p className="text-gray-500 text-sm">Connected since {format(new Date(slackIntegration.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-400 text-sm"><strong>Team ID:</strong> {slackIntegration.teamId}</p>
                  <p className="text-gray-400 text-sm"><strong>Channel ID:</strong> {slackIntegration.channelId}</p>
                </div>
                <button
                  onClick={() => setActiveTab('slack')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition"
                >
                  Update Configuration
                </button>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Connect Slack Workspace</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Connect your Slack workspace to receive notifications when tasks are ready for client review.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Slack Team ID</label>
                    <input
                      type="text"
                      value={slackForm.teamId}
                      onChange={(e) => setSlackForm({ ...slackForm, teamId: e.target.value })}
                      placeholder="e.g., T12345678"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bot Token</label>
                    <input
                      type="password"
                      value={slackForm.botToken}
                      onChange={(e) => setSlackForm({ ...slackForm, botToken: e.target.value })}
                      placeholder="e.g., xoxb-..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    onClick={handleConnectSlack}
                    disabled={actionLoading === 'slack-connect'}
                    className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'slack-connect' ? 'Connecting...' : 'Connect Workspace'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
