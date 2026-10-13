import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const careerData: Record<string, {
  title: string; fit: number; readiness: number; icon: string;
  color: string; gradient: string;
  salary: string; demand: string; growth: string;
  skills: { name: string; have: boolean; level?: number; required: number }[];
  description: string; companies: string[];
}> = {
  uiux: {
    title: 'UI/UX Designer', fit: 91, readiness: 72, icon: '🎨',
    color: '#8B5CF6', gradient: 'from-violet-600 to-indigo-600',
    salary: '₹8-18 LPA', demand: 'High', growth: '25% YoY',
    description: 'UI/UX Designers create intuitive and beautiful digital experiences by understanding user needs and translating them into functional, visually appealing interfaces.',
    companies: ['Google', 'Zomato', 'CRED', 'Razorpay', 'Figma', 'Adobe', 'Swiggy'],
    skills: [
      { name: 'UX Research', have: false, level: 54, required: 80 },
      { name: 'Wireframing', have: true, level: 82, required: 75 },
      { name: 'Figma', have: false, level: 79, required: 85 },
      { name: 'Prototyping', have: false, level: 62, required: 85 },
      { name: 'User Testing', have: false, level: 45, required: 75 },
      { name: 'Design Systems', have: false, level: 55, required: 80 },
      { name: 'HTML/CSS Basics', have: false, level: 68, required: 75 },
      { name: 'UI/UX Design', have: true, level: 88, required: 80 },
      { name: 'Communication', have: true, level: 76, required: 70 },
    ],
  },
  'data-analyst': {
    title: 'Data Analyst', fit: 87, readiness: 68, icon: '📊',
    color: '#06B6D4', gradient: 'from-cyan-600 to-blue-600',
    salary: '₹6-15 LPA', demand: 'Very High', growth: '35% YoY',
    description: 'Data Analysts transform raw data into actionable business insights using SQL, Python, and visualization tools to help organizations make informed decisions.',
    companies: ['Amazon', 'Flipkart', 'Paytm', 'HDFC', 'Infosys', 'Deloitte', 'MakeMyTrip'],
    skills: [
      { name: 'SQL', have: false, level: 76, required: 85 },
      { name: 'Python', have: true, level: 82, required: 80 },
      { name: 'Statistics', have: false, level: 61, required: 75 },
      { name: 'Data Visualization', have: false, level: 65, required: 80 },
      { name: 'Excel/Sheets', have: true, level: 78, required: 70 },
      { name: 'Communication', have: true, level: 76, required: 70 },
      { name: 'Power BI/Tableau', have: false, level: 35, required: 70 },
    ],
  },
  frontend: {
    title: 'Frontend Developer', fit: 81, readiness: 60, icon: '💻',
    color: '#10B981', gradient: 'from-emerald-600 to-teal-600',
    salary: '₹7-16 LPA', demand: 'High', growth: '20% YoY',
    description: 'Frontend Developers build the visual and interactive parts of web applications, translating designs into responsive, performant, and accessible user interfaces.',
    companies: ['Atlassian', 'Freshworks', 'Zoho', 'Dunzo', 'PhonePe', 'Meesho'],
    skills: [
      { name: 'HTML/CSS', have: false, level: 68, required: 85 },
      { name: 'JavaScript', have: false, level: 68, required: 90 },
      { name: 'React', have: false, level: 45, required: 80 },
      { name: 'UI/UX Design', have: true, level: 88, required: 60 },
      { name: 'Git/GitHub', have: false, level: 55, required: 75 },
      { name: 'TypeScript', have: false, level: 30, required: 65 },
      { name: 'Performance', have: false, level: 40, required: 65 },
    ],
  },
  'data-scientist': {
    title: 'Data Scientist', fit: 74, readiness: 52, icon: '🤖',
    color: '#F59E0B', gradient: 'from-amber-600 to-orange-600',
    salary: '₹10-25 LPA', demand: 'Very High', growth: '40% YoY',
    description: 'Data Scientists build ML models and use statistical analysis to extract deep insights and build predictive systems that drive business intelligence.',
    companies: ['Google', 'Microsoft', 'Ola', 'Navi', 'Quantiphi', 'Tiger Analytics'],
    skills: [
      { name: 'Python', have: true, level: 82, required: 90 },
      { name: 'Machine Learning', have: false, level: 54, required: 85 },
      { name: 'Statistics', have: false, level: 61, required: 85 },
      { name: 'SQL', have: true, level: 76, required: 75 },
      { name: 'Deep Learning', have: false, level: 35, required: 70 },
      { name: 'Feature Engineering', have: false, level: 45, required: 75 },
    ],
  },
  backend: {
    title: 'Backend Developer', fit: 68, readiness: 48, icon: '⚙️',
    color: '#EF4444', gradient: 'from-red-600 to-rose-600',
    salary: '₹8-20 LPA', demand: 'High', growth: '22% YoY',
    description: 'Backend Developers build the server-side logic, APIs, and databases that power web applications, focusing on performance, security, and scalability.',
    companies: ['Razorpay', 'Zepto', 'Rapido', 'Nykaa', 'Byju\'s', 'Unacademy'],
    skills: [
      { name: 'Python/Java', have: true, level: 75, required: 85 },
      { name: 'SQL/Databases', have: false, level: 76, required: 85 },
      { name: 'System Design', have: false, level: 40, required: 75 },
      { name: 'REST APIs', have: false, level: 50, required: 80 },
      { name: 'Cloud (AWS/GCP)', have: false, level: 35, required: 65 },
      { name: 'Docker/DevOps', have: false, level: 25, required: 60 },
    ],
  },
};

export default function CareerDetail() {
  const { id } = useParams<{ id: string }>();
  const career = careerData[id || 'uiux'] || careerData['uiux'];

  const haveSkills = career.skills.filter(s => s.have);
  const needSkills = career.skills.filter(s => !s.have);

  return (
    <DashboardLayout title={career.title}>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link to="/career-fit" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Back to Career Fit
        </Link>

        {/* Hero */}
        <div className="relative bg-violet-50/80 border border-violet-200 rounded-2xl p-6 mb-6 overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{career.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{career.title.toUpperCase()}</h1>
                  <p className="text-gray-600 text-sm font-medium">{career.description.substring(0, 80)}...</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[career.salary, `Demand: ${career.demand}`, `Growth: ${career.growth}`].map(tag => (
                  <span key={tag} className="text-xs bg-white border border-violet-200 text-violet-700 font-semibold px-3 py-1 rounded-full shadow-2xs">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="bg-white border border-violet-100 rounded-xl p-4 text-center shadow-xs">
                <div className="text-3xl font-bold" style={{ color: career.color, fontFamily: 'Outfit, sans-serif' }}>{career.fit}%</div>
                <div className="text-gray-500 text-xs font-medium">Career Fit</div>
              </div>
              <div className="bg-white border border-violet-100 rounded-xl p-4 text-center shadow-xs">
                <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{career.readiness}%</div>
                <div className="text-gray-500 text-xs font-medium">Avg Readiness</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Skills you have */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-emerald-700 font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span>✅</span> You Already Have ({haveSkills.length})
            </h3>
            <div className="space-y-3.5">
              {haveSkills.map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-gray-800">{skill.name}</span>
                    <span className="text-emerald-700 font-bold">{skill.level}% / {skill.required}% req.</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full" style={{ width: `${skill.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills to learn */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-amber-700 font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span>📚</span> You Need to Learn ({needSkills.length})
            </h3>
            <div className="space-y-3.5">
              {needSkills.map(skill => {
                const gap = skill.required - (skill.level || 0);
                return (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span className="text-gray-800">{skill.name}</span>
                      <span className="text-amber-700 font-bold">{skill.level}% → {skill.required}% ({gap} gap)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${skill.level}%` }} />
                      <div className="absolute inset-y-0 right-0 border-l-2 border-gray-300 border-dashed" style={{ left: `${skill.required}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Companies Hiring {career.title}s</h3>
          <div className="flex flex-wrap gap-2">
            {career.companies.map(c => (
              <span key={c} className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Personalized path preview */}
        <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Personalized Path</h3>
          <p className="text-gray-600 text-sm mb-4 font-medium">Based on your assessment and this career, CareerPulse has designed a custom learning path just for you.</p>
          <div className="flex flex-wrap gap-2">
            {['UI/UX Fundamentals ✓', 'Figma Basics ✓', 'Advanced Figma →', 'UX Research', 'Prototyping', 'Design Systems', '2 Portfolio Projects'].map((step, i) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                step.includes('✓') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : step.includes('→') ? 'bg-violet-100 border border-violet-300 text-violet-800'
                : 'bg-white border border-gray-200 text-gray-500'
              }`}>{step}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/roadmap"
            className={`flex-1 text-center bg-gradient-to-r ${career.gradient} text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Start This Career Path →
          </Link>
          <Link
            to="/courses"
            className="flex-1 text-center bg-white text-gray-700 font-semibold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-xs"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
