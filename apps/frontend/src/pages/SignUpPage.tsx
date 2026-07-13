import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../lib/api.js';
import AxceloLogo from '../components/AxceloLogo.js';

const inputCls = 'neu-input w-full px-5 py-3.5 rounded-2xl text-[#474747] focus:outline-none';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(email, password, 'Axcelo');
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h1 className="text-[34px] font-bold text-[#474747] tracking-tight">Axcelo</h1>
          <p className="text-[#7b879c] text-sm mt-1">Email campaign command center</p>
        </div>

        {/* Form card */}
        <div className="neu-raised rounded-[28px] p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="neu-raised-sm inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2">
                <svg className="w-6 h-6 text-[#3f9d54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#474747]">Registration successful</h2>
              <p className="text-[#7b879c] text-sm">
                Your account has been created and is pending admin approval. You'll be able to log in once
                approved.
              </p>
              <div className="pt-4 border-t border-[#cdd4de]">
                <p className="text-[#9aa6b8] text-sm">Redirecting to login…</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#474747] mb-6">Create account</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="neu-inset rounded-2xl p-4">
                    <p className="text-[#c0392b] text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputCls}
                    placeholder="name@axcelo.co"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={inputCls}
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
                      Creating account…
                    </span>
                  ) : (
                    'Sign up'
                  )}
                </button>
              </form>

              <div className="mt-7 pt-6 border-t border-[#cdd4de]">
                <p className="text-[#7b879c] text-sm text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#fe7300] hover:text-[#e56100] font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[#9aa6b8] text-xs mt-7">
          © 2026 Axcelo. All campaigns managed with precision.
        </p>
      </div>
    </div>
  );
}
