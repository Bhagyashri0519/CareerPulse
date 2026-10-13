import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const weeklyData = [
  { label: 'Mon', hours: 1.5 }, { label: 'Tue', hours: 1 }, { label: 'Wed', hours: 1 },
  { label: 'Thu', hours: 0 }, { label: 'Fri', hours: 1.5 }, { label: 'Sat', hours: 2 }, { label: 'Sun', hours: 1 },
];

const monthlyData = [
  { label: 'Week 1', hours: 6.5 }, { label: 'Week 2', hours: 7 },
  { label: 'Week 3', hours: 8.5 }, { label: 'Week 4', hours: 7.5 },
];

const threeMonthData = [
  { label: 'Jan', hours: 18 }, { label: 'Feb', hours: 24 }, { label: 'Mar', hours: 28.5 },
];

const sixMonthData = [
  { label: 'Oct', hours: 0 }, { label: 'Nov', hours: 5 }, { label: 'Dec', hours: 12 },
  { label: 'Jan', hours: 18 }, { label: 'Feb', hours: 24 }, { label: 'Mar', hours: 28.5 },
];

const subjectData = [
  { subject: 'UI/UX', hours: 11.4, color: '#8B5CF6' },
  { subject: 'Python', hours: 7.1, color: '#06B6D4' },
  { subject: 'SQL', hours: 5.7, color: '#10B981' },
  { subject: 'Other', hours: 4.3, color: '#F59E0B' },
];

const barData = [
  { subject: 'UI/UX', score: 88 },
  { subject: 'Python', score: 82 },
  { subject: 'SQL', score: 76 },
  { subject: 'Figma', score: 79 },
  { subject: 'JS', score: 68 },
  { subject: 'C++', score: 71 },
];

const skillGrowthData = [
  { month: 'Oct', uiux: 60, python: 65, figma: 50, sql: 62 },
  { month: 'Nov', uiux: 68, python: 70, figma: 58, sql: 67 },
  { month: 'Dec', uiux: 74, python: 75, figma: 65, sql: 71 },
  { month: 'Jan', uiux: 80, python: 78, figma: 71, sql: 73 },
  { month: 'Feb', uiux: 84, python: 80, figma: 75, sql: 75 },
  { month: 'Mar', uiux: 88, python: 82, figma: 79, sql: 76 },
];

const careerReadinessData = [
  { month: 'Jan', readiness: 42 },
  { month: 'Feb', readiness: 51 },
  { month: 'Mar', readiness: 61 },
  { month: 'Apr', readiness: 72 },
];

const subjectAnalytics = [
  {
    id: 'uiux', name: 'UI/UX', icon: '🎨', level: 88, time: '11.4 hrs', quizAvg: 91, projects: 1, color: '#8B5CF6',
    growth: [{ m: 'Jan', v: 70 }, { m: 'Feb', v: 78 }, { m: 'Mar', v: 84 }, { m: 'Apr', v: 88 }],
    next: 'Advanced User Research'
  },
  {
    id: 'python', name: 'Python', icon: '🐍', level: 82, time: '18 hrs', quizAvg: 84, projects: 2, color: '#06B6D4',
    growth: [{ m: 'Jan', v: 42 }, { m: 'Feb', v: 58 }, { m: 'Mar', v: 71 }, { m: 'Apr', v: 82 }],
    next: 'Advanced Python'
  },
  {
    id: 'sql', name: 'SQL', icon: '🗄️', level: 76, time: '5.7 hrs', quizAvg: 79, projects: 1, color: '#10B981',
    growth: [{ m: 'Jan', v: 55 }, { m: 'Feb', v: 64 }, { m: 'Mar', v: 70 }, { m: 'Apr', v: 76 }],
    next: 'Advanced SQL Queries'
  },
  {
    id: 'figma', name: 'Figma', icon: '✏️', level: 79, time: '8.2 hrs', quizAvg: 82, projects: 1, color: '#F59E0B',
    growth: [{ m: 'Jan', v: 50 }, { m: 'Feb', v: 62 }, { m: 'Mar', v: 72 }, { m: 'Apr', v: 79 }],
    next: 'Advanced Figma Variables'
  },
];

type Filter = 'Weekly' | 'Monthly' | '3 Months' | '6 Months';

const CUSTOM_TOOLTIP_STYLE = {
  contentStyle: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, color: '#111827' },
  itemStyle: { color: '#111827' },
};

export default function Analytics() {
  const [filter, setFilter] = useState<Filter>('Monthly');
  const [selectedSubject, setSelectedSubject] = useState(subjectAnalytics[0]);

  const chartData = filter === 'Weekly' ? weeklyData : filter === 'Monthly' ? monthlyData : filter === '3 Months' ? threeMonthData : sixMonthData;

  return (
    <DashboardLayout title="Analytics">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Learning Analytics 📊</h1>
            <p className="text-gray-500 mt-1 font-medium">Track your skill growth, learning hours, and career readiness.</p>
          </div>
          <div className="flex gap-2 bg-white border border-gray-200/80 rounded-xl p-1 shadow-xs">
            {(['Weekly', 'Monthly', '3 Months', '6 Months'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-violet-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
          {[
            { label: 'Total Learning', val: '28.5 hrs', icon: '⏱️', color: 'text-violet-700' },
            { label: 'Weekly Average', val: '6.5 hrs', icon: '📅', color: 'text-indigo-700' },
            { label: 'Courses Done', val: '4', icon: '✅', color: 'text-emerald-700' },
            { label: 'Skill Growth', val: '+18%', icon: '📈', color: 'text-amber-700' },
            { label: 'Career Readiness', val: '72%', icon: '🎯', color: 'text-pink-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.val}</div>
              <div className="text-gray-500 text-xs font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          {/* Line chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>📅 Learning Hours — {filter}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v} hrs`, 'Hours']} />
                <Area type="monotone" dataKey="hours" stroke="#7C3AED" strokeWidth={2.5} fill="url(#hoursGrad)" dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>🥧 Time by Subject</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="hours" paddingAngle={3}>
                  {subjectData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v} hrs`, 'Hours']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {subjectData.map(s => (
                <div key={s.subject} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-700 text-xs font-medium flex-1">{s.subject}</span>
                  <span className="text-gray-900 text-xs font-bold">{Math.round(s.hours / 28.5 * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          {/* Bar chart */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>📊 Subject Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={['#7C3AED', '#0284C7', '#059669', '#D97706', '#2563EB', '#DB2777'][i % 6]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill growth area */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>📈 Skill Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={skillGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <YAxis domain={[40, 100]} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                <Line type="monotone" dataKey="uiux" name="UI/UX" stroke="#7C3AED" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="python" name="Python" stroke="#0284C7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="figma" name="Figma" stroke="#D97706" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sql" name="SQL" stroke="#059669" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Career readiness graph */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-5 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>🎯 Career Readiness Over Time</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {careerReadinessData.map(d => (
              <div key={d.month} className="text-center bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>{d.readiness}%</div>
                <div className="text-gray-500 text-xs font-medium">{d.month} 2026</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={careerReadinessData}>
              <defs>
                <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
              <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Career Readiness']} />
              <Area type="monotone" dataKey="readiness" stroke="#0284C7" strokeWidth={2.5} fill="url(#readinessGrad)" dot={{ fill: '#0284C7', r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject analytics */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Subject Deep Dive</h3>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {subjectAnalytics.map(s => (
              <button key={s.id} onClick={() => setSelectedSubject(s)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedSubject.id === s.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                <span>{s.icon}</span> {s.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Current Skill', val: `${selectedSubject.level}%`, color: 'text-violet-700' },
                  { label: 'Time Spent', val: selectedSubject.time, color: 'text-indigo-700' },
                  { label: 'Quiz Average', val: `${selectedSubject.quizAvg}%`, color: 'text-emerald-700' },
                  { label: 'Projects Done', val: `${selectedSubject.projects}`, color: 'text-amber-700' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                    <div className="text-gray-500 text-xs font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-violet-50/70 border border-violet-200 rounded-xl p-4">
                <p className="text-violet-700 text-sm font-bold mb-1">Next Recommended:</p>
                <p className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedSubject.next}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm font-medium mb-3">Skill Growth (Monthly)</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={selectedSubject.growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="m" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, selectedSubject.name]} />
                  <Line type="monotone" dataKey="v" name={selectedSubject.name} stroke={selectedSubject.color} strokeWidth={2.5} dot={{ fill: selectedSubject.color, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
