import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const careers = ['UI/UX Designer', 'Data Analyst', 'Frontend Developer', 'Data Scientist', 'Backend Developer'];

type GapStatus = 'ready' | 'small_gap' | 'gap' | 'major_gap';

const gapData: Record<string, { skill: string; current: number; required: number; status: GapStatus; insight: string }[]> = {
  'UI/UX Designer': [
    { skill: 'UI/UX Design', current: 88, required: 80, status: 'ready', insight: 'Your UI/UX skill exceeds the requirement. You\'re well-positioned for this career.' },
    { skill: 'Figma', current: 79, required: 85, status: 'small_gap', insight: 'Your Figma skill is 6% below the recommended level. Complete the Advanced Figma course (12 hrs) to close this gap.' },
    { skill: 'HTML/CSS', current: 68, required: 75, status: 'gap', insight: 'HTML/CSS knowledge is required for UI implementation. Focus on CSS Grid, Flexbox, and responsive design fundamentals.' },
    { skill: 'User Research', current: 54, required: 80, status: 'major_gap', insight: 'This is your most critical gap. User research forms the foundation of UX work. Start with the UX Research Fundamentals course immediately.' },
    { skill: 'Prototyping', current: 62, required: 85, status: 'gap', insight: 'Prototyping skills are essential for UI/UX roles. Learn Figma prototyping, interactive components, and user testing workflows.' },
    { skill: 'Communication', current: 76, required: 70, status: 'ready', insight: 'Your communication skills meet the standard. Continue building your presentation and stakeholder management abilities.' },
  ],
  'Data Analyst': [
    { skill: 'SQL', current: 76, required: 85, status: 'gap', insight: 'SQL is the #1 skill for data analysts. Focus on complex joins, window functions, and query optimization.' },
    { skill: 'Python', current: 82, required: 80, status: 'ready', insight: 'Your Python skills meet the requirement. Focus on Pandas, NumPy, and data visualization libraries.' },
    { skill: 'Statistics', current: 61, required: 75, status: 'gap', insight: 'Statistical knowledge is critical for deriving meaningful insights. Study hypothesis testing, regression analysis, and probability.' },
    { skill: 'Data Visualization', current: 65, required: 80, status: 'gap', insight: 'Data storytelling through visualization is key. Learn Tableau, Power BI, or Python\'s Seaborn/Matplotlib.' },
    { skill: 'Communication', current: 76, required: 70, status: 'ready', insight: 'Strong communication helps you present findings effectively to stakeholders.' },
  ],
  'Frontend Developer': [
    { skill: 'HTML/CSS', current: 68, required: 85, status: 'gap', insight: 'HTML/CSS is fundamental for frontend dev. Master Flexbox, Grid, animations, and responsive design.' },
    { skill: 'JavaScript', current: 68, required: 90, status: 'major_gap', insight: 'JavaScript is the core skill for frontend development. This is your biggest gap — start with modern ES6+ and React fundamentals.' },
    { skill: 'React', current: 45, required: 80, status: 'major_gap', insight: 'React is the most in-demand frontend framework. Learn components, hooks, state management, and routing.' },
    { skill: 'UI/UX Design', current: 88, required: 60, status: 'ready', insight: 'Your design sense gives you an edge as a frontend developer who can implement pixel-perfect UIs.' },
    { skill: 'Git/GitHub', current: 55, required: 75, status: 'gap', insight: 'Version control is non-negotiable in professional development. Learn branching, PRs, and collaboration workflows.' },
  ],
  'Data Scientist': [
    { skill: 'Python', current: 82, required: 90, status: 'gap', insight: 'Strong Python is essential for data science. Focus on Scikit-learn, TensorFlow, and ML workflows.' },
    { skill: 'Machine Learning', current: 54, required: 85, status: 'major_gap', insight: 'ML is the core of data science. This is your largest gap — start with supervised learning, then move to deep learning.' },
    { skill: 'Statistics', current: 61, required: 85, status: 'major_gap', insight: 'Advanced statistics underpins all ML work. Study probability, Bayesian methods, and statistical testing.' },
    { skill: 'SQL', current: 76, required: 75, status: 'ready', insight: 'Your SQL meets the requirement for querying large datasets.' },
    { skill: 'Data Visualization', current: 65, required: 75, status: 'gap', insight: 'Communicating ML results visually is a critical skill.' },
  ],
  'Backend Developer': [
    { skill: 'Python', current: 82, required: 85, status: 'small_gap', insight: 'Close to target. Focus on FastAPI, Django, and REST API design patterns.' },
    { skill: 'SQL', current: 76, required: 85, status: 'gap', insight: 'Database design and optimization are crucial for backend roles.' },
    { skill: 'System Design', current: 40, required: 75, status: 'major_gap', insight: 'System design is the biggest gap for backend development. Study microservices, APIs, caching, and scalability.' },
    { skill: 'Java/C++', current: 71, required: 75, status: 'small_gap', insight: 'Minor gap. Strengthen your OOP patterns and frameworks knowledge.' },
    { skill: 'Cloud/DevOps', current: 35, required: 65, status: 'major_gap', insight: 'Cloud skills (AWS, GCP) are increasingly required for backend roles.' },
  ],
};

const statusConfig = {
  ready: { label: '✓ Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'from-emerald-600 to-emerald-500' },
  small_gap: { label: '⚠ Small Gap', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', bar: 'from-amber-500 to-amber-400' },
  gap: { label: '⚠ Gap', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', bar: 'from-orange-500 to-orange-400' },
  major_gap: { label: '🔴 Major Gap', color: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'from-red-600 to-red-500' },
};

export default function LearningGap() {
  const [selectedCareer, setSelectedCareer] = useState('UI/UX Designer');
  const gaps = gapData[selectedCareer] || [];
  const readyCount = gaps.filter(g => g.status === 'ready').length;
  const totalGap = Math.round(gaps.filter(g => g.status !== 'ready').length / gaps.length * 100);

  return (
    <DashboardLayout title="Learning Gaps">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>What Are You Missing? ⚠️</h1>
          <p className="text-gray-500 mt-1 font-medium">Compare your current skills with the skills required for your target career.</p>
        </div>

        {/* Career selector */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 shadow-xs">
          <p className="text-gray-500 text-sm font-medium mb-3">Select Target Career</p>
          <div className="flex flex-wrap gap-2">
            {careers.map(c => (
              <button key={c} onClick={() => setSelectedCareer(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCareer === c
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Visual flow */}
        <div className="hidden md:flex items-center justify-center gap-4 mb-6">
          {[
            { label: 'CURRENT SKILLS', icon: '📊', color: 'bg-violet-50 border-violet-200 text-violet-700' },
            { label: '↓', icon: '', color: '' },
            { label: 'LEARNING GAPS', icon: '⚠️', color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: '↓', icon: '', color: '' },
            { label: 'TARGET CAREER', icon: '🎯', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          ].map((item, i) =>
            item.label === '↓'
              ? <div key={i} className="text-gray-400 text-xl font-bold">→</div>
              : <div key={i} className={`border rounded-xl px-5 py-3 text-center ${item.color} shadow-2xs`}>
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs font-bold tracking-wider">{item.label}</div>
                </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3.5 mb-6">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-center shadow-xs">
            <div className="text-3xl font-bold text-emerald-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{readyCount}</div>
            <div className="text-emerald-700 text-xs font-semibold mt-1">Skills Ready</div>
          </div>
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-center shadow-xs">
            <div className="text-3xl font-bold text-amber-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{gaps.length - readyCount}</div>
            <div className="text-amber-700 text-xs font-semibold mt-1">Gaps to Close</div>
          </div>
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-center shadow-xs">
            <div className="text-3xl font-bold text-red-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{totalGap}%</div>
            <div className="text-red-700 text-xs font-semibold mt-1">Overall Gap</div>
          </div>
        </div>

        {/* Gap table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden mb-6 shadow-xs">
          <div className="px-5 py-4 border-b border-gray-200/80 bg-gray-50/50">
            <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Skill Gap Analysis — {selectedCareer}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {gaps.map(g => {
              const cfg = statusConfig[g.status];
              const diff = g.required - g.current;
              return (
                <div key={g.skill} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="sm:w-36 flex-shrink-0">
                      <span className="text-gray-900 font-bold text-sm">{g.skill}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-gray-500">Your level</span>
                            <span className="text-gray-900 font-bold">{g.current}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full`} style={{ width: `${g.current}%` }} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-gray-500">Required</span>
                            <span className="text-gray-900 font-bold">{g.required}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-200 rounded-full relative">
                              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${g.required}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {g.status === 'ready' ? cfg.label : `${cfg.label} (${Math.abs(diff)}%)`}
                      </span>
                    </div>
                  </div>
                  {g.status !== 'ready' && (
                    <div className="mt-3 bg-violet-50/60 border border-violet-100 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm">
                      <span className="text-violet-600 flex-shrink-0 mt-0.5">✨</span>
                      <p className="text-gray-700 font-medium">{g.insight}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/roadmap"
            className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-violet-200 hover:shadow-lg transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Generate My Learning Path →
          </Link>
          <Link
            to="/career-fit"
            className="flex-1 text-center bg-white text-gray-700 font-semibold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-xs"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Explore Career Matches
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
