import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const progressData = [
  { week: 'Week 1', hours: 6.5, skills: 42 },
  { week: 'Week 2', hours: 7, skills: 51 },
  { week: 'Week 3', hours: 8.5, skills: 58 },
  { week: 'Week 4', hours: 6, skills: 61 },
  { week: 'Week 5', hours: 9, skills: 66 },
  { week: 'Week 6', hours: 7.5, skills: 72 },
];

const completedCourses = [
  { name: 'UI/UX Fundamentals', completed: 'Jan 15, 2026', score: 94, hours: 8, icon: '🎭' },
  { name: 'Figma Basics', completed: 'Jan 28, 2026', score: 88, hours: 10, icon: '✏️' },
  { name: 'Git & GitHub', completed: 'Feb 10, 2026', score: 82, hours: 6, icon: '🔀' },
  { name: 'HTML/CSS Basics', completed: 'Feb 22, 2026', score: 79, hours: 7, icon: '🌐' },
];

const certificates = [
  { name: 'UI/UX Design Fundamentals', date: 'Jan 2026', issuer: 'CareerPulse', icon: '🏆' },
  { name: 'Figma Certified Designer', date: 'Jan 2026', issuer: 'CareerPulse', icon: '🎨' },
  { name: 'Git & Version Control', date: 'Feb 2026', issuer: 'CareerPulse', icon: '🔀' },
];

function CircleProgress({ value, size = 100, label, color = '#7C3AED' }: { value: number; size?: number; label: string; color?: string }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="#111827" fontSize="18" fontWeight="bold" fontFamily="Outfit">{value}%</text>
      </svg>
      <span className="text-gray-600 text-xs font-semibold text-center">{label}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm shadow-md">
        <p className="text-gray-900 font-bold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}{p.name === 'Hours' ? ' hrs' : '%'}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LearningProgress() {
  return (
    <DashboardLayout title="My Progress">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Learning Progress 📈</h1>
          <p className="text-gray-500 mt-1 font-medium">Track your growth, completed courses, and career readiness over time.</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Overall Progress', val: '64%', color: '#7C3AED', icon: '📊' },
            { label: 'Current Course', val: 'Adv. Figma', color: '#4F46E5', icon: '🎨' },
            { label: 'Course Progress', val: '72%', color: '#059669', icon: '⚡' },
            { label: 'Hours Learned', val: '28.5', color: '#D97706', icon: '⏱️' },
            { label: 'Courses Done', val: '4', color: '#DB2777', icon: '✅' },
            { label: 'Certificates', val: '3', color: '#0D9488', icon: '🏆' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200/80 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif', color: stat.color }}>{stat.val}</div>
              <div className="text-gray-500 text-xs font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress rings */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>Progress Overview</h3>
          <div className="flex flex-wrap justify-around gap-6">
            <CircleProgress value={64} label="Overall Progress" color="#7C3AED" size={110} />
            <CircleProgress value={72} label="Career Readiness" color="#4F46E5" size={110} />
            <CircleProgress value={87} label="Career Fit" color="#059669" size={110} />
            <CircleProgress value={45} label="Skills Improved" color="#D97706" size={110} />
            <CircleProgress value={72} label="Current Course" color="#DB2777" size={110} />
          </div>
        </div>

        {/* Progress chart */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Learning Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="hours" name="Hours" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="skills" name="Skill Score" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Completed courses */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Completed Courses</h3>
            <div className="space-y-3">
              {completedCourses.map(course => (
                <div key={course.name} className="flex items-center gap-3 bg-gray-50/80 border border-gray-200/60 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0">
                    {course.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-bold truncate">{course.name}</p>
                    <p className="text-gray-500 text-xs font-medium">{course.completed} · {course.hours} hrs</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-emerald-700 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.score}%</div>
                    <div className="text-gray-400 text-xs font-medium">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>My Certificates 🏆</h3>
            <div className="space-y-3">
              {certificates.map(cert => (
                <div key={cert.name} className="bg-violet-50/70 border border-violet-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cert.icon}</span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-bold text-sm">{cert.name}</p>
                      <p className="text-violet-700 text-xs font-medium">{cert.issuer} · {cert.date}</p>
                    </div>
                    <button className="text-xs border border-violet-200 bg-white text-violet-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors shadow-2xs">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm font-medium mb-1">Next certificate</p>
              <p className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Advanced Figma Designer</p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-violet-700 text-xs font-semibold mt-1">72% complete</p>
            </div>
          </div>
        </div>

        {/* Skills improved */}
        <div className="mt-6 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Skills Improved (+18% avg over 6 weeks)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { skill: 'UI/UX Design', before: 70, after: 88, change: '+18%' },
              { skill: 'Figma', before: 55, after: 79, change: '+24%' },
              { skill: 'HTML/CSS', before: 52, after: 68, change: '+16%' },
              { skill: 'Communication', before: 65, after: 76, change: '+11%' },
            ].map(s => (
              <div key={s.skill} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-gray-900 text-sm font-bold mb-3">{s.skill}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-xs font-medium w-14">Before</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${s.before}%` }} />
                  </div>
                  <span className="text-gray-400 text-xs font-medium w-8 text-right">{s.before}%</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-xs font-medium w-14">After</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: `${s.after}%` }} />
                  </div>
                  <span className="text-violet-700 font-bold text-xs w-8 text-right">{s.after}%</span>
                </div>
                <div className="text-emerald-700 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.change}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/analytics" className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
            View Full Analytics →
          </Link>
          <Link to="/courses" className="flex-1 text-center bg-white text-gray-700 border border-gray-200 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-xs" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Continue Learning
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
