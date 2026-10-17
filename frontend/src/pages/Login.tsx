import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { User, StudentProfile } from '../types';

interface AuthResponseData {
  user: User;
  token: string;
  refreshToken?: string;
}

export default function Login() {
  const { loginWithAuth, login } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.post<{ success: boolean; data: AuthResponseData }>('/auth/login', {
          email: email.trim(),
          password,
        });

        if (res && res.data?.token) {
          let profile: StudentProfile | null = null;
          try {
            const profileRes = await api.get<{ success: boolean; data: StudentProfile }>('/profiles/me');
            profile = profileRes.data;
          } catch {
            // Profile optional on first login
          }

          loginWithAuth(res.data.token, res.data.user, profile);
          navigate('/dashboard');
          return;
        }
      } else {
        const res = await api.post<{ success: boolean; data: AuthResponseData }>('/auth/register', {
          email: email.trim(),
          password,
          name: name.trim(),
          role: 'student',
        });

        if (res && res.data?.token) {
          loginWithAuth(res.data.token, res.data.user);
          navigate('/dashboard');
          return;
        }
      }
    } catch (err: unknown) {
      let displayMsg = 'Invalid email or password.';
      const isNetError =
        (err as { isNetworkError?: boolean })?.isNetworkError ||
        (err instanceof Error &&
          (err.message.toLowerCase().includes('unable to connect') ||
            err.message.toLowerCase().includes('failed to fetch') ||
            err.message.toLowerCase().includes('network')));

      if (isNetError) {
        displayMsg = 'Unable to connect. Please try again.';
      } else if (err instanceof Error && err.message) {
        const lower = err.message.toLowerCase();
        if (
          lower.includes('invalid email') ||
          lower.includes('invalid password') ||
          lower.includes('unauthorized') ||
          (err as { status?: number }).status === 401
        ) {
          displayMsg = 'Invalid email or password.';
        } else {
          displayMsg = err.message;
        }
      }
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    if (loading) return;
    setError('');
    setLoading(true);
    const demoEmail = 'kushi@careerpulse.ai';
    const demoPassword = 'Password123!';
    const demoName = 'Kushi';

    setEmail(demoEmail);
    setPassword(demoPassword);
    setName(demoName);

    try {
      // Try login first
      const loginRes = await api.post<{ success: boolean; data: AuthResponseData }>('/auth/login', {
        email: demoEmail,
        password: demoPassword,
      });

      if (loginRes?.data?.token) {
        let profile: StudentProfile | null = null;
        try {
          const profileRes = await api.get<{ success: boolean; data: StudentProfile }>('/profiles/me');
          profile = profileRes.data;
        } catch {
          // Profile fetch fallback
        }
        loginWithAuth(loginRes.data.token, loginRes.data.user, profile);
        navigate('/dashboard');
        return;
      }
    } catch {
      // If user does not exist in backend DB yet, register demo user
      try {
        const regRes = await api.post<{ success: boolean; data: AuthResponseData }>('/auth/register', {
          email: demoEmail,
          password: demoPassword,
          name: demoName,
          role: 'student',
        });

        if (regRes?.data?.token) {
          loginWithAuth(regRes.data.token, regRes.data.user);
          navigate('/dashboard');
          return;
        }
      } catch {
        // Dev offline fallback
        login();
        navigate('/dashboard');
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.3)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontFamily: 'Outfit' }}>CP</span>
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Outfit' }}>CareerPulse</span>
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Outfit' }}>
            Build the career<br />you want.
          </h2>
          <p className="text-violet-200 text-lg leading-relaxed mb-8">
            CareerPulse&apos;s AI understands your unique skills, finds what&apos;s missing, and creates a personalized roadmap to your dream career.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🧠', text: '25-question AI Career Assessment' },
              { icon: '🎯', text: 'Personalized skill gap analysis' },
              { icon: '🗺️', text: 'Custom learning roadmap built for you' },
              { icon: '📈', text: 'Real-time career readiness tracking' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{item.icon}</div>
                <span className="text-white/90 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-violet-300 text-sm">Smart India Hackathon 2026 · AI Career Platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center mb-8" aria-label="CareerPulse — Discover, Plan, Skill, Grow">
            <img
              src="/assets/careerpulse-logo.png"
              alt="CareerPulse — Discover, Plan, Skill, Grow"
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Mode switch tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Create Account
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>
              {mode === 'login' ? 'Welcome Back 👋' : 'Start Your Journey 🚀'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'login'
                ? 'Sign in to continue your career journey'
                : 'Create your account to unlock personalized career paths'}
            </p>

            {/* Quick Demo Access button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl p-3.5 mb-5 hover:bg-violet-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎯</span>
                <div className="text-left">
                  <p className="text-violet-700 font-semibold text-sm">One-Click Demo Login</p>
                  <p className="text-violet-500 text-xs">Student: Kushi · Auto-connects to API</p>
                </div>
              </div>
              <span className="text-violet-500 text-xs font-medium group-hover:text-violet-700">Click to enter →</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Arjun Ghuge"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@university.edu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder={mode === 'register' ? 'Min 8 chars, 1 uppercase, 1 number, 1 symbol' : 'Enter your password'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm"
                >
                  <span aria-hidden="true">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Outfit' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'login' ? (
                  'Sign In →'
                ) : (
                  'Create Account →'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              {mode === 'login' ? (
                <>
                  New to CareerPulse?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-violet-600 font-semibold hover:text-violet-700"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-violet-600 font-semibold hover:text-violet-700"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
