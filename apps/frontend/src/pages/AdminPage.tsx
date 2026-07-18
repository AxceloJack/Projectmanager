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
    <div className="neu-surface min-h-full">
      {/* Header */}
      <div className="border-b border-[#eceef2] px-8 py-6">
        <h1 className="text-2xl font-bold text-[#17181c]">Admin settings</h1>
        <p className="text-[#626875] text-sm mt-1">Manage team members and integrations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#eceef2] px-8 pt-4 flex gap-7">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'border-[#fe7300] text-[#fe7300]'
              : 'border-transparent text-[#626875] hover:text-[#17181c]'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('slack')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'slack'
              ? 'border-[#fe7300] text-[#fe7300]'
              : 'border-transparent text-[#626875] hover:text-[#17181c]'
          }`}
        >
          Slack integration
        </button>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {error && (
          <div className="neu-inset rounded-2xl p-4 mb-6">
            <p className="text-[#c0392b] text-sm font-medium">{error}</p>
          </div>
        )}

        {activeTab === 'users' ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[#626875]">Loading pending users…</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="neu-raised w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-9 h-9 text-[#9aa0ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#17181c] mb-2">No pending users</h3>
                <p className="text-[#626875]">All team members have been approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="neu-card rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-[#17181c] font-semibold">{user.email}</p>
                            <p className="text-[#626875] text-xs">
                              Requested {format(new Date(user.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-[#3f9d54] hover:bg-[#357a41] text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                          className="px-4 py-2 bg-[#d9534f] hover:bg-[#c0392b] text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <div className="neu-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#17181c]">Slack workspace connected</h3>
                    <p className="text-[#626875] text-sm">Connected since {format(new Date(slackIntegration.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  <p className="text-[#17181c] text-sm"><strong>Team ID:</strong> {slackIntegration.teamId}</p>
                  <p className="text-[#17181c] text-sm"><strong>Channel ID:</strong> {slackIntegration.channelId}</p>
                </div>
                <button
                  onClick={() => setActiveTab('slack')}
                  className="neu-pressable px-4 py-2.5 text-[#17181c] rounded-xl font-semibold text-sm"
                >
                  Update configuration
                </button>
              </div>
            ) : (
              <div className="neu-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#17181c] mb-3">Connect Slack workspace</h3>
                <p className="text-[#626875] text-sm mb-6">
                  Connect your Slack workspace to receive notifications when tasks are ready for client review.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Slack team ID</label>
                    <input
                      type="text"
                      value={slackForm.teamId}
                      onChange={(e) => setSlackForm({ ...slackForm, teamId: e.target.value })}
                      placeholder="e.g. T12345678"
                      className="neu-input w-full px-4 py-2.5 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">Bot token</label>
                    <input
                      type="password"
                      value={slackForm.botToken}
                      onChange={(e) => setSlackForm({ ...slackForm, botToken: e.target.value })}
                      placeholder="e.g. xoxb-…"
                      className="neu-input w-full px-4 py-2.5 rounded-xl focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleConnectSlack}
                    disabled={actionLoading === 'slack-connect'}
                    className="btn-accent w-full py-3 px-4 rounded-2xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'slack-connect' ? 'Connecting…' : 'Connect workspace'}
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
