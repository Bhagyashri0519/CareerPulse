import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (username === 'Kushi' && password === '1525') {
      setLoading(true);
      setTimeout(() => {
        login();
        navigate('/dashboard');
      }, 1000);
    } else {
      setError('Invalid credentials. Use Demo credentials below.');
    }
  }

  function fillDemo() {
    setUsername('Kushi');
    setPassword('1525');
    setError('');
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
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{item.icon}</div>
                <span className="text-white/90 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-violet-300 text-sm">Smart India Hackathon 2026 · AI Career Platform</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            <span className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Outfit' }}>CareerPulse</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>Welcome Back 👋</h1>
            <p className="text-gray-500 text-sm mb-6">Sign in to continue your career journey</p>

            {/* Demo credentials badge */}
            <button
              onClick={fillDemo}
              className="w-full flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl p-3.5 mb-5 hover:bg-violet-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎯</span>
                <div className="text-left">
                  <p className="text-violet-700 font-semibold text-sm">Demo Login</p>
                  <p className="text-violet-500 text-xs">Username: Kushi · Password: 1525</p>
                </div>
              </div>
              <span className="text-violet-500 text-xs font-medium group-hover:text-violet-700">Click to fill →</span>
            </button>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-violet-600" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-violet-600 hover:text-violet-700 font-medium">Forgot Password?</button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  <span>⚠️</span> {error}
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
                    Signing in...
                  </span>
                ) : 'Login →'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or continue with</div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-5">
              New to CareerPulse?{' '}
              <Link to="/" className="text-violet-600 font-semibold hover:text-violet-700">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
