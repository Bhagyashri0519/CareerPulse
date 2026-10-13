import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

const courses = [
  { id: 1, name: 'Advanced Figma', category: 'Design', level: 'Intermediate' as Level, duration: '12 hrs', skills: ['Auto Layout', 'Components', 'Prototyping', 'Variables'], progress: 0, relevance: 92, icon: '🎨', recommended: true, reason: 'Closes your Figma gap for UI/UX Designer' },
  { id: 2, name: 'UX Research Fundamentals', category: 'Design', level: 'Beginner' as Level, duration: '10 hrs', skills: ['User Interviews', 'Surveys', 'Usability Testing', 'Personas'], progress: 0, relevance: 89, icon: '🔍', recommended: true, reason: 'Your biggest gap for UI/UX career' },
  { id: 3, name: 'Design Systems Masterclass', category: 'Design', level: 'Advanced' as Level, duration: '15 hrs', skills: ['Tokens', 'Component Libraries', 'Documentation', 'Figma'], progress: 0, relevance: 86, icon: '🏗️', recommended: true, reason: 'Essential for senior UI/UX roles' },
  { id: 4, name: 'UI/UX Fundamentals', category: 'Design', level: 'Beginner' as Level, duration: '8 hrs', skills: ['User Flows', 'Wireframing', 'UI Principles', 'Typography'], progress: 100, relevance: 95, icon: '🎭', recommended: false, reason: '' },
  { id: 5, name: 'Python for Data Analytics', category: 'Data', level: 'Intermediate' as Level, duration: '20 hrs', skills: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn'], progress: 45, relevance: 78, icon: '🐍', recommended: false, reason: '' },
  { id: 6, name: 'SQL for Data Analytics', category: 'Data', level: 'Intermediate' as Level, duration: '14 hrs', skills: ['JOINs', 'Aggregations', 'Window Functions', 'CTEs'], progress: 0, relevance: 75, icon: '🗄️', recommended: false, reason: '' },
  { id: 7, name: 'Python for Data Science', category: 'Data', level: 'Advanced' as Level, duration: '25 hrs', skills: ['Scikit-learn', 'Feature Engineering', 'EDA', 'Model Evaluation'], progress: 0, relevance: 60, icon: '📊', recommended: false, reason: '' },
  { id: 8, name: 'Machine Learning Fundamentals', category: 'AI/ML', level: 'Intermediate' as Level, duration: '30 hrs', skills: ['Supervised Learning', 'Classification', 'Regression', 'Cross-validation'], progress: 0, relevance: 55, icon: '🤖', recommended: false, reason: '' },
  { id: 9, name: 'Deep Learning with Python', category: 'AI/ML', level: 'Advanced' as Level, duration: '35 hrs', skills: ['Neural Networks', 'TensorFlow', 'CNNs', 'Transfer Learning'], progress: 0, relevance: 45, icon: '🧠', recommended: false, reason: '' },
  { id: 10, name: 'Generative AI Fundamentals', category: 'AI/ML', level: 'Beginner' as Level, duration: '8 hrs', skills: ['LLMs', 'Prompt Engineering', 'RAG', 'API Usage'], progress: 0, relevance: 50, icon: '✨', recommended: false, reason: '' },
  { id: 11, name: 'Modern JavaScript', category: 'Development', level: 'Intermediate' as Level, duration: '22 hrs', skills: ['ES6+', 'Async/Await', 'Modules', 'DOM API'], progress: 20, relevance: 65, icon: '⚡', recommended: false, reason: '' },
  { id: 12, name: 'React Development', category: 'Development', level: 'Intermediate' as Level, duration: '28 hrs', skills: ['Components', 'Hooks', 'State', 'Router'], progress: 0, relevance: 62, icon: '⚛️', recommended: false, reason: '' },
  { id: 13, name: 'Git & GitHub Mastery', category: 'Technology', level: 'Beginner' as Level, duration: '6 hrs', skills: ['Branching', 'Pull Requests', 'Collaboration', 'GitHub Actions'], progress: 60, relevance: 70, icon: '🔀', recommended: false, reason: '' },
  { id: 14, name: 'Statistics for Data Science', category: 'Data', level: 'Intermediate' as Level, duration: '18 hrs', skills: ['Probability', 'Distributions', 'Hypothesis Testing', 'Bayesian'], progress: 0, relevance: 58, icon: '📈', recommended: false, reason: '' },
  { id: 15, name: 'Cloud Computing with AWS', category: 'Technology', level: 'Beginner' as Level, duration: '16 hrs', skills: ['EC2', 'S3', 'Lambda', 'IAM', 'RDS'], progress: 0, relevance: 45, icon: '☁️', recommended: false, reason: '' },
  { id: 16, name: 'Full Stack Development', category: 'Development', level: 'Advanced' as Level, duration: '40 hrs', skills: ['React', 'Node.js', 'MongoDB', 'REST APIs'], progress: 0, relevance: 55, icon: '🌐', recommended: false, reason: '' },
];

const categories = ['All', 'Design', 'Data', 'AI/ML', 'Development', 'Technology'];
const levels: ('All' | Level)[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const levelColors: Record<string, string> = {
  Beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  Advanced: 'text-red-700 bg-red-50 border-red-200',
};

export default function CourseHub() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState<'All' | Level>('All');

  const recommended = courses.filter(c => c.recommended);
  const filtered = courses.filter(c =>
    (category === 'All' || c.category === category) &&
    (level === 'All' || c.level === level) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <DashboardLayout title="Course Hub">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Learn What You Need. Nothing More. 📚</h1>
          <p className="text-gray-500 mt-1 font-medium">AI-curated courses based on your skill gaps and career goals. All courses are free.</p>
        </div>

        {/* Recommended courses */}
        <div className="bg-violet-50/80 border border-violet-200 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">✨</span>
            <h2 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Recommended For You</h2>
            <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full font-bold">AI Curated</span>
          </div>
          <p className="text-gray-600 text-sm mb-4 font-medium">Because you want to become a <strong className="text-violet-700 font-bold">UI/UX Designer</strong>:</p>

          <div className="grid sm:grid-cols-3 gap-3.5">
            {recommended.map((course, i) => (
              <div key={course.id} className="bg-white border border-violet-100 rounded-xl p-4 hover:border-violet-300 transition-all card-hover shadow-xs">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{course.icon}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-violet-700 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.relevance}%</span>
                    <span className="text-gray-400 text-xs font-medium">Relevant</span>
                  </div>
                </div>
                <h3 className="text-gray-900 font-bold text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{i + 1}. {course.name}</h3>
                <p className="text-violet-700 text-xs mb-3 font-semibold">{course.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-medium">{course.duration}</span>
                  <Link to="/roadmap" className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:shadow-xs transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Start →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses, skills..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 text-sm transition-colors shadow-xs"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {levels.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${level === l ? 'bg-violet-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-50'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${category === cat ? 'bg-violet-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-50'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div key={course.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-violet-300 transition-all card-hover flex flex-col shadow-xs">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-2xl">
                    {course.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${levelColors[course.level]}`}>{course.level}</span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">FREE</span>
                  </div>
                </div>
                {course.relevance >= 85 && (
                  <span className="text-xs text-violet-700 font-bold bg-violet-50 border border-violet-200 px-2 py-1 rounded-lg">{course.relevance}% Match</span>
                )}
              </div>

              <h3 className="text-gray-900 font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.name}</h3>
              <p className="text-gray-500 text-xs mb-3 font-medium">{course.category} · {course.duration}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {course.skills.slice(0, 3).map(s => (
                  <span key={s} className="text-xs text-gray-600 bg-gray-100 border border-gray-200 font-medium px-2 py-0.5 rounded-md">{s}</span>
                ))}
                {course.skills.length > 3 && <span className="text-xs text-gray-400 font-medium">+{course.skills.length - 3}</span>}
              </div>

              {course.progress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-violet-700 font-bold">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-auto flex gap-2">
                <Link to="/roadmap"
                  className="flex-1 text-center bg-violet-50 border border-violet-200 text-violet-700 font-bold py-2.5 rounded-xl text-sm hover:bg-violet-600 hover:text-white transition-all shadow-2xs"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {course.progress > 0 ? 'Continue' : 'Start Learning'}
                </Link>
                <button className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  Info
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>No courses found</p>
            <p className="text-gray-500 text-sm mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
