import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '🧠', label: 'Career Assessment', href: '/assessment' },
  { icon: '📊', label: 'My Skills', href: '/skills' },
  { icon: '⚠️', label: 'Learning Gaps', href: '/learning-gap' },
  { icon: '🎯', label: 'Career Fit', href: '/career-fit' },
  { icon: '🗺️', label: 'My Roadmap', href: '/roadmap' },
  { icon: '📚', label: 'Courses', href: '/courses' },
  { icon: '📈', label: 'Analytics', href: '/analytics' },
  { icon: '🚀', label: 'Opportunities', href: '/opportunities' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, setAiPanelOpen } = useApp();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[240px] flex-shrink-0 flex flex-col
          bg-white border-r border-gray-200/80
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200/80">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold" style={{ fontFamily: 'Outfit' }}>CP</span>
            </div>
            <span className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>CareerPulse</span>
          </Link>
        </div>

        {/* Student pill */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">K</div>
          <div className="min-w-0">
            <p className="text-gray-900 text-sm font-semibold truncate" style={{ fontFamily: 'Outfit' }}>Kushi</p>
            <p className="text-gray-500 text-xs truncate">B.Tech CSE • 3rd Year</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
              </Link>
            );
          })}

          <button
            onClick={() => { setAiPanelOpen(true); if (onClose) onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all mt-1"
          >
            <span className="text-base">✨</span>
            <span>CareerPulse AI</span>
            <span className="ml-auto text-xs bg-violet-100 text-violet-700 font-semibold px-1.5 py-0.5 rounded-md border border-violet-200">AI</span>
          </button>
        </nav>

        {/* Career readiness */}
        <div className="mx-4 mb-4 p-3.5 rounded-xl bg-violet-50/50 border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-xs font-medium">Career Readiness</span>
            <span className="text-violet-700 text-xs font-bold">72%</span>
          </div>
          <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: '72%' }} />
          </div>
          <p className="text-gray-500 text-xs mt-2 font-medium">UI/UX Designer path</p>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200/80 px-3 py-3 space-y-0.5">
          <Link to="/dashboard" onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
            <span>⚙️</span><span>Settings</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
