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
    <div className="neu-surface min-h-screen flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-9 text-center">
          <div className="neu-raised inline-flex items-center justify-center w-[70px] h-[70px] rounded-[22px] mb-5">
            <AxceloLogo className="w-9 h-9" />
          </div>
          <h1 className="text-[34px] font-bold text-[#17181c] tracking-tight">Axcelo</h1>
          <p className="text-[#626875] text-sm mt-1">Email campaign command center</p>
        </div>

        {/* Form card */}
        <div className="neu-raised rounded-[28px] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="neu-inset rounded-2xl p-4">
                <p className="text-[#c0392b] text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neu-input w-full px-5 py-3.5 rounded-2xl text-[#17181c] focus:outline-none"
                placeholder="name@axcelo.co"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#17181c] mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="neu-input w-full px-5 py-3.5 rounded-2xl text-[#17181c] focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3.5 px-4 rounded-[20px] font-semibold text-[15px] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#eceef2]">
            <p className="text-[#626875] text-sm text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#fe7300] hover:text-[#e56100] font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#9aa0ab] text-xs mt-7">
          © 2026 Axcelo. All campaigns managed with precision.
        </p>
      </div>
    </div>
  );
}
