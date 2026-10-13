import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

type Category = 'All' | 'Internships' | 'Hackathons' | 'Certifications' | 'Workshops' | 'Courses' | 'Jobs';

const opportunities = [
  {
    id: 1, type: 'Internships' as Category, icon: '💼', title: 'UI/UX Design Intern', company: 'Razorpay', location: 'Bangalore (Remote)', stipend: '₹25,000/month', deadline: 'Apr 30, 2026', match: 91,
    reason: 'Recommended because you are targeting UI/UX Designer and your design skills (88%) are above the required threshold.',
    tags: ['Figma', 'User Research', 'Prototyping'], badge: '🔥 Hot', color: 'from-violet-600 to-indigo-600',
  },
  {
    id: 2, type: 'Internships' as Category, icon: '💼', title: 'Product Design Intern', company: 'CRED', location: 'Bangalore', stipend: '₹30,000/month', deadline: 'May 5, 2026', match: 88,
    reason: 'CRED is known for its exceptional design culture. Your 88% UI/UX skill aligns well with their hiring standards.',
    tags: ['UI Design', 'Figma', 'Motion Design'], badge: '', color: 'from-violet-600 to-indigo-600',
  },
  {
    id: 3, type: 'Hackathons' as Category, icon: '⚡', title: 'Smart India Hackathon 2026', company: 'Government of India', location: 'Pan-India', stipend: '₹1,00,000 Prize', deadline: 'May 20, 2026', match: 85,
    reason: 'Recommended because your problem-solving score (72%) and UI/UX skills are ideal for national hackathon challenges.',
    tags: ['AI/ML', 'Design', 'Innovation'], badge: '🏆 National', color: 'from-amber-600 to-orange-600',
  },
  {
    id: 4, type: 'Hackathons' as Category, icon: '⚡', title: 'HackBlue Design Challenge', company: 'Adobe', location: 'Online', stipend: '₹50,000 Prize', deadline: 'Apr 25, 2026', match: 82,
    reason: 'Adobe\'s design hackathon is ideal given your Figma (79%) and UI/UX proficiency (88%).',
    tags: ['UI/UX', 'Figma', 'Adobe XD'], badge: '✨ New', color: 'from-amber-600 to-orange-600',
  },
  {
    id: 5, type: 'Certifications' as Category, icon: '🏆', title: 'Google UX Design Certificate', company: 'Google / Coursera', location: 'Online', stipend: 'Free', deadline: 'Anytime', match: 94,
    reason: 'This is the #1 recommended certification for UI/UX careers. Closes your User Research gap directly.',
    tags: ['UX Research', 'Prototyping', 'Figma'], badge: '⭐ Top Pick', color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 6, type: 'Certifications' as Category, icon: '🏆', title: 'Figma Advanced Certification', company: 'Figma', location: 'Online', stipend: 'Free', deadline: 'Anytime', match: 90,
    reason: 'Completing this certification will push your Figma skill from 79% to 85%+, making you career-ready.',
    tags: ['Auto Layout', 'Variables', 'Prototyping'], badge: '', color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 7, type: 'Workshops' as Category, icon: '🎓', title: 'UX Research Intensive Workshop', company: 'Nielsen Norman Group', location: 'Online', stipend: '₹2,000', deadline: 'May 10, 2026', match: 87,
    reason: 'User Research is your biggest skill gap (54% vs 80% required). This 2-day intensive directly addresses it.',
    tags: ['Interviews', 'Usability Testing', 'Analysis'], badge: '📌 Priority', color: 'from-cyan-600 to-blue-600',
  },
  {
    id: 8, type: 'Workshops' as Category, icon: '🎓', title: 'Design Systems Workshop', company: 'Figma Community', location: 'Online (Free)', stipend: 'Free', deadline: 'Apr 22, 2026', match: 80,
    reason: 'Design Systems knowledge is required for senior UI/UX roles. This aligns with your roadmap step 6.',
    tags: ['Tokens', 'Components', 'Documentation'], badge: '', color: 'from-cyan-600 to-blue-600',
  },
  {
    id: 9, type: 'Jobs' as Category, icon: '🚀', title: 'Junior UI/UX Designer', company: 'Swiggy', location: 'Bangalore (Hybrid)', stipend: '₹8-12 LPA', deadline: 'May 15, 2026', match: 79,
    reason: 'Based on your projected skill growth, you\'ll meet Swiggy\'s requirements in 2-3 months.',
    tags: ['Figma', 'Mobile UX', 'Design Systems'], badge: '📅 Future Ready', color: 'from-pink-600 to-rose-600',
  },
];

const categories: Category[] = ['All', 'Internships', 'Hackathons', 'Certifications', 'Workshops', 'Courses', 'Jobs'];

const categoryIcons: Record<string, string> = {
  All: '🌟', Internships: '💼', Hackathons: '⚡', Certifications: '🏆', Workshops: '🎓', Courses: '📚', Jobs: '🚀',
};

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState<Category>('All');

  const filtered = activeTab === 'All' ? opportunities : opportunities.filter(o => o.type === activeTab);

  return (
    <DashboardLayout title="Opportunities">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Opportunities For You 🚀</h1>
          <p className="text-gray-500 mt-1">AI-curated opportunities based on your skills, career goal, and learning progress.</p>
        </div>

        {/* Career context */}
        <div className="bg-gradient-to-br from-violet-50 via-indigo-50/50 to-purple-50 border border-violet-100 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-1" style={{ fontFamily: 'Outfit' }}>Personalized to Your Profile</h3>
              <p className="text-gray-600 text-sm">All opportunities below are recommended because you&apos;re targeting <strong className="text-violet-700">UI/UX Designer</strong>, have <strong className="text-violet-700">72% career readiness</strong>, and your strongest skills are UI/UX (88%), Python (82%), and Communication (76%).</p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === cat
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:text-gray-900 hover:border-violet-300 shadow-xs'
              }`}>
              <span>{categoryIcons[cat]}</span> {cat}
            </button>
          ))}
        </div>

        {/* Opportunities grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(opp => (
            <div key={opp.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition-all card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-xs">
                    {opp.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-gray-900 font-bold text-sm" style={{ fontFamily: 'Outfit' }}>{opp.title}</h3>
                      {opp.badge && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">{opp.badge}</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{opp.company} · {opp.location}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold bg-gradient-to-r ${opp.color} bg-clip-text text-transparent`} style={{ fontFamily: 'Outfit' }}>{opp.match}%</div>
                  <div className="text-gray-400 text-xs">Match</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {opp.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/60 font-medium">{tag}</span>
                ))}
              </div>

              <div className="bg-violet-50/70 border border-violet-100/80 rounded-xl px-3.5 py-3 mb-3 flex items-start gap-2">
                <span className="text-violet-600 flex-shrink-0 text-sm">✨</span>
                <p className="text-gray-600 text-xs leading-relaxed">{opp.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-600 font-semibold text-sm" style={{ fontFamily: 'Outfit' }}>{opp.stipend}</div>
                  <div className="text-gray-400 text-xs">Deadline: {opp.deadline}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:text-gray-900 hover:border-gray-300 transition-colors">Save</button>
                  <button className={`text-xs text-white bg-gradient-to-r ${opp.color} px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-xs`} style={{ fontFamily: 'Outfit' }}>Apply →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-900 font-semibold text-lg" style={{ fontFamily: 'Outfit' }}>No opportunities in this category yet</p>
            <p className="text-gray-500 text-sm mt-2">Check back as you grow your skills — more opportunities will unlock!</p>
          </div>
        )}

        {/* Career readiness note */}
        <div className="mt-6 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-3" style={{ fontFamily: 'Outfit' }}>Unlock More Opportunities</h3>
          <p className="text-gray-500 text-sm mb-4">At 72% career readiness, you qualify for internships and workshops. Reach 85%+ to unlock top company placements.</p>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200/50">
            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: '72%' }} />
            <div className="absolute top-0 bottom-0 border-r-2 border-gray-400 border-dashed" style={{ left: '85%' }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-violet-700 font-medium">72% (now)</span>
            <span className="text-gray-500">85% (top jobs unlocked)</span>
            <span className="text-gray-400">100%</span>
          </div>
          <Link to="/roadmap" className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg hover:shadow-violet-200 transition-all" style={{ fontFamily: 'Outfit' }}>
            Continue My Roadmap →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
