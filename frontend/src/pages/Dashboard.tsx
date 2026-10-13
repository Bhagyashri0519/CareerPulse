import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const summaryCards = [
  { label: 'Career Readiness', value: '72%', icon: '🎓', color: 'from-violet-600 to-indigo-600', bg: 'bg-violet-50/70 border-violet-100', trend: '+8% this month', trendBg: 'bg-violet-100 text-violet-700 font-semibold' },
  { label: 'Career Fit', value: '87%', icon: '🎯', color: 'from-indigo-600 to-blue-600', bg: 'bg-indigo-50/70 border-indigo-100', trend: 'UI/UX Designer', trendBg: 'bg-indigo-100 text-indigo-700 font-semibold' },
  { label: 'Learning Progress', value: '64%', icon: '📚', color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50/70 border-emerald-100', trend: '28.5 hrs learned', trendBg: 'bg-emerald-100 text-emerald-700 font-semibold' },
  { label: 'Learning Gap', value: '28%', icon: '⚠️', color: 'from-amber-600 to-orange-600', bg: 'bg-amber-50/70 border-amber-100', trend: '3 skills to close', trendBg: 'bg-amber-100 text-amber-700 font-semibold' },
  { label: 'Weekly Learning', value: '6.5 hrs', icon: '⏱️', color: 'from-purple-600 to-pink-600', bg: 'bg-purple-50/70 border-purple-100', trend: 'This week', trendBg: 'bg-purple-100 text-purple-700 font-semibold' },
];

const topSkills = [
  { name: 'UI/UX Design', level: 85, color: 'from-violet-600 to-indigo-600' },
  { name: 'Figma', level: 79, color: 'from-indigo-600 to-blue-600' },
  { name: 'Communication', level: 76, color: 'from-blue-600 to-cyan-600' },
  { name: 'Problem Solving', level: 72, color: 'from-teal-600 to-emerald-600' },
  { name: 'HTML/CSS', level: 68, color: 'from-amber-600 to-orange-600' },
];

const recentActivity = [
  { icon: '✅', text: 'Completed: Figma Basics module', time: '2 hours ago' },
  { icon: '🎯', text: 'Career Assessment: 78% score', time: 'Yesterday' },
  { icon: '📖', text: 'Started: Advanced Figma course', time: '2 days ago' },
  { icon: '🏆', text: 'Earned: UI/UX Fundamentals certificate', time: '3 days ago' },
];

const roadmapItems = [
  { label: 'UI/UX Fundamentals', status: 'done' },
  { label: 'Figma Basics', status: 'done' },
  { label: 'Advanced Figma', status: 'current' },
  { label: 'UX Research', status: 'upcoming' },
  { label: 'Prototyping', status: 'upcoming' },
];

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Good Morning, Kushi 👋
            </h1>
            <p className="text-gray-500 mt-1">Let&apos;s continue building your career. You&apos;re on track!</p>
          </div>
          <Link
            to="/roadmap"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Continue My Roadmap →
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {summaryCards.map(card => (
            <div key={card.label} className={`relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xl">{card.icon}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${card.trendBg}`}>{card.trend}</span>
              </div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                {card.value}
              </div>
              <div className="text-gray-500 text-xs font-medium mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Target Career */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Target Career</p>
                  <h2 className="text-gray-900 font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>UI/UX Designer</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-violet-600" style={{ fontFamily: 'Outfit, sans-serif' }}>87%</div>
                  <div className="text-gray-500 text-xs font-medium">Career Match</div>
                </div>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: '87%' }} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Skills Ready', val: '5/8', color: 'text-emerald-600' },
                  { label: 'Gaps to Close', val: '3', color: 'text-amber-600' },
                  { label: 'Estimated', val: '4 months', color: 'text-violet-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <div className={`font-bold text-lg ${s.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                    <div className="text-gray-500 text-xs font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <Link to="/career-fit" className="flex-1 text-center text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2.5 rounded-xl hover:bg-violet-100 transition-colors">
                  View Career Fit →
                </Link>
                <Link to="/learning-gap" className="flex-1 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors">
                  Learning Gaps →
                </Link>
              </div>
            </div>

            {/* Roadmap mini */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>My Roadmap</h3>
                <Link to="/roadmap" className="text-violet-600 text-xs font-semibold hover:text-violet-700">View full →</Link>
              </div>
              <div className="space-y-2.5">
                {roadmapItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                      item.status === 'done' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold' :
                      item.status === 'current' ? 'bg-violet-50 text-violet-600 border border-violet-200 font-bold' :
                      'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                      {item.status === 'done' ? '✓' : item.status === 'current' ? '→' : `${i + 1}`}
                    </div>
                    <span className={`text-sm ${item.status === 'done' ? 'text-gray-400 line-through' : item.status === 'current' ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                    {item.status === 'current' && (
                      <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-200 font-semibold">In Progress</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Top Skills</h3>
                <Link to="/skills" className="text-violet-600 text-xs font-semibold hover:text-violet-700">View all →</Link>
              </div>
              <div className="space-y-3.5">
                {topSkills.map(skill => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 text-sm font-medium">{skill.name}</span>
                      <span className="text-gray-900 text-sm font-bold">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${skill.color} rounded-full skill-bar-fill`} style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/skills" className="mt-4 block text-center text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2 rounded-xl hover:bg-violet-100 transition-colors">
                View Full Skill Profile →
              </Link>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Activity</h3>
              <div className="space-y-3.5">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-base mt-0.5">{act.icon}</span>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm leading-tight font-medium">{act.text}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { icon: '🧠', label: 'Take Assessment', href: '/assessment' },
            { icon: '⚠️', label: 'View Learning Gaps', href: '/learning-gap' },
            { icon: '📚', label: 'Browse Courses', href: '/courses' },
            { icon: '📈', label: 'View Analytics', href: '/analytics' },
          ].map(action => (
            <Link
              key={action.label}
              to={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-200/80 text-center hover:border-violet-200 hover:bg-violet-50/30 transition-all card-hover shadow-xs"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
