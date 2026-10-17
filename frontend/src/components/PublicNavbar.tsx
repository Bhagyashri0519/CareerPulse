import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function PublicNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Career Paths', href: '/career-fit' },
    { label: 'Courses', href: '/courses' },
    { label: 'My Progress', href: '/progress' },
    { label: 'Analytics', href: '/analytics' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group py-1" aria-label="CareerPulse — Discover, Plan, Skill, Grow">
          <img
            src="/assets/careerpulse-logo.png"
            alt="CareerPulse — Discover, Plan, Skill, Grow"
            className="h-10 sm:h-11 w-auto max-w-[200px] object-contain hidden min-[360px]:block transition-opacity duration-150 group-hover:opacity-90"
          />
          <img
            src="/assets/careerpulse-icon.png"
            alt="CareerPulse — Discover, Plan, Skill, Grow"
            className="h-9 w-auto object-contain block min-[360px]:hidden transition-opacity duration-150 group-hover:opacity-90"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              to={l.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === l.href
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
            Login
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            <Link to="/login" className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Login</Link>
            <Link to="/login" className="flex-1 text-center py-2 bg-violet-600 rounded-lg text-sm font-medium text-white hover:bg-violet-700">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
