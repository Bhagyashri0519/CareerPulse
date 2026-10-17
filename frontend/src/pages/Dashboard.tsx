import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ResumeDocument, ApiResponse } from '../types';
import { calculateCareerMetrics, isSkillVerified } from '../utils/careerMetrics';

export function getTimeBasedGreeting(date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'Good Morning';
  }
  if (hours >= 12 && hours < 17) {
    return 'Good Afternoon';
  }
  if (hours >= 17 && hours < 21) {
    return 'Good Evening';
  }
  return 'Good Night';
}

export default function Dashboard() {
  const { user, profile, refreshProfile, isLoading: isProfileLoading } = useApp();
  const studentName = user?.name || 'Student';

  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting());
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumesError, setResumesError] = useState<string | null>(null);

  // Update greeting on focus or visibility change when user returns
  useEffect(() => {
    function handleVisibilityOrFocus() {
      if (document.visibilityState === 'visible') {
        setGreeting(getTimeBasedGreeting());
      }
    }

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Fetch student's uploaded resumes from API with error handling
  async function fetchResumes() {
    setLoadingResumes(true);
    setResumesError(null);
    try {
      const res = await api.get<ApiResponse<ResumeDocument[]>>('/resumes');
      if (res && res.data) {
        setResumes(res.data);
        if (res.data.length > 0 && !selectedResumeId) {
          setSelectedResumeId(res.data[0].id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve uploaded resumes from server';
      setResumesError(msg);
    } finally {
      setLoadingResumes(false);
    }
  }

  // Refresh profile & fetch resumes on mount to ensure fresh persisted counts
  useEffect(() => {
    fetchResumes();
    if (typeof refreshProfile === 'function') {
      refreshProfile();
    }
  }, []);

  const metrics = calculateCareerMetrics(profile, resumes, selectedResumeId);

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Dynamic Contextual Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {greeting}, {studentName} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {!metrics.hasTargetRole ? (
                <span>Welcome to CareerPulse! Select your target career in your profile to view personalized readiness and skill benchmarks.</span>
              ) : metrics.dashboardState === 'new_student' ? (
                <span>Welcome to CareerPulse! Upload your resume to begin extracting your skills and building your career twin.</span>
              ) : metrics.dashboardState === 'resume_uploaded' ? (
                <span>Resume parsed! Review your extracted skills and selectively import them into your profile.</span>
              ) : metrics.dashboardState === 'skills_unverified' ? (
                <span>
                  {metrics.importedSkillsCount} {metrics.importedSkillsCount === 1 ? 'skill' : 'skills'} imported into your profile. Take an assessment to verify proficiency.
                </span>
              ) : (
                <span>Let&apos;s continue building your career. You&apos;re making verifiable progress!</span>
              )}
            </p>
          </div>

          <div>
            {!metrics.hasTargetRole ? (
              <Link
                to="/profile"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>🎯</span>
                <span>Select Target Career →</span>
              </Link>
            ) : metrics.dashboardState === 'new_student' ? (
              <Link
                to="/resume"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>📄</span>
                <span>Upload Resume →</span>
              </Link>
            ) : metrics.dashboardState === 'resume_uploaded' ? (
              <Link
                to="/resume"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>⚡</span>
                <span>Review & Import Skills →</span>
              </Link>
            ) : metrics.dashboardState === 'skills_unverified' ? (
              <Link
                to="/assessment"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>🧠</span>
                <span>Verify Skills (Take Quiz) →</span>
              </Link>
            ) : (
              <Link
                to="/roadmap"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>🗺️</span>
                <span>Continue Roadmap →</span>
              </Link>
            )}
          </div>
        </div>

        {/* API Error Notification */}
        {resumesError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold">Error Loading Resumes</p>
                <p className="text-xs text-red-700 mt-0.5">{resumesError}</p>
              </div>
            </div>
            <button
              onClick={fetchResumes}
              className="text-xs font-bold bg-red-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-red-700 transition-colors shadow-2xs whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* Missing Target Career Banner */}
        {!metrics.hasTargetRole && (
          <div className="p-4 rounded-2xl bg-violet-50/90 border border-violet-200 text-violet-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold">No Target Career Selected</p>
                <p className="text-xs text-violet-700 mt-0.5">
                  Choose your career goal in your student profile to view role-specific benchmarks, readiness scores, and skill gap analyses.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="text-xs font-bold bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
            >
              Choose Target Career →
            </Link>
          </div>
        )}

        {/* Evidence Status Notice Banner when unverified */}
        {metrics.hasTargetRole && metrics.dashboardState === 'skills_unverified' && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold">Unverified Skill Claims Detected</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your profile has <strong>{metrics.unverifiedSkillsCount} unverified {metrics.unverifiedSkillsCount === 1 ? 'skill' : 'skills'}</strong> imported from your resume. In accordance with CareerPulse assessment integrity, career readiness and fit remain at &quot;Not evaluated&quot; until verified through assessments.
                </p>
              </div>
            </div>
            <Link
              to="/assessment"
              className="text-xs font-bold bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
            >
              Take Assessment →
            </Link>
          </div>
        )}

        {/* Explicit Skills & Evidence Breakdown Banner */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Evidence Source-of-Truth</p>
              <h2 className="text-base font-bold text-gray-900 mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Skills & Career Evidence Audit
              </h2>
            </div>

            {/* Multiple Resumes Selector */}
            {resumes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Selected Resume:</span>
                <select
                  value={metrics.activeResume?.id || selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:border-violet-500 max-w-[200px] truncate"
                >
                  {resumes.map((r, idx) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {idx === 0 ? '(Latest)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Metric A: Extracted Resume Claims */}
            <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">A. Resume Claims</span>
                <div className="text-2xl font-bold text-violet-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {loadingResumes ? '...' : metrics.extractedClaimsCount}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 truncate" title={metrics.activeResume?.fileName || 'No resume'}>
                {metrics.activeResume ? metrics.activeResume.fileName : 'No resume uploaded'}
              </p>
            </div>

            {/* Metric B: Imported Profile Skills */}
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">B. Profile Skills</span>
                <div className="text-2xl font-bold text-indigo-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isProfileLoading ? '...' : metrics.importedSkillsCount}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Tracked in student profile
              </p>
            </div>

            {/* Metric C: Unverified Claims */}
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">C. Unverified Claims</span>
                <div className="text-2xl font-bold text-amber-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isProfileLoading ? '...' : metrics.unverifiedSkillsCount}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Pending assessment quiz
              </p>
            </div>

            {/* Metric D: Verified Skills */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">D. Verified Skills</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isProfileLoading ? '...' : metrics.verifiedSkillsCount}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Assessment confirmed
              </p>
            </div>

            {/* Metric E: Career-Required Skills */}
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">E. Career Required</span>
                <div className="text-2xl font-bold text-blue-900 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {metrics.hasTargetRole ? metrics.careerRequiredSkillsCount : '—'}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 truncate" title={metrics.targetRoleTitle}>
                {metrics.hasTargetRole ? metrics.targetRoleTitle : 'Select in Profile'}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Evidence-Based Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Career Readiness */}
          <div className="relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">🎓</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  metrics.hasAssessedSkills ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {metrics.readinessTrend}
              </span>
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {metrics.readinessDisplay}
            </div>
            <div className="text-gray-500 text-xs font-medium mt-1">Career Readiness</div>
          </div>

          {/* Card 2: Career Fit */}
          <div className="relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">🎯</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 truncate max-w-[90px]">
                {metrics.hasTargetRole ? metrics.targetRoleTitle : 'No Role'}
              </span>
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {metrics.careerFitDisplay}
            </div>
            <div className="text-gray-500 text-xs font-medium mt-1">Career Fit</div>
          </div>

          {/* Card 3: Learning Progress */}
          <div className="relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">📚</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                {metrics.hasAssessedSkills ? `${metrics.verifiedSkillsCount} verified` : 'No data'}
              </span>
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {metrics.hasAssessedSkills ? `${metrics.learningProgressPercentage}%` : '0%'}
            </div>
            <div className="text-gray-500 text-xs font-medium mt-1">Learning Progress</div>
          </div>

          {/* Card 4: Learning Gap */}
          <div className="relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">⚠️</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">
                {metrics.hasAssessedSkills ? `${metrics.gapsCount} gaps` : (metrics.hasTargetRole ? 'Pending assessment' : 'No role')}
              </span>
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {metrics.hasAssessedSkills
                ? `${metrics.gapsCount} Skills`
                : metrics.hasTargetRole
                ? 'Not evaluated'
                : 'No Target Role'}
            </div>
            <div className="text-gray-500 text-xs font-medium mt-1">Skill Gaps</div>
          </div>

          {/* Card 5: Weekly Learning Target */}
          <div className="relative bg-white border border-gray-200/80 rounded-2xl p-4 overflow-hidden card-hover shadow-xs">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">⏱️</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700">
                Target pace
              </span>
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {profile?.weeklyLearningHours || 10} hrs
            </div>
            <div className="text-gray-500 text-xs font-medium mt-1">Weekly Learning</div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Target Career Card + Roadmap / Onboarding Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* Career Benchmark Card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Target Career Benchmark</p>
                  <h2 className="text-gray-900 font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {metrics.targetRoleTitle}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-violet-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {metrics.careerFitDisplay}
                  </div>
                  <div className="text-gray-500 text-xs font-medium">Career Fit</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.careerFitPercentage}%` }}
                />
              </div>

              {/* 3 Metric boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-lg text-emerald-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {metrics.skillsReadyRatio}
                  </div>
                  <div className="text-gray-500 text-xs font-medium">
                    Skills Ready {metrics.hasTargetRole ? `(of ${metrics.careerRequiredSkillsCount})` : ''}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-lg text-amber-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {metrics.hasAssessedSkills
                      ? metrics.gapsCount
                      : metrics.hasTargetRole
                      ? 'Not evaluated'
                      : '—'}
                  </div>
                  <div className="text-gray-500 text-xs font-medium">Gaps to Close</div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div className="font-bold text-lg text-violet-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {metrics.estimatedTimeline}
                  </div>
                  <div className="text-gray-500 text-xs font-medium">Estimated Time</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-3">
                {!metrics.hasTargetRole ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex-1 text-center text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2.5 rounded-xl hover:bg-violet-100 transition-colors"
                    >
                      Select Target Career in Profile →
                    </Link>
                    <Link
                      to="/resume"
                      className="flex-1 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      Upload Resume →
                    </Link>
                  </>
                ) : metrics.dashboardState === 'new_student' || metrics.dashboardState === 'resume_uploaded' ? (
                  <>
                    <Link
                      to="/resume"
                      className="flex-1 text-center text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2.5 rounded-xl hover:bg-violet-100 transition-colors"
                    >
                      {metrics.dashboardState === 'resume_uploaded' ? 'Review Extracted Resume →' : 'Upload Resume for Analysis →'}
                    </Link>
                    <Link
                      to="/profile"
                      className="flex-1 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      Update Target Career →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/career-fit"
                      className="flex-1 text-center text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2.5 rounded-xl hover:bg-violet-100 transition-colors"
                    >
                      View Career Fit →
                    </Link>
                    <Link
                      to="/learning-gap"
                      className="flex-1 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      Learning Gaps →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Evidence-Based Learning Roadmap / Onboarding Progress */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {metrics.hasAssessedSkills && metrics.hasTargetRole ? 'My Learning Roadmap' : 'Career Progression Milestones'}
                </h3>
                <Link to="/roadmap" className="text-violet-600 text-xs font-semibold hover:text-violet-700">
                  View full →
                </Link>
              </div>

              {metrics.hasAssessedSkills && metrics.hasTargetRole ? (
                <div className="space-y-2.5">
                  {[
                    { label: 'Core Skill Verification', status: 'done' },
                    { label: `${metrics.targetRoleTitle} Specialization Module`, status: 'current' },
                    { label: 'Portfolio Evaluation Project', status: 'upcoming' },
                    { label: 'Internship Placement Readiness', status: 'upcoming' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                          item.status === 'done'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                            : item.status === 'current'
                            ? 'bg-violet-50 text-violet-600 border border-violet-200 font-bold'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {item.status === 'done' ? '✓' : item.status === 'current' ? '→' : `${i + 1}`}
                      </div>
                      <span
                        className={`text-sm ${
                          item.status === 'done'
                            ? 'text-gray-400 line-through'
                            : item.status === 'current'
                            ? 'text-gray-900 font-semibold'
                            : 'text-gray-600'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.status === 'current' && (
                        <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-200 font-semibold">
                          Active Goal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Upload Resume & Extract Skills',
                      done: metrics.resumesCount > 0,
                      link: '/resume',
                      action: 'Upload PDF/DOCX',
                    },
                    {
                      label: 'Selectively Import Skills to Profile',
                      done: metrics.importedSkillsCount > 0,
                      link: '/resume',
                      action: 'Import Skills',
                    },
                    {
                      label: 'Select Target Career Goal',
                      done: metrics.hasTargetRole,
                      link: '/profile',
                      action: 'Choose Role',
                    },
                    {
                      label: 'Take Assessment to Verify Skills',
                      done: metrics.hasAssessedSkills,
                      link: '/assessment',
                      action: 'Take Assessment',
                    },
                    {
                      label: 'Activate AI Career Twin & Roadmap',
                      done: metrics.hasAssessedSkills && metrics.hasTargetRole,
                      link: '/roadmap',
                      action: 'Explore Roadmap',
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        step.done
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{step.done ? '✅' : '⏳'}</span>
                        <span className="text-xs font-semibold">{step.label}</span>
                      </div>
                      {!step.done && (
                        <Link
                          to={step.link}
                          className="text-xs bg-white border border-gray-300 hover:border-violet-400 text-violet-700 font-bold px-2.5 py-1 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                        >
                          {step.action} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tracked Skills + Real Activity */}
          <div className="space-y-6">
            {/* Tracked Skills Card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Tracked Skills ({metrics.importedSkillsCount})
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {metrics.verifiedSkillsCount} Verified
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                      {metrics.unverifiedSkillsCount} Unverified
                    </span>
                  </div>
                </div>
                <Link to="/skills" className="text-violet-600 text-xs font-semibold hover:text-violet-700">
                  View all →
                </Link>
              </div>

              {metrics.importedSkillsCount === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                  <span className="text-3xl block mb-2">📊</span>
                  <p className="text-sm font-semibold text-gray-700">No skills added yet</p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Upload your resume to extract canonical skills and add audit evidence to your profile.
                  </p>
                  <Link
                    to="/resume"
                    className="inline-block text-xs bg-violet-600 text-white font-bold px-3.5 py-1.5 rounded-lg hover:bg-violet-700 transition-colors shadow-2xs"
                  >
                    Upload Resume →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Verified Skills Section */}
                  {metrics.verifiedSkills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <span>🟢</span>
                        <span>Verified Skills ({metrics.verifiedSkills.length})</span>
                      </p>
                      {metrics.verifiedSkills.slice(0, 4).map((skill) => (
                        <div key={skill.canonicalId || skill.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-800">{skill.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Verified ({skill.level}%)
                              </span>
                              <span className="text-gray-900 font-bold">{skill.level}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              style={{ width: `${Math.max(5, skill.level)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unverified Claims Section */}
                  {metrics.unverifiedSkills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <span>🟡</span>
                        <span>Unverified Profile Claims ({metrics.unverifiedSkills.length})</span>
                      </p>
                      {metrics.unverifiedSkills.slice(0, 4).map((skill) => (
                        <div key={skill.canonicalId || skill.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-800">{skill.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Unverified (0%)
                              </span>
                              <span className="text-gray-400 font-medium">0%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gray-300" style={{ width: '5%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/profile"
                    className="mt-3 block text-center text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 py-2 rounded-xl hover:bg-violet-100 transition-colors"
                  >
                    Manage Profile Skills & Evidence →
                  </Link>
                </div>
              )}
            </div>

            {/* Evidence Activity Feed */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-gray-900 font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Recent Student Activity
              </h3>
              <div className="space-y-3.5">
                {metrics.activeResume ? (
                  <div className="flex gap-3">
                    <span className="text-base mt-0.5">📄</span>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-xs font-semibold leading-tight">
                        Resume parsed: {metrics.activeResume.fileName}
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {metrics.extractedClaimsCount} canonical skills extracted
                      </p>
                    </div>
                  </div>
                ) : null}

                {metrics.importedSkillsCount > 0 ? (
                  <div className="flex gap-3">
                    <span className="text-base mt-0.5">⚡</span>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-xs font-semibold leading-tight">
                        {metrics.importedSkillsCount} skills tracked ({metrics.verifiedSkillsCount} verified, {metrics.unverifiedSkillsCount} unverified)
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Audit source: <span className="font-mono">resume_extracted / assessment</span>
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <span className="text-base mt-0.5">👤</span>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-xs font-semibold leading-tight">
                      Profile initialized for {studentName}
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      {profile?.degree || 'B.Tech'} {profile?.branch || 'CSE'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { icon: '📄', label: 'Resume Analysis', href: '/resume' },
            { icon: '🧠', label: 'Take Assessment', href: '/assessment' },
            { icon: '👤', label: 'Manage Profile', href: '/profile' },
            { icon: '📊', label: 'Skill Profiles', href: '/skills' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-200/80 text-center hover:border-violet-200 hover:bg-violet-50/30 transition-all card-hover shadow-xs"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
