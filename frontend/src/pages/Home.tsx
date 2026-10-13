import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

const steps = [
  { num: '01', title: 'Career Assessment', desc: 'Answer 25 questions to map your interests, skills & goals', icon: '🧠' },
  { num: '02', title: 'Skill Profiling', desc: 'Get a detailed radar chart of your current skill levels', icon: '📊' },
  { num: '03', title: 'Learning Gap Detection', desc: 'See exactly what skills you need for your dream career', icon: '⚠️' },
  { num: '04', title: 'Career Recommendation', desc: 'Discover careers that match your unique profile', icon: '🎯' },
  { num: '05', title: 'Personalized Learning Path', desc: 'Get a step-by-step roadmap built just for you', icon: '🗺️' },
  { num: '06', title: 'Progress & Career Analytics', desc: 'Track skill growth and career readiness over time', icon: '📈' },
];

const features = [
  { icon: '🤖', title: 'AI-Powered Matching', desc: 'Our AI analyzes 50+ data points to match you with careers where you\'ll truly excel.' },
  { icon: '📍', title: 'Gap-First Approach', desc: "We don't just recommend careers — we tell you exactly what's missing and how to fill it." },
  { icon: '⚡', title: 'Adaptive Learning Path', desc: 'Your roadmap updates as you grow. Learn only what matters for your specific career goal.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Watch your skill growth and career readiness improve week by week with visual dashboards.' },
];

function DashboardPreview() {
  return (
    <div className="relative bg-[#0D1117] rounded-2xl border border-[#2A3050] p-5 shadow-2xl shadow-violet-900/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-cyan-900/5" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#7D8FA9] text-xs">Good Morning</p>
            <p className="text-white font-bold text-sm" style={{ fontFamily: 'Outfit' }}>Kushi 👋</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs">AI Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Career Readiness', val: '72%', color: 'from-violet-500 to-indigo-500' },
            { label: 'Career Fit', val: '87%', color: 'from-cyan-500 to-blue-500' },
            { label: 'Learning Gap', val: '28%', color: 'from-amber-500 to-orange-500' },
          ].map(c => (
            <div key={c.label} className="bg-[#161B2E] rounded-xl p-2.5 border border-[#2A3050]">
              <div className={`text-lg font-bold bg-gradient-to-r ${c.color} bg-clip-text text-transparent`} style={{ fontFamily: 'Outfit' }}>{c.val}</div>
              <div className="text-[#7D8FA9] text-[10px] leading-tight mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#161B2E] rounded-xl border border-[#2A3050] p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Outfit' }}>Target: UI/UX Designer</span>
            <span className="text-violet-400 text-xs font-bold">87% Match</span>
          </div>
          <div className="space-y-1.5">
            {[
              { skill: 'UI/UX Design', val: 88, color: 'from-violet-500 to-violet-400' },
              { skill: 'Figma', val: 79, color: 'from-indigo-500 to-indigo-400' },
              { skill: 'HTML/CSS', val: 68, color: 'from-cyan-500 to-cyan-400' },
            ].map(s => (
              <div key={s.skill}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#7D8FA9] text-[10px]">{s.skill}</span>
                  <span className="text-white text-[10px] font-semibold">{s.val}%</span>
                </div>
                <div className="h-1 bg-[#2A3050] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-600/30 rounded-xl px-3 py-2">
          <span className="text-violet-300 text-xs font-medium">Recommended: Advanced Figma</span>
          <span className="text-violet-400 text-xs">→</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-violet-700 text-sm font-semibold">AI-Powered Career Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your Skills.{' '}
                <span className="gradient-text">Your Career.</span>{' '}
                Your Personalized Path.
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                CareerPulse understands what you know, discovers what you&apos;re missing, and creates a personalized path to your dream career.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all"
                  style={{ fontFamily: 'Outfit' }}
                >
                  Start Career Assessment <span>→</span>
                </Link>
                <Link
                  to="/career-fit"
                  className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all"
                  style={{ fontFamily: 'Outfit' }}
                >
                  Explore Careers
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8">
                {[
                  { val: '10K+', label: 'Students' },
                  { val: '95%', label: 'Career Match Accuracy' },
                  { val: '50+', label: 'Career Paths' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>{s.val}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-8">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Journey steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-wider mb-3">The CareerPulse Journey</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Your journey with CareerPulse</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">A connected, intelligent process — from understanding who you are to building the career you want.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 opacity-30" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {steps.map((s, i) => (
                <div key={i} className="relative flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all card-hover group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div className="text-violet-600 font-bold text-xs mb-1" style={{ fontFamily: 'Outfit' }}>{s.num}</div>
                  <h3 className="text-gray-900 font-semibold text-sm mb-1.5" style={{ fontFamily: 'Outfit' }}>{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>Why CareerPulse is different</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">CareerPulse doesn&apos;t just recommend a career. CareerPulse builds a path to reach it.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all card-hover">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2" style={{ fontFamily: 'Outfit' }}>{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDM2djM2SDM2VjE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Ready to discover your career path?
          </h2>
          <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students who found their direction with CareerPulse&apos;s AI-powered career intelligence.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-10 py-4 rounded-xl hover:bg-violet-50 hover:shadow-2xl hover:-translate-y-1 transition-all text-lg"
            style={{ fontFamily: 'Outfit' }}
          >
            Start Free Assessment <span>→</span>
          </Link>
          <p className="text-[#DDD6FE] text-sm mt-4">No signup required to explore · 100% free</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold" style={{ fontFamily: 'Outfit' }}>CP</span>
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Outfit' }}>CareerPulse</span>
          </div>
          <p className="text-gray-500 text-sm">AI-Powered Personalized Career & Learning Platform for College Students</p>
          <p className="text-gray-600 text-xs mt-4">Built for Smart India Hackathon 2026 · © 2026 CareerPulse</p>
        </div>
      </footer>
    </div>
  );
}
