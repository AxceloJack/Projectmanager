import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api.js';
import { useAuthStore } from '../store/auth.js';
import AxceloLogo from '../components/AxceloLogo.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, workspace } = response.data;
      setAuth(token, workspace);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      if (errorMsg === 'Your account is pending admin approval') {
        setError('Your account is pending admin approval. Please contact your administrator.');
      } else {
        setError(errorMsg || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4">
      {/* Gradient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 opacity-5 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4 shadow-lg">
            <AxceloLogo className="w-9 h-9 text-white" mono />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Axcelo</h1>
          <p className="text-gray-400 text-sm tracking-wide">Email Campaign Command Center</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="name@axcelo.co"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-orange-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-500 text-sm text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-semibold transition">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Axcelo. All campaigns managed with precision.
        </p>
      </div>
    </div>
  );
}
