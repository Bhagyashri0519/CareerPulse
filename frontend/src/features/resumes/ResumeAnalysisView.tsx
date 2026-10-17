import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ResumeDocument, ClaimedSkill, ApiResponse, ApplySkillsResult } from '../../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  design_ux: 'Design & UX',
  data_ai: 'Data & AI',
  cloud_devops: 'Cloud & DevOps',
  soft_skills: 'Soft Skills',
};

export default function ResumeAnalysisView() {
  const { profile, refreshProfile } = useApp();

  // Resume lists and selected active resume
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeDocument | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Skill selection & import state
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ message: string; count: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Context snippets expansion state
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});

  function toggleSnippet(canonicalId: string) {
    setExpandedSnippets((prev) => ({
      ...prev,
      [canonicalId]: !prev[canonicalId],
    }));
  }

  // Active section tab in parsed results
  const [activeSectionTab, setActiveSectionTab] = useState<'skills' | 'experience' | 'education' | 'projects' | 'certifications'>('skills');

  // Load existing resumes on mount
  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    setLoadingList(true);
    setActionError(null);
    try {
      const res = await api.get<ApiResponse<ResumeDocument[]>>('/resumes');
      if (res && res.data) {
        setResumes(res.data);
        if (res.data.length > 0 && !activeResume) {
          // Select the latest resume by default
          loadResumeDetails(res.data[0].id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch uploaded resumes';
      setActionError(msg);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadResumeDetails(resumeId: string) {
    setLoadingDetail(true);
    setActionError(null);
    setImportResult(null);
    setSelectedSkillIds([]);
    setExpandedSnippets({});
    try {
      const res = await api.get<ApiResponse<ResumeDocument>>(`/resumes/${resumeId}`);
      if (res && res.data) {
        setActiveResume(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load resume details';
      setActionError(msg);
    } finally {
      setLoadingDetail(false);
    }
  }

  // Handle file selection and local validation
  function handleFileValidation(file: File): boolean {
    setUploadError(null);
    setUploadSuccess(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError('Invalid file type. Only PDF (.pdf) and Word documents (.docx) are supported.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of 10 MB.`);
      return false;
    }

    if (file.size === 0) {
      setUploadError('The selected file is empty (0 bytes). Please select a valid resume document.');
      return false;
    }

    setSelectedFile(file);
    return true;
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  }

  // Upload file to backend
  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.upload<ApiResponse<ResumeDocument>>('/resumes/upload', formData);

      if (res && res.data) {
        setUploadSuccess(`"${selectedFile.name}" parsed successfully! Extracted ${res.data.claimedSkills?.length || 0} canonical skill claims.`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Prepend new resume to list and activate it
        setResumes((prev) => [res.data, ...prev.filter((r) => r.id !== res.data.id)]);
        setActiveResume(res.data);
        setSelectedSkillIds([]);
        setExpandedSnippets({});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resume upload failed';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Delete resume
  async function handleDeleteResume(resumeId: string) {
    if (!window.confirm('Are you sure you want to delete this resume? Previously imported profile skills will be retained.')) {
      return;
    }

    try {
      await api.del(`/resumes/${resumeId}`);
      const updatedList = resumes.filter((r) => r.id !== resumeId);
      setResumes(updatedList);

      if (activeResume?.id === resumeId) {
        if (updatedList.length > 0) {
          loadResumeDetails(updatedList[0].id);
        } else {
          setActiveResume(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete resume';
      setActionError(msg);
    }
  }

  // Skill selection helpers
  function isSkillImported(claim: ClaimedSkill): boolean {
    if (claim.isImported) return true;
    if (profile?.skills?.some((s) => s.canonicalId === claim.canonicalId)) return true;
    return false;
  }

  const eligibleSkills = (activeResume?.claimedSkills || []).filter((claim) => !isSkillImported(claim));

  function toggleSkillSelection(canonicalId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(canonicalId) ? prev.filter((id) => id !== canonicalId) : [...prev, canonicalId],
    );
  }

  function selectAllEligible() {
    setSelectedSkillIds(eligibleSkills.map((s) => s.canonicalId));
  }

  function deselectAll() {
    setSelectedSkillIds([]);
  }

  // Perform selective skill import
  async function handleConfirmImport() {
    if (!activeResume || selectedSkillIds.length === 0) return;

    setImporting(true);
    setActionError(null);
    setImportResult(null);

    try {
      const res = await api.post<ApiResponse<ApplySkillsResult>>(`/resumes/${activeResume.id}/apply-skills`, {
        skillIds: selectedSkillIds,
      });

      if (res && res.data) {
        setImportResult({
          message: `Successfully imported ${res.data.importedCount} skill${res.data.importedCount > 1 ? 's' : ''} to your Student Profile with unverified evidence!`,
          count: res.data.importedCount,
        });

        // Update active resume claims locally so badges update immediately
        if (activeResume) {
          const updatedClaims = activeResume.claimedSkills.map((claim) => {
            if (selectedSkillIds.includes(claim.canonicalId)) {
              return { ...claim, isImported: true };
            }
            return claim;
          });
          setActiveResume({ ...activeResume, claimedSkills: updatedClaims });
        }

        // Refresh global profile so profile and skills views stay in sync
        await refreshProfile();
        setSelectedSkillIds([]);
        setConfirmModalOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import skills';
      setActionError(msg);
      setConfirmModalOpen(false);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-violet-200 text-xs font-semibold uppercase tracking-wider">
              <span>Deterministic NLP Parser</span>
              <span>•</span>
              <span>Canonical Skill Normalization</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Resume Analysis & Skill Ingestion
            </h1>
            <p className="text-violet-100 text-sm leading-relaxed">
              Upload your PDF or DOCX resume to extract education, experience, and projects. Review detected canonical skill claims and selectively import them into your profile with verifiable audit evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/20 text-sm backdrop-blur transition-all flex items-center gap-2"
            >
              <span>👤</span>
              <span>View Profile</span>
            </Link>
            <Link
              to="/skills"
              className="bg-white text-violet-900 hover:bg-violet-50 font-bold px-4 py-2.5 rounded-xl shadow-md text-sm transition-all flex items-center gap-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span>📊</span>
              <span>My Skills</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Action Error / Success Notification */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {importResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-bold">{importResult.message}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Skills are linked as <span className="font-mono bg-emerald-100 px-1 rounded">resume_extracted</span> unverified evidence.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            Check Profile →
          </Link>
        </div>
      )}

      {/* Main Grid: Upload & History (Left 1 Col) + Parsed Analysis & Selective Import (Right 2 Cols) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Box + Resume History */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Upload Resume
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              Supported formats: <strong>PDF</strong> or <strong>DOCX</strong> (Max 10 MB).
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-violet-500 bg-violet-50/70 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-2xl shadow-2xs">
                  {selectedFile ? '📄' : '📤'}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">{formatBytes(selectedFile.size)}</p>
                    <span className="inline-block mt-2 text-[11px] text-gray-500 underline">Click or drop to replace</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Drag & drop resume here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse your files</p>
                  </div>
                )}
              </div>

              {/* Upload error display */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span className="flex-1">{uploadError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      setSelectedFile(null);
                    }}
                    className="font-bold underline text-red-600"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Upload success message */}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <span>✓</span>
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Parsing & Normalizing Skills...</span>
                  </>
                ) : (
                  <span>Extract Resume Skills →</span>
                )}
              </button>
            </form>
          </div>

          {/* Upload History List */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Uploaded Resumes ({resumes.length})
              </h3>
              <button
                onClick={fetchResumes}
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
                title="Refresh list"
              >
                <span>↻</span>
                <span>Refresh</span>
              </button>
            </div>

            {loadingList ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading documents...</div>
            ) : resumes.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No resumes uploaded yet. Upload your first PDF or DOCX above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {resumes.map((r) => {
                  const isActive = activeResume?.id === r.id;
                  const uniqueClaimIds = new Set((r.claimedSkills || []).map((c) => c.canonicalId).filter(Boolean));
                  const totalSkills = uniqueClaimIds.size;
                  const importedCount = (r.claimedSkills || []).filter((c) => isSkillImported(c)).length;

                  return (
                    <div
                      key={r.id}
                      onClick={() => loadResumeDetails(r.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isActive
                          ? 'border-violet-500 bg-violet-50/60 shadow-2xs'
                          : 'border-gray-200/80 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">📄</span>
                          <p className="text-xs font-bold text-gray-900 truncate" title={r.fileName}>
                            {r.fileName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                          <span>{formatBytes(r.fileSize)}</span>
                          <span>•</span>
                          <span>
                            {new Date(r.uploadedAt || (r as any).createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
                            {totalSkills} Skills
                          </span>
                          {importedCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {importedCount} Imported
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResume(r.id);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 text-xs transition-colors"
                        title="Delete resume"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Analysis Results & Selective Import Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {loadingDetail ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs">
              <svg className="animate-spin h-8 w-8 text-violet-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-gray-700 font-semibold text-sm">Loading resume claims & parsed sections...</p>
            </div>
          ) : !activeResume ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs">
              <span className="text-5xl block mb-3">📄</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                No Resume Selected
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Upload a new resume using the panel on the left or select an existing document from your upload history.
              </p>
            </div>
          ) : (
            <>
              {/* Document Summary Card */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📑</span>
                      <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {activeResume.fileName}
                      </h2>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase">
                        {activeResume.parseStatus}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      File Size: {formatBytes(activeResume.fileSize)} • Uploaded:{' '}
                      {new Date(activeResume.uploadedAt || (activeResume as any).createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right flex items-center sm:flex-col sm:items-end justify-between gap-1">
                    <span className="text-xs text-gray-400">Extracted Canonical Claims</span>
                    <span className="text-xl font-bold text-violet-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {new Set((activeResume.claimedSkills || []).map((s) => s.canonicalId).filter(Boolean)).size}
                    </span>
                  </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {(
                    [
                      {
                        key: 'skills',
                        label: 'Skills',
                        icon: '⚡',
                        count: new Set((activeResume.claimedSkills || []).map((s) => s.canonicalId).filter(Boolean)).size,
                      },
                      {
                        key: 'experience',
                        label: 'Experience & Internships',
                        icon: '💼',
                        count:
                          activeResume.extractedSections?.structuredExperience?.length ??
                          activeResume.extractedSections?.experience?.length,
                      },
                      { key: 'projects', label: 'Projects', icon: '🚀', count: activeResume.extractedSections?.projects?.length },
                      {
                        key: 'education',
                        label: 'Education',
                        icon: '🎓',
                        count:
                          activeResume.extractedSections?.structuredEducation?.length ??
                          activeResume.extractedSections?.education?.length,
                      },
                      { key: 'certifications', label: 'Certifications', icon: '📜', count: activeResume.extractedSections?.certifications?.length },
                    ] as const
                  ).map((tab) => {
                    const active = activeSectionTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveSectionTab(tab.key)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-violet-600 text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content 1: Skills & Selective Import */}
              {activeSectionTab === 'skills' && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  {/* Compact Selection Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Extracted Skills
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select skills to import into your profile with unverified evidence.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {eligibleSkills.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={selectAllEligible}
                            className="text-xs text-gray-700 hover:text-gray-900 font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            Select all ({eligibleSkills.length})
                          </button>
                          <button
                            type="button"
                            onClick={deselectAll}
                            disabled={selectedSkillIds.length === 0}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Deselect all
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setConfirmModalOpen(true)}
                        disabled={selectedSkillIds.length === 0 || importing}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>
                          {selectedSkillIds.length > 0
                            ? `Import selected skills (${selectedSkillIds.length})`
                            : 'Select skills to import'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  {(!activeResume.claimedSkills || activeResume.claimedSkills.length === 0) ? (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-3xl block mb-2">🔍</span>
                      <p className="text-sm font-semibold">No skills matched in this document</p>
                      <p className="text-xs text-gray-400 mt-1">Make sure your resume lists technical capabilities clearly.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {activeResume.claimedSkills.map((claim) => {
                        const imported = isSkillImported(claim);
                        const isSelected = selectedSkillIds.includes(claim.canonicalId);
                        const isExpanded = !!expandedSnippets[claim.canonicalId];
                        const categoryLabel = categoryLabels[claim.category] || claim.category.replace('_', ' ');

                        return (
                          <div
                            key={claim.canonicalId}
                            onClick={() => {
                              if (!imported) toggleSkillSelection(claim.canonicalId);
                            }}
                            onKeyDown={(e) => {
                              if (!imported && (e.key === ' ' || e.key === 'Enter')) {
                                e.preventDefault();
                                toggleSkillSelection(claim.canonicalId);
                              }
                            }}
                            tabIndex={imported ? -1 : 0}
                            role="checkbox"
                            aria-checked={imported || isSelected}
                            aria-disabled={imported}
                            title={claim.canonicalId}
                            className={`rounded-xl border p-3.5 transition-all text-left outline-none ${
                              imported
                                ? 'bg-gray-50/70 border-gray-200 cursor-default opacity-80'
                                : isSelected
                                ? 'bg-violet-50/40 border-violet-500 shadow-xs cursor-pointer ring-1 ring-violet-400'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={imported || isSelected}
                                  disabled={imported}
                                  onChange={() => toggleSkillSelection(claim.canonicalId)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-sm font-semibold text-gray-900 block truncate">
                                    {claim.name}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    {categoryLabel}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {imported ? (
                                  <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                                    Imported
                                  </span>
                                ) : isSelected ? (
                                  <span className="text-xs font-medium text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-md">
                                    Selected
                                  </span>
                                ) : null}

                                {claim.contextSnippet && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSnippet(claim.canonicalId);
                                    }}
                                    className="text-xs text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                                    aria-label={isExpanded ? `Hide context for ${claim.name}` : `View context for ${claim.name}`}
                                    title={isExpanded ? 'Hide context' : 'View context snippet'}
                                  >
                                    <svg
                                      className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expandable Context Snippet */}
                            {isExpanded && claim.contextSnippet && (
                              <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                                <p className="bg-gray-50 p-2 rounded-lg font-mono text-[11px] text-gray-700 border border-gray-200/60 leading-relaxed">
                                  "{claim.contextSnippet}"
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  Matched from resume text
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Experience */}
              {activeSectionTab === 'experience' && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Work Experience & Internships
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Identified employment and industrial internships. Academic and capstone projects are cataloged under the Projects tab.
                      </p>
                    </div>
                  </div>

                  {activeResume.extractedSections?.structuredExperience && activeResume.extractedSections.structuredExperience.length > 0 ? (
                    <div className="space-y-3">
                      {activeResume.extractedSections.structuredExperience.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">{exp.role || 'Role / Position'}</h4>
                                {exp.employmentType && exp.employmentType !== 'unknown' && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded capitalize bg-gray-100 text-gray-700 border border-gray-200">
                                    {exp.employmentType}
                                  </span>
                                )}
                              </div>
                              {exp.organization && (
                                <p className="text-xs font-semibold text-gray-700 mt-0.5">🏢 {exp.organization}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {(exp.startDate || exp.endDate) && (
                                <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md font-mono">
                                  {exp.startDate || ''} {exp.startDate && exp.endDate ? '–' : ''} {exp.endDate || ''}
                                  {exp.isCurrent && ' (Current)'}
                                </span>
                              )}
                            </div>
                          </div>

                          {exp.description && (
                            <p className="text-xs text-gray-600 leading-relaxed pt-1 border-t border-gray-100">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : activeResume.extractedSections?.experience && activeResume.extractedSections.experience.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Extracted experience lines:</p>
                      <ul className="space-y-2">
                        {activeResume.extractedSections.experience.map((exp, idx) => (
                          <li key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-xs text-gray-700 font-mono leading-relaxed">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-3xl block mb-2">💼</span>
                      <p className="text-sm font-semibold text-gray-700">No work experience or internships detected</p>
                      <p className="text-xs text-gray-400 mt-1">Academic, capstone, and personal projects are listed under the Projects tab.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 3: Projects */}
              {activeSectionTab === 'projects' && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Extracted Projects
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Academic, capstone, and personal software projects. Distinct from contractual employment.
                    </p>
                  </div>

                  {(!activeResume.extractedSections?.projects || activeResume.extractedSections.projects.length === 0) ? (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-3xl block mb-2">🚀</span>
                      <p className="text-sm font-semibold text-gray-700">No project section lines detected</p>
                      <p className="text-xs text-gray-400 mt-1">Highlight your academic and personal projects in your resume.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {activeResume.extractedSections.projects.map((proj, idx) => (
                        <li key={idx} className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl text-xs text-gray-800 leading-relaxed">
                          <span className="font-semibold text-violet-700 mr-2">🚀 Project:</span>
                          {proj}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Tab Content 4: Education */}
              {activeSectionTab === 'education' && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Extracted Education
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Degrees, institutions, specializations, and academic performance.
                    </p>
                  </div>

                  {activeResume.extractedSections?.structuredEducation && activeResume.extractedSections.structuredEducation.length > 0 ? (
                    <div className="space-y-3">
                      {activeResume.extractedSections.structuredEducation.map((edu, idx) => (
                        <div key={idx} className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">{edu.degree || 'Degree / Qualification'}</h4>
                                {edu.currentStatus && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded capitalize bg-gray-100 text-gray-700 border border-gray-200">
                                    {edu.currentStatus}
                                  </span>
                                )}
                              </div>
                              {edu.institution && (
                                <p className="text-xs font-semibold text-gray-700 mt-0.5">🎓 {edu.institution}</p>
                              )}
                              {edu.fieldOfStudy && (
                                <p className="text-[11px] text-gray-500">Major: {edu.fieldOfStudy}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {edu.grade && (
                                <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                                  {edu.grade}
                                </span>
                              )}
                              {(edu.startYear || edu.endYear) && (
                                <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md font-mono">
                                  {edu.startYear || ''} {edu.startYear && edu.endYear ? '–' : ''} {edu.endYear || ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeResume.extractedSections?.education && activeResume.extractedSections.education.length > 0 ? (
                    <ul className="space-y-2">
                      {activeResume.extractedSections.education.map((edu, idx) => (
                        <li key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-xs text-gray-700 font-mono leading-relaxed">
                          {edu}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-3xl block mb-2">🎓</span>
                      <p className="text-sm font-semibold text-gray-700">No education section detected</p>
                      <p className="text-xs text-gray-400 mt-1">Make sure your resume specifies your college and degree qualifications.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 5: Certifications */}
              {activeSectionTab === 'certifications' && (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Extracted Certifications
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Professional credentials, licenses, and verified coursework.
                    </p>
                  </div>

                  {(!activeResume.extractedSections?.certifications || activeResume.extractedSections.certifications.length === 0) ? (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-3xl block mb-2">📜</span>
                      <p className="text-sm font-semibold text-gray-700">No certification section lines detected</p>
                      <p className="text-xs text-gray-400 mt-1">Industry certifications will appear here once detected.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {activeResume.extractedSections.certifications.map((cert, idx) => (
                        <li key={idx} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-xs text-gray-700 font-mono leading-relaxed">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
                📥
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Confirm Skill Import
                </h3>
                <p className="text-xs text-gray-500">
                  Importing <strong>{selectedSkillIds.length}</strong> selected skill{selectedSkillIds.length > 1 ? 's' : ''} to your profile
                </p>
              </div>
            </div>

            {/* Selected skills list summary */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              {selectedSkillIds.map((id) => {
                const claim = activeResume?.claimedSkills.find((c) => c.canonicalId === id);
                return (
                  <div key={id} className="flex items-center justify-between text-xs py-1 px-2.5 bg-white rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-900">{claim?.name || id}</span>
                    <span className="text-[11px] text-gray-400 capitalize">
                      {claim?.category ? categoryLabels[claim.category] || claim.category.replace('_', ' ') : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Evidence Policy Explanation */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Verification Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Imported skills are linked as <strong>unverified</strong> resume evidence with Level 0. They remain unverified until you complete an authorized assessment, protecting your career readiness accuracy.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={importing}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {importing ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Importing to Profile...</span>
                  </>
                ) : (
                  <span>Confirm & Import ({selectedSkillIds.length}) ✓</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
