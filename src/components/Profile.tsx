import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Building2,
  Save,
  Sparkles,
  Flame,
  Activity,
  Globe,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Terminal
} from 'lucide-react';
import Markdown from 'react-markdown';

export default function Profile() {
  const {
    profile,
    updateProfile,
    courses,
    assignments,
    projects,
    codingProfiles,
    applications,
    getAIRecommendation,
    certificates,
    achievements
  } = useStudentOS();

  // Profile Form State
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [major, setMajor] = useState(profile.major);
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear);

  // Status and AI assistance states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [aiBioSuggestion, setAiBioSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Calculate high-fidelity stats
  const totalCourses = courses.length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const pendingAssignments = assignments.filter((a) => a.status === 'pending').length;
  const totalProjects = projects.length;
  const hookedCodingProfiles = codingProfiles.length;
  const activeApplications = applications.length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      university,
      major,
      graduationYear: Number(graduationYear)
    });
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleGenerateAIOptimization = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('profile_bio_optimizer', {
        fullName,
        major,
        university,
        graduationYear,
        totalCourses,
        totalProjects,
        hookedCodingProfiles
      });
      setAiBioSuggestion(resp);
    } catch (err) {
      console.error(err);
      setAiBioSuggestion('Failed to generate professional profile suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  // Initials for avatar
  const initials = fullName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div id="profile_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" /> Student Profile <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">Settings</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1 font-sans">
            Customize your academic credentials, university background, and generate professional career bios.
          </p>
        </div>
      </header>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-fade-in text-left">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Academic profile successfully synchronized with StudentOS local state storage!
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left main form panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Settings form card */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
              <Building2 className="w-4 h-4 text-indigo-600" /> Academic & Personal Credentials
            </h3>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* University */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-500" /> University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Major */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-indigo-500" /> Major Field of Study
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Graduation Year */}
              <div className="flex flex-col gap-1 text-left max-w-xs">
                <label className="text-[10px] font-bold font-mono text-gray-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" /> Graduation Year
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  required
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Submit / Sync block */}
              <div className="flex justify-end border-t border-gray-100 pt-4 mt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs font-mono uppercase rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Academic Profile
                </button>
              </div>
            </form>
          </div>

          {/* AI Professional Summary Optimizer segment */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> AI elevator Pitch & Bio Optimizer
              </h3>
              <button
                onClick={handleGenerateAIOptimization}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-bold font-mono uppercase cursor-pointer disabled:opacity-50 transition-all"
              >
                {aiLoading ? 'Synthesizing...' : 'Synthesize Professional Bio'}
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Let Gemini compile an optimized, impactful professional summary, elevator pitch or bio tailored to your enrolled major, linked projects, and tracked metrics.
            </p>

            {aiBioSuggestion ? (
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed markdown-body">
                <Markdown>{aiBioSuggestion}</Markdown>
              </div>
            ) : (
              <div className="py-6 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400 italic">
                No generated bio suggestions yet. Click the "Synthesize Professional Bio" button above to craft your elevator pitch.
              </div>
            )}
          </div>
        </div>

        {/* Right Status Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Avatar & Fast Index Summary card */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center text-2xl font-sans tracking-tight mb-4 shadow-sm animate-pulse">
              {initials}
            </div>

            <h2 className="text-lg font-bold text-gray-950 leading-snug">{fullName}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{email}</p>

            <span className="mt-3.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-bold font-mono uppercase tracking-wider">
              Graduation Class: {graduationYear}
            </span>

            <div className="w-full border-t border-gray-100 mt-5 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-left">
                <span className="text-gray-500 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> Registered Classes</span>
                <span className="font-bold text-gray-950 font-mono">{totalCourses}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-left">
                <span className="text-gray-500 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-gray-400" /> Pending Deadlines</span>
                <span className="font-bold text-indigo-600 font-mono">{pendingAssignments}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-left">
                <span className="text-gray-500 flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-gray-400" /> Logged Projects</span>
                <span className="font-bold text-gray-950 font-mono">{totalProjects}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-left">
                <span className="text-gray-500 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-gray-400" /> Internship Pipelines</span>
                <span className="font-bold text-gray-950 font-mono">{activeApplications}</span>
              </div>
            </div>
          </div>

          {/* Productivity metrics card */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Flame className="w-4 h-4 text-orange-500" /> Standing Overview
            </h3>

            <div className="flex flex-col gap-3 mt-4 text-xs leading-relaxed">
              <p className="text-gray-600 font-sans">
                You are currently tracking <span className="font-bold text-indigo-600">{achievements.length} Professional Achievements</span> and <span className="font-bold text-indigo-600">{certificates.length} Verifiable Credentials</span> inside StudentOS.
              </p>
              <p className="text-gray-600 font-sans mt-1">
                Utilize the dedicated Professional side panel tabs to manage these separately, run custom recommendation analyses, and log new certifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
