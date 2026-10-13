import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const radarData = [
  { subject: 'Programming', A: 75 },
  { subject: 'Data', A: 68 },
  { subject: 'AI/ML', A: 58 },
  { subject: 'Design', A: 85 },
  { subject: 'Communication', A: 76 },
  { subject: 'Problem Solving', A: 72 },
];

const skills = [
  { name: 'UI/UX Design', level: 88, category: 'Design', status: 'strong', color: '#8B5CF6', required: 80, careers: ['UI/UX Designer', 'Product Designer', 'Design Lead'], courses: ['Advanced UI Design', 'Design Systems Masterclass'] },
  { name: 'Python', level: 82, category: 'Programming', status: 'strong', color: '#06B6D4', required: 75, careers: ['Data Analyst', 'Data Scientist', 'Python Developer'], courses: ['Python for Data Analytics', 'Python for Data Science'] },
  { name: 'Communication', level: 76, category: 'Soft Skill', status: 'strong', color: '#10B981', required: 70, careers: ['Product Manager', 'UX Designer', 'Team Lead'], courses: ['Professional Communication', 'Presentation Mastery'] },
  { name: 'SQL', level: 76, category: 'Data', status: 'developing', color: '#3B82F6', required: 80, careers: ['Data Analyst', 'Database Engineer', 'Backend Dev'], courses: ['Advanced SQL Queries', 'SQL for Analytics'] },
  { name: 'Problem Solving', level: 72, category: 'Soft Skill', status: 'strong', color: '#14B8A6', required: 70, careers: ['Software Engineer', 'Data Scientist', 'Any Technical Role'], courses: ['Competitive Programming', 'Data Structures'] },
  { name: 'JavaScript', level: 68, category: 'Programming', status: 'developing', color: '#F59E0B', required: 75, careers: ['Frontend Developer', 'Full Stack Developer', 'UI Engineer'], courses: ['Modern JavaScript', 'React Development'] },
  { name: 'C++', level: 71, category: 'Programming', status: 'developing', color: '#EC4899', required: 75, careers: ['Systems Programmer', 'Game Developer', 'Embedded Systems'], courses: ['Advanced C++', 'Competitive C++ Programming'] },
  { name: 'Machine Learning', level: 54, category: 'AI/ML', status: 'needs_improvement', color: '#EF4444', required: 70, careers: ['ML Engineer', 'Data Scientist', 'AI Researcher'], courses: ['ML Fundamentals', 'Deep Learning with Python'] },
  { name: 'Statistics', level: 61, category: 'Data', status: 'needs_improvement', color: '#F97316', required: 75, careers: ['Data Scientist', 'Data Analyst', 'Research Analyst'], courses: ['Statistics for Data Science', 'Probability & Stats'] },
  { name: 'Figma', level: 79, category: 'Design', status: 'developing', color: '#7C3AED', required: 85, careers: ['UI/UX Designer', 'Product Designer', 'UI Engineer'], courses: ['Advanced Figma', 'Figma for Developers'] },
];

const statusGroups = {
  strong: { label: 'Strong Skills', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✅' },
  developing: { label: 'Developing Skills', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '🔄' },
  needs_improvement: { label: 'Needs Improvement', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '⚠️' },
};

export default function SkillProfile() {
  const [selectedSkill, setSelectedSkill] = useState<typeof skills[0] | null>(null);

  const overallScore = Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length);

  return (
    <DashboardLayout title="My Skill Profile">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Skill Profile 📊</h1>
          <p className="text-gray-500 mt-1 font-medium">Your comprehensive skill map based on assessment results and learning history.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Overview + Radar */}
          <div className="space-y-4">
            {/* Score card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-5xl font-bold gradient-text mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{overallScore}%</div>
              <p className="text-gray-500 text-sm font-medium mb-4">Overall Skill Score</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: `${overallScore}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Strong', count: skills.filter(s => s.status === 'strong').length, color: 'text-emerald-600' },
                  { label: 'Growing', count: skills.filter(s => s.status === 'developing').length, color: 'text-amber-600' },
                  { label: 'Needs Work', count: skills.filter(s => s.status === 'needs_improvement').length, color: 'text-red-600' },
                ].map(g => (
                  <div key={g.label} className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                    <div className={`font-bold text-xl ${g.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{g.count}</div>
                    <div className="text-gray-500 text-xs font-medium">{g.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <h3 className="text-gray-900 font-bold mb-3 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Skill Domains Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} />
                  <Radar name="Skills" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, color: '#111827' }}
                    itemStyle={{ color: '#111827' }}
                    formatter={(val) => [`${val}%`, 'Skill']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Status groups */}
            {(Object.keys(statusGroups) as Array<keyof typeof statusGroups>).map(status => (
              <div key={status} className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span>{statusGroups[status].icon}</span>
                  <span className={`text-sm font-bold ${statusGroups[status].color}`}>{statusGroups[status].label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.filter(s => s.status === status).map(s => (
                    <button key={s.name} onClick={() => setSelectedSkill(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${statusGroups[status].bg} ${statusGroups[status].color} hover:opacity-80 transition-opacity`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Skill list */}
          <div className="lg:col-span-2 space-y-3">
            {/* Click hint */}
            {!selectedSkill && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-violet-700 font-medium shadow-2xs">
                <span>👆</span> Click on any skill card or skill name to see detailed information
              </div>
            )}

            {/* Selected skill detail */}
            {selectedSkill && (
              <div className="bg-violet-50/80 border border-violet-200 rounded-2xl p-5 mb-2 animate-fade-in shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-gray-900 text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Skill: {selectedSkill.name}</h3>
                    <span className="text-gray-500 text-sm font-medium">{selectedSkill.category}</span>
                  </div>
                  <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-gray-700 p-1 font-bold">✕</button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white border border-violet-100 rounded-xl p-3 shadow-2xs">
                    <div className="text-2xl font-bold text-violet-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedSkill.level}%</div>
                    <div className="text-gray-500 text-xs font-medium">Current Level</div>
                  </div>
                  <div className="bg-white border border-violet-100 rounded-xl p-3 shadow-2xs">
                    <div className="text-2xl font-bold text-indigo-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedSkill.required}%</div>
                    <div className="text-gray-500 text-xs font-medium">Required for Career</div>
                  </div>
                  <div className="bg-white border border-violet-100 rounded-xl p-3 shadow-2xs">
                    <div className={`text-lg font-bold ${selectedSkill.level >= selectedSkill.required ? 'text-emerald-600' : 'text-amber-600'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {selectedSkill.level >= selectedSkill.required ? '✓ Strong' : `⚠ ${selectedSkill.required - selectedSkill.level}% Gap`}
                    </div>
                    <div className="text-gray-500 text-xs font-medium">Status</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-900 text-sm font-bold mb-2">Related Careers</p>
                    {selectedSkill.careers.map(c => (
                      <div key={c} className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                        {c}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-bold mb-2">Recommended Courses</p>
                    {selectedSkill.courses.map(c => (
                      <Link key={c} to="/courses" className="flex items-center gap-2 text-sm text-violet-700 hover:text-violet-900 font-semibold mb-1">
                        <span>📚</span> {c}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All skills */}
            <div className="space-y-2">
              {skills.map(skill => (
                <button
                  key={skill.name}
                  onClick={() => setSelectedSkill(skill)}
                  className={`w-full text-left bg-white border rounded-xl p-4 hover:border-violet-300 transition-all card-hover shadow-xs ${selectedSkill?.name === skill.name ? 'border-violet-500 bg-violet-50/50' : 'border-gray-200/80'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${skill.color}15`, border: `1px solid ${skill.color}30` }}>
                      {skill.status === 'strong' ? '✅' : skill.status === 'developing' ? '🔄' : '⚠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-bold text-sm">{skill.name}</span>
                          <span className="text-gray-500 text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full font-medium">{skill.category}</span>
                        </div>
                        <span className="text-gray-900 font-bold text-sm flex-shrink-0 ml-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{skill.level}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${skill.level}%`, background: skill.color }} />
                      </div>
                    </div>
                    {skill.level < skill.required && (
                      <span className="flex-shrink-0 text-xs text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-2 py-1 rounded-lg">
                        -{skill.required - skill.level}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Link to="/learning-gap" className="block text-center mt-4 bg-violet-50 border border-violet-200 text-violet-700 font-bold py-3 rounded-xl hover:bg-violet-100 transition-colors shadow-2xs" style={{ fontFamily: 'Outfit, sans-serif' }}>
              View My Learning Gaps →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
