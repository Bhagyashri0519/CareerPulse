import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SkillTier } from '../../types';
import { getRoleTitle } from '../../utils/careerMetrics';

const tierBadges: Record<SkillTier, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner (0-25)', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200' },
  developing: { label: 'Developing (26-50)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  proficient: { label: 'Proficient (51-75)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  advanced: { label: 'Advanced (76-100)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function ProfileView() {
  const { user, profile, updateProfileData, updateSkillsData, refreshProfile } = useApp();

  const [degree, setDegree] = useState(profile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science');
  const [year, setYear] = useState(profile?.year || 3);
  const [cgpa, setCgpa] = useState<string>(profile?.cgpa !== undefined && profile?.cgpa !== null ? String(profile.cgpa) : '8.4');
  const [bio, setBio] = useState(profile?.bio || 'Aspiring engineer with a passion for human-centered digital products.');
  const [targetRoleId, setTargetRoleId] = useState(profile?.targetRoleId || '');
  const [weeklyLearningHours, setWeeklyLearningHours] = useState(profile?.weeklyLearningHours || 10);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Skill add / update form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('design_ux');
  const [newSkillLevel, setNewSkillLevel] = useState(75);
  const [skillSaving, setSkillSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDegree(profile.degree || 'B.Tech');
      setBranch(profile.branch || 'Computer Science');
      setYear(profile.year || 3);
      if (profile.cgpa !== undefined && profile.cgpa !== null) setCgpa(String(profile.cgpa));
      setBio(profile.bio || '');
      setTargetRoleId(profile.targetRoleId || '');
      if (profile.weeklyLearningHours) setWeeklyLearningHours(profile.weeklyLearningHours);
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const parsedCgpa = cgpa ? parseFloat(cgpa) : null;
      await updateProfileData({
        degree,
        branch,
        year: Number(year),
        cgpa: parsedCgpa,
        bio,
        targetRoleId: targetRoleId ? targetRoleId : null,
        weeklyLearningHours: Number(weeklyLearningHours),
      });
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOrUpdateSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setSkillSaving(true);
    try {
      const canonicalId = `skill_${newSkillCategory}_${newSkillName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      await updateSkillsData([
        {
          canonicalId,
          name: newSkillName.trim(),
          category: newSkillCategory,
          level: Number(newSkillLevel),
        },
      ]);
      setNewSkillName('');
      setNewSkillLevel(75);
      setStatusMessage({ type: 'success', text: `Skill "${newSkillName}" saved with self-report evidence!` });
      setTimeout(() => setStatusMessage(null), 4000);
      await refreshProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSkillSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header profile banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30 shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {user?.name || 'Kushi'}
              </h2>
              <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full font-semibold border border-white/20 uppercase tracking-wide">
                {user?.role || 'student'}
              </span>
            </div>
            <p className="text-violet-100 text-sm font-medium">
              {user?.email || 'kushi@careerpulse.ai'} • {branch} ({degree}) • Year {year}
            </p>
            <p className="text-violet-200 text-xs">
              Target Career Role:{' '}
              <span className="font-semibold text-white">
                {targetRoleId ? getRoleTitle(targetRoleId) : 'No Target Career Selected'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{statusMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Academic Details Form + Skills Management */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Details Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Academic & Career Settings
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Manage your degree, branch, weekly commitment, and career preferences.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Degree / Program
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-gray-50/50"
                >
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                  <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                  <option value="BCA">BCA (Computer Applications)</option>
                  <option value="M.Tech">M.Tech / M.E.</option>
                  <option value="MCA">MCA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-gray-50/50"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  CGPA / Grade (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="8.5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Learning Commitment
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={weeklyLearningHours}
                    onChange={(e) => setWeeklyLearningHours(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                  <span className="text-xs text-gray-500 font-medium">hrs/wk</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Career Goal
              </label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-gray-50/50"
              >
                <option value="">-- Select a Target Career --</option>
                <option value="role_fullstack_dev">Full Stack Developer</option>
                <option value="role_fe_developer">Frontend Developer</option>
                <option value="role_be_developer">Backend Developer</option>
                <option value="role_ui_ux_designer">UI/UX Designer</option>
                <option value="role_data_analyst">Data Analyst</option>
                <option value="role_data_scientist">Data Scientist</option>
                <option value="role_ai_ml_engineer">AI / Machine Learning Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Bio / Career Statement
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your interests, aspirations, and what drives your professional learning..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
              <span className="text-xs text-gray-400 block text-right mt-1">{bio.length}/500</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {saving ? 'Saving...' : 'Save Profile Changes ✓'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Add / Update Self-Reported Skill */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Add / Update Skill
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              Self-report a capability level to generate audit evidence and update your proficiency tier.
            </p>

            <form onSubmit={handleAddOrUpdateSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. React, Figma, Python"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Domain Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-violet-500 bg-gray-50/50"
                >
                  <option value="design_ux">Design & UI/UX</option>
                  <option value="frontend">Frontend Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="data_ai">Data & AI/ML</option>
                  <option value="cloud_devops">Cloud & DevOps</option>
                  <option value="soft_skills">Soft & Professional Skills</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Proficiency Level</label>
                  <span className="text-sm font-bold text-violet-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {newSkillLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>Beginner</span>
                  <span>Developing</span>
                  <span>Proficient</span>
                  <span>Advanced</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={skillSaving || !newSkillName.trim()}
                className="w-full bg-violet-50 border border-violet-200 text-violet-700 font-bold py-2.5 rounded-xl hover:bg-violet-100 transition-colors text-sm disabled:opacity-50"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {skillSaving ? 'Recording...' : '+ Record Skill Evidence'}
              </button>
            </form>
          </div>

          {/* Quick summary stats */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h4 className="text-gray-900 font-bold text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Verification Standards
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <span>Self-reported skills start as <strong>unverified</strong> with audit timestamps.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <span>Proficiency scale: 0-25 Beginner, 26-50 Developing, 51-75 Proficient, 76-100 Advanced.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span>Backed by Mongoose subdocuments with atomic update integrity.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Skills Table with Evidence Trail */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Tracked Student Skills & Evidence Audit Trail ({profile?.skills?.length || 0})
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">
              Live proficiency records stored in MongoDB and verified via embedded audit subdocuments.
            </p>
          </div>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span>📄</span>
            <span>Import from Resume →</span>
          </Link>
        </div>

        {(!profile?.skills || profile.skills.length === 0) ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-2">📊</span>
            <p className="text-gray-700 font-semibold text-sm">No skills recorded yet</p>
            <p className="text-gray-500 text-xs mt-1">Use the &quot;Add / Update Skill&quot; box above to record your first capability.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.skills.map((skill) => {
              const tierInfo = tierBadges[skill.tier || 'beginner'];
              return (
                <div
                  key={skill.canonicalId || skill.name}
                  className="border border-gray-200/80 rounded-xl p-4 hover:border-violet-300 transition-all card-hover bg-white shadow-2xs"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-gray-900 font-bold text-sm">{skill.name}</h4>
                      <span className="text-gray-400 text-[11px] font-mono">{skill.canonicalId}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${tierInfo.bg} ${tierInfo.color}`}>
                      {skill.tier || 'beginner'}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Proficiency</span>
                      <span className="text-gray-900 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>
                      Evidence records: <strong className="text-gray-900 font-semibold">{skill.evidence?.length || 1}</strong>
                    </span>
                    <span className="bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded font-medium">
                      {skill.evidence?.[0]?.source || 'self_report'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
