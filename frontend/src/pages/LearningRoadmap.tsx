import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const weeklyOptions = [
  { hours: 3, months: 7, daily: '30 min' },
  { hours: 5, months: 5, daily: '45 min' },
  { hours: 8, months: 4, daily: '1-1.5 hrs' },
  { hours: 10, months: 3, daily: '1.5-2 hrs' },
];

type RoadmapStatus = 'done' | 'current' | 'upcoming';

const roadmapSteps = [
  { id: 1, skill: 'UI/UX Fundamentals', course: 'UI/UX Fundamentals', hours: 8, status: 'done' as RoadmapStatus, progress: 100, project: null, icon: '🎭' },
  { id: 2, skill: 'Figma Basics', course: 'Figma for Beginners', hours: 10, status: 'done' as RoadmapStatus, progress: 100, project: null, icon: '✏️' },
  { id: 3, skill: 'Advanced Figma', course: 'Advanced Figma', hours: 12, status: 'current' as RoadmapStatus, progress: 72, project: null, icon: '🎨' },
  { id: 4, skill: 'UX Research', course: 'UX Research Fundamentals', hours: 10, status: 'upcoming' as RoadmapStatus, progress: 0, project: null, icon: '🔍' },
  { id: 5, skill: 'Prototyping', course: 'Interactive Prototyping', hours: 8, status: 'upcoming' as RoadmapStatus, progress: 0, project: null, icon: '⚡' },
  { id: 6, skill: 'Design Systems', course: 'Design Systems Masterclass', hours: 15, status: 'upcoming' as RoadmapStatus, progress: 0, project: null, icon: '🏗️' },
  { id: 7, skill: 'Real Project 1', course: 'Portfolio Project: Mobile App Redesign', hours: 20, status: 'upcoming' as RoadmapStatus, progress: 0, project: 'Design a complete food delivery app', icon: '📱' },
  { id: 8, skill: 'Real Project 2', course: 'Portfolio Project: B2B Dashboard', hours: 20, status: 'upcoming' as RoadmapStatus, progress: 0, project: 'Design an analytics dashboard for SaaS product', icon: '📊' },
  { id: 9, skill: 'Portfolio Building', course: 'UX Portfolio Masterclass', hours: 12, status: 'upcoming' as RoadmapStatus, progress: 0, project: 'Build Behance + personal portfolio site', icon: '🌟' },
  { id: 10, skill: 'Internship Preparation', course: 'Interview Prep for UI/UX', hours: 8, status: 'upcoming' as RoadmapStatus, progress: 0, project: 'Mock interviews + resume workshop', icon: '🚀' },
];

const schedule = [
  { day: 'Mon', topic: 'Advanced Figma', hrs: 1.5, icon: '🎨' },
  { day: 'Tue', topic: 'Practice: Auto Layout', hrs: 1, icon: '✏️' },
  { day: 'Wed', topic: 'Advanced Figma Quiz', hrs: 1, icon: '📝' },
  { day: 'Thu', topic: 'Rest day', hrs: 0, icon: '😴' },
  { day: 'Fri', topic: 'UX Research Intro', hrs: 1.5, icon: '🔍' },
  { day: 'Sat', topic: 'Project Work', hrs: 2, icon: '💻' },
  { day: 'Sun', topic: 'Review + Planning', hrs: 1, icon: '📋' },
];

export default function LearningRoadmap() {
  const [selectedHours, setSelectedHours] = useState(8);
  const option = weeklyOptions.find(o => o.hours === selectedHours) || weeklyOptions[2];
  const completedSteps = roadmapSteps.filter(s => s.status === 'done').length;
  const totalHours = roadmapSteps.reduce((a, s) => a + s.hours, 0);

  return (
    <DashboardLayout title="My Roadmap">
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Path to UI/UX Designer 🗺️
          </h1>
          <p className="text-gray-500 mt-1 font-medium">A personalized step-by-step roadmap built around your skill gaps and career goal.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3.5 mb-6">
          {[
            { label: 'Completed', val: `${completedSteps}/${roadmapSteps.length}`, color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-200' },
            { label: 'In Progress', val: '1 Step', color: 'text-violet-700', bg: 'bg-violet-50/80 border-violet-200' },
            { label: 'Total Hours', val: `${totalHours} hrs`, color: 'text-indigo-700', bg: 'bg-indigo-50/80 border-indigo-200' },
            { label: 'Career Fit', val: '91%', color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-200' },
          ].map(s => (
            <div key={s.label} className={`bg-white border ${s.bg} rounded-2xl p-4 shadow-xs`}>
              <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
              <div className="text-gray-500 text-xs font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Time personalization */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-gray-900 font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>⏱️ How much time can you learn every week?</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {weeklyOptions.map(opt => (
              <button key={opt.hours} onClick={() => setSelectedHours(opt.hours)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  selectedHours === opt.hours
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {opt.hours} hrs/week
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
            {[
              { label: 'Estimated Roadmap', val: `${option.months} months`, icon: '📅' },
              { label: 'Weekly Target', val: `${option.hours} hours`, icon: '🎯' },
              { label: 'Daily Recommended', val: option.daily, icon: '📆' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                <div className="text-gray-500 text-xs font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Roadmap */}
          <div className="lg:col-span-2">
            <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Learning Roadmap</h3>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-3.5">
                {roadmapSteps.map((step) => (
                  <div key={step.id} className={`relative pl-16 ${step.status === 'done' ? 'opacity-75' : ''}`}>
                    {/* Icon on timeline */}
                    <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 z-10 shadow-xs ${
                      step.status === 'done' ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : step.status === 'current' ? 'bg-violet-600 border-violet-600 text-white animate-pulse-glow'
                      : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.status === 'done' ? '✓' : step.icon}
                    </div>

                    <div className={`bg-white border rounded-2xl p-4 shadow-xs ${
                      step.status === 'current' ? 'border-violet-500 bg-violet-50/20' : 'border-gray-200/80'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-gray-900 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.skill}</h4>
                          <p className="text-gray-500 text-xs font-medium mt-0.5">{step.course} · {step.hours} hrs</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {step.status === 'done' && <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">Done</span>}
                          {step.status === 'current' && <span className="text-xs text-violet-700 bg-violet-100 border border-violet-200 font-bold px-2.5 py-0.5 rounded-full">In Progress</span>}
                        </div>
                      </div>

                      {step.progress > 0 && step.progress < 100 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-violet-700 font-bold">{step.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: `${step.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {step.project && (
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-900 font-medium mt-2">
                          <span className="font-bold">📋 Project: </span>{step.project}
                        </div>
                      )}

                      {step.status === 'current' && (
                        <Link to="/courses" className="mt-2 inline-flex items-center gap-1 text-xs text-violet-700 hover:text-violet-900 font-bold">
                          Continue Learning →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly schedule */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>This Week&apos;s Schedule</h3>
              <div className="space-y-2">
                {schedule.map(day => (
                  <div key={day.day} className={`flex items-center gap-3 p-2.5 rounded-xl ${day.hrs > 0 ? 'bg-gray-50 border border-gray-100' : 'opacity-40'}`}>
                    <div className="w-10 text-center">
                      <div className="text-gray-500 text-xs font-bold">{day.day}</div>
                    </div>
                    <div className="text-lg">{day.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-xs font-semibold truncate">{day.topic}</p>
                      {day.hrs > 0 && <p className="text-violet-700 text-xs font-medium">{day.hrs} hr{day.hrs !== 1 ? 's' : ''}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200/80 flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total this week</span>
                <span className="text-violet-700 font-bold">8 hrs</span>
              </div>
            </div>

            {/* Milestone */}
            <div className="bg-violet-50/80 border border-violet-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-gray-900 font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Next Milestone</h3>
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Advanced Figma</p>
                <p className="text-violet-700 text-sm font-semibold mt-1">Complete in ~4 more hours</p>
                <div className="mt-3 h-2 bg-gray-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-gray-500 text-xs mt-1.5 font-medium">72% complete</p>
              </div>
              <Link to="/courses" className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Continue Learning →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
