import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setAiPanelOpen } = useApp();

  return (
    <div className="flex h-full bg-gray-50/60 text-gray-900">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 shadow-xs flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {title && (
            <h1 className="text-gray-900 font-bold text-lg hidden sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h1>
          )}

          <div className="flex-1 hidden md:flex">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search courses, skills..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setAiPanelOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-all shadow-xs"
            >
              <span>✨</span> Ask AI
            </button>

            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full"></span>
            </button>

            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              K
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
