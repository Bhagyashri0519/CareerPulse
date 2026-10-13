import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { RadialBarChart, RadialBar, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const subjects = [
  { name: 'UI/UX Design', score: 88, color: '#8B5CF6', bg: 'from-violet-500 to-violet-400' },
  { name: 'Python', score: 82, color: '#06B6D4', bg: 'from-cyan-500 to-cyan-400' },
  { name: 'SQL', score: 76, color: '#10B981', bg: 'from-emerald-500 to-emerald-400' },
  { name: 'JavaScript', score: 68, color: '#3B82F6', bg: 'from-blue-500 to-blue-400' },
  { name: 'C++', score: 71, color: '#F59E0B', bg: 'from-amber-500 to-amber-400' },
  { name: 'Data Science', score: 61, color: '#EF4444', bg: 'from-red-500 to-red-400' },
  { name: 'Machine Learning', score: 54, color: '#EC4899', bg: 'from-pink-500 to-pink-400' },
  { name: 'Communication', score: 76, color: '#14B8A6', bg: 'from-teal-500 to-teal-400' },
];

const overallScore = 78;

function CircleScore({ score, size = 140 }: { score: number; size?: number }) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#grad)" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <text x={size / 2} y={size / 2 - 8} textAnchor="middle" fill="#111827" fontSize="28" fontWeight="bold" fontFamily="Outfit">
        {score}%
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="500">
        Overall Score
      </text>
    </svg>
  );
}

function getScoreLabel(score: number) {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
  if (score >= 55) return { label: 'Average', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Needs Work', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
}

export default function AssessmentResult() {
  const radialData = subjects.map(s => ({ name: s.name, value: s.score, fill: s.color }));

  return (
    <DashboardLayout title="Assessment Results">
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 text-sm font-bold">Assessment Complete</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Career Intelligence Report is Ready 🎯
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">
            Based on your 25-question assessment, here&apos;s your detailed skill profile. This data powers your personalized career recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Overall score */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xs">
            <CircleScore score={overallScore} size={160} />
            <div className="mt-4 text-center">
              <p className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Overall Profile Score</p>
              <p className="text-gray-500 text-sm mt-1">Based on 25 questions across 8 domains</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              {[
                { label: 'Strong', val: '3', color: 'text-emerald-600' },
                { label: 'Good', val: '3', color: 'text-blue-600' },
                { label: 'Growing', val: '2', color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                  <div className={`font-bold text-lg ${s.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                  <div className="text-gray-500 text-xs font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radial chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Subject Performance Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="15%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#F3F4F6' }}>
                  {radialData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </RadialBar>
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, color: '#111827' }}
                  itemStyle={{ color: '#111827' }}
                  formatter={(val) => [`${val}%`, 'Score']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject scores */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Detailed Subject Performance</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map(sub => {
              const { label, color, bg } = getScoreLabel(sub.score);
              return (
                <div key={sub.name} className="flex items-center gap-4 bg-gray-50/80 border border-gray-200/60 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 text-sm font-semibold">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${bg} ${color}`}>{label}</span>
                        <span className="text-gray-900 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{sub.score}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${sub.bg} rounded-full`}
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">✨</div>
            <div>
              <h3 className="text-gray-900 font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>CareerPulse AI Insights</h3>
              <div className="space-y-2 text-sm text-gray-700 font-medium">
                <p>🎨 <strong className="text-gray-900 font-bold">Your strongest domain is UI/UX Design (88%)</strong> — you have natural creative and visual thinking abilities that align with design-centric careers.</p>
                <p>💡 <strong className="text-gray-900 font-bold">Career recommendation: UI/UX Designer</strong> — your combined profile of design, Python, and communication skills creates a strong fit with a 91% career match.</p>
                <p>⚠️ <strong className="text-gray-900 font-bold">Primary growth area: Machine Learning (54%) and Data Science (61%)</strong> — while not critical for your top career choice, these skills could expand your versatility significantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/skills"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md shadow-violet-200 hover:shadow-lg transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            View My Skill Profile →
          </Link>
          <Link
            to="/career-fit"
            className="flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-xs"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            See Career Matches
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
