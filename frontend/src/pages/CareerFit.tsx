import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const careers = [
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    fit: 91,
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-indigo-600',
    bg: 'from-violet-900/40 to-indigo-900/30',
    border: 'border-violet-700/40',
    icon: '🎨',
    avgSalary: '₹8-18 LPA',
    time: '4 months',
    matchingSkills: ['UI/UX Design (88%)', 'Communication (76%)', 'Problem Solving (72%)', 'Figma (79%)'],
    missingSkills: ['User Research', 'Advanced Prototyping'],
    why: 'Your natural creative and visual thinking score of 88% in UI/UX Design, combined with strong communication skills, makes you an ideal candidate for UX-focused roles. Your Figma skills are close to the required level.',
    demand: 'High',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    fit: 87,
    color: '#06B6D4',
    gradient: 'from-cyan-600 to-blue-600',
    bg: 'from-cyan-900/40 to-blue-900/30',
    border: 'border-cyan-700/40',
    icon: '📊',
    avgSalary: '₹6-15 LPA',
    time: '3 months',
    matchingSkills: ['Python (82%)', 'SQL (76%)', 'Problem Solving (72%)', 'Communication (76%)'],
    missingSkills: ['Advanced SQL', 'Statistics', 'Data Visualization'],
    why: 'Your strong Python and analytical skills align well with Data Analyst requirements. With your 76% SQL baseline and Python proficiency, you\'re already close to industry-ready for entry-level data analyst roles.',
    demand: 'Very High',
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    fit: 81,
    color: '#10B981',
    gradient: 'from-emerald-600 to-teal-600',
    bg: 'from-emerald-900/40 to-teal-900/30',
    border: 'border-emerald-700/40',
    icon: '💻',
    avgSalary: '₹7-16 LPA',
    time: '5 months',
    matchingSkills: ['UI/UX Design (88%)', 'HTML/CSS (68%)', 'Problem Solving (72%)'],
    missingSkills: ['Advanced JavaScript', 'React Framework', 'Git/GitHub'],
    why: 'Your design skills give you an exceptional advantage as a frontend developer — you can implement beautiful, functional UIs that most developers can\'t. JavaScript proficiency is the main gap to close.',
    demand: 'High',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    fit: 74,
    color: '#F59E0B',
    gradient: 'from-amber-600 to-orange-600',
    bg: 'from-amber-900/40 to-orange-900/30',
    border: 'border-amber-700/40',
    icon: '🤖',
    avgSalary: '₹10-25 LPA',
    time: '8 months',
    matchingSkills: ['Python (82%)', 'SQL (76%)', 'Problem Solving (72%)'],
    missingSkills: ['Machine Learning', 'Statistics', 'Deep Learning', 'Feature Engineering'],
    why: 'Data Science is a strong long-term path given your Python foundation. However, it requires significant ML and statistics knowledge. With focused learning, this is achievable but will take longer than your top matches.',
    demand: 'Very High',
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    fit: 68,
    color: '#EF4444',
    gradient: 'from-red-600 to-rose-600',
    bg: 'from-red-900/30 to-rose-900/20',
    border: 'border-red-700/30',
    icon: '⚙️',
    avgSalary: '₹8-20 LPA',
    time: '7 months',
    matchingSkills: ['Python (82%)', 'SQL (76%)', 'C++ (71%)'],
    missingSkills: ['System Design', 'API Development', 'Cloud/DevOps', 'Databases (Advanced)'],
    why: 'You have a solid programming foundation with Python and C++, but backend development requires deeper system design and architecture knowledge. This path is achievable with focused learning over 6-7 months.',
    demand: 'High',
  },
];

function FitBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-bold text-sm w-10 text-right" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}%</span>
    </div>
  );
}

export default function CareerFit() {
  return (
    <DashboardLayout title="Career Fit">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Where Do You Fit Best? 🎯</h1>
          <p className="text-gray-500 mt-1 font-medium">AI-powered career matching based on your unique skill profile, interests, and assessment results.</p>
        </div>

        {/* Top match hero */}
        <div className="relative bg-violet-50/80 border border-violet-200 rounded-2xl p-6 mb-6 overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-200/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-3 py-0.5 rounded-full font-bold">🏆 Best Match</span>
              </div>
              <h2 className="text-gray-900 text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>UI/UX Designer</h2>
              <p className="text-gray-600 text-sm mt-1 font-medium">Your natural strengths align perfectly with this career</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>91%</div>
              <div className="text-violet-700 font-semibold text-sm">Career Fit</div>
            </div>
          </div>
        </div>

        {/* Career grid */}
        <div className="space-y-4">
          {careers.map((career, rank) => (
            <div key={career.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 card-hover shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                {/* Left: Title and fit */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{career.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>{career.title}</h3>
                        {rank === 0 && <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">Top Match</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 text-xs font-medium">Avg: {career.avgSalary}</span>
                        <span className="text-gray-400 text-xs">·</span>
                        <span className={`text-xs font-semibold ${career.demand === 'Very High' ? 'text-emerald-700' : 'text-amber-700'}`}>{career.demand} Demand</span>
                      </div>
                    </div>
                  </div>
                  <FitBar value={career.fit} color={career.color} />
                  <div className="text-gray-500 text-xs font-medium mt-1.5">~{career.time} to reach</div>
                </div>

                {/* Middle: Skills */}
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-700 text-xs font-bold mb-2 flex items-center gap-1"><span>✓</span> Matching Skills</p>
                    {career.matchingSkills.map(s => (
                      <div key={s} className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-amber-700 text-xs font-bold mb-2 flex items-center gap-1"><span>⚠</span> Needs Improvement</p>
                    {career.missingSkills.map(s => (
                      <div key={s} className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Why + CTA */}
                <div className="lg:w-56 flex-shrink-0 flex flex-col justify-between gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 leading-relaxed hidden lg:block font-medium">
                    <span className="text-gray-900 font-bold block mb-1">Why this matches you:</span>
                    {career.why.substring(0, 120)}...
                  </div>
                  <Link
                    to={`/career/${career.id}`}
                    className={`block text-center bg-gradient-to-r ${career.gradient} text-white font-semibold py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-sm`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    Explore Career →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
