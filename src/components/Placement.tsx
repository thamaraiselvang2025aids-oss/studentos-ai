import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Plus,
  Trash2,
  Briefcase,
  Sparkles,
  DollarSign,
  Clock,
  X,
  FileText
} from 'lucide-react';
import { InternshipApplication } from '../types';

export default function Placement() {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    getAIRecommendation
  } = useStudentOS();

  // Internship/Job application states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<InternshipApplication['status']>('wishlist');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');

  // AI Modal States
  const [aiActiveFeature, setAiActiveFeature] = useState<'analyzer' | 'roadmap' | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI Resume Analyzer inputs
  const [targetRole, setTargetRole] = useState('Software Engineering Intern');
  const [resumeText, setResumeText] = useState('Created microservices using Node/Express. Improved database indexes.');

  // AI Placement inputs
  const [placementRole, setPlacementRole] = useState('Backend Systems Engineer');
  const [placementTargetCompanies, setPlacementTargetCompanies] = useState('Google, Stripe');

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;
    addApplication({
      company,
      role,
      status,
      salary,
      notes,
      appliedDate: new Date().toISOString().split('T')[0]
    });
    setCompany('');
    setRole('');
    setSalary('');
    setNotes('');
  };

  const executeAIResume = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('resume_analyzer', {
        targetRole,
        resumeText
      });
      setAiResult(resp);
    } catch (err) {
      console.error(err);
      setAiResult('Failed to analyze resume points.');
    } finally {
      setAiLoading(false);
    }
  };

  const executeAIPlacement = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('placement_roadmap', {
        roleName: placementRole,
        companies: placementTargetCompanies,
        durationWeeks: 8,
        strengths: 'Algorithms, Database optimization',
        weaknesses: 'Distributed caching systems'
      });
      setAiResult(resp);
    } catch (err) {
      console.error(err);
      setAiResult('Failed to generate placement roadmap.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="placement_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Career <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Placement & Applications</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Log job or internship applications, track recruiting pipeline statuses, analyze resume bullet metrics, and construct target roadmap guides.
        </p>
      </header>

      {/* AI Assistance quick-links cards row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
        <div
          onClick={() => {
            setAiActiveFeature('analyzer');
            setAiResult(null);
          }}
          className="p-5 rounded-xl bg-white hover:bg-purple-50/30 border border-gray-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 font-sans">AI Resume Critiquer</h3>
          <p className="text-xs text-gray-600 mt-1 font-sans leading-snug">Grade resume bullets, assess active phrasing impact, and get metric suggestions.</p>
        </div>

        <div
          onClick={() => {
            setAiActiveFeature('roadmap');
            setAiResult(null);
          }}
          className="p-5 rounded-xl bg-white hover:bg-purple-50/30 border border-gray-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 font-sans">Placement Roadmapper</h3>
          <p className="text-xs text-gray-600 mt-1 font-sans leading-snug">Generate specialized, multi-week algorithmic study pipelines targeting specific tech firms.</p>
        </div>
      </section>

      {/* Grid: Applications tracking pipelines */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Left: Applications listing (col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" /> Active Job Pipelines
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-mono font-bold">
                {applications.length} Tracked
              </span>
            </div>

            {applications.length > 0 ? (
              <div className="flex flex-col gap-3">
                {applications.map((app) => {
                  const statusColors = {
                    wishlist: 'bg-gray-100 text-gray-700 border-gray-300',
                    applied: 'bg-blue-50 text-blue-700 border-blue-200',
                    online_test: 'bg-purple-50 text-purple-700 border-purple-200',
                    interview: 'bg-amber-50 text-amber-700 border-amber-200',
                    offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
                  };

                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{app.company}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">Applied {app.appliedDate}</span>
                        </div>
                        <p className="text-xs text-gray-600 font-sans mt-1">{app.role}</p>

                        <div className="flex flex-wrap gap-3 items-center mt-3">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${statusColors[app.status]}`}>
                            {app.status.replace('_', ' ')}
                          </span>

                          {app.salary && (
                            <span className="text-[10px] text-emerald-700 flex items-center font-mono font-bold">
                              <DollarSign className="w-3 h-3" /> {app.salary}
                            </span>
                          )}

                          {app.nextDeadline && (
                            <span className="text-[10px] text-rose-700 flex items-center gap-1 font-mono font-bold">
                              <Clock className="w-3 h-3" /> Event: {app.nextDeadline}
                            </span>
                          )}
                        </div>

                        {app.notes && (
                          <p className="text-[10px] text-gray-500 mt-2 italic max-w-[400px] truncate">{app.notes}</p>
                        )}
                      </div>

                      {/* Right side controls: advance status, delete */}
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <select
                          value={app.status}
                          onChange={(e) => updateApplication(app.id, { status: e.target.value as any })}
                          className="bg-white text-xs text-gray-700 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer font-sans"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="online_test">Online Test</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors border border-gray-200 bg-white hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm font-sans flex flex-col items-center gap-2">
                <Briefcase className="w-10 h-10 text-gray-300" />
                No applications logged yet. Register a new record using the sidebar form on the right.
              </div>
            )}
          </div>
        </div>

        {/* Right: Creation form (col-span-1) */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider mb-4">Log Application</h3>
            <form onSubmit={handleCreateApplication} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Role / Position</label>
                <input
                  type="text"
                  placeholder="e.g. SWE Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white text-xs text-gray-700 border border-gray-300 rounded-lg px-2 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="online_test">Online Test</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Salary Offer</label>
                  <input
                    type="text"
                    placeholder="e.g. $45/hr"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-white text-sm text-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Context Notes</label>
                <textarea
                  placeholder="Focuses on distributed caching, system rounds, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs uppercase font-mono cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Index Application
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Assistant Overlay */}
      {aiActiveFeature && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-left">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
            <button
              onClick={() => {
                setAiActiveFeature(null);
                setAiResult(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-purple-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                {aiActiveFeature === 'analyzer' ? 'AI Resume Critique' : 'Placement Roadmap Generator'}
              </h3>
            </div>

            {!aiResult && (
              <div className="flex flex-col gap-4 py-2 overflow-y-auto">
                {aiActiveFeature === 'analyzer' && (
                  <>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium">
                      Paste a summary of your resume bullets. Gemini will output a standardized ATS score, flag weak phrasing, and suggest metric enhancements.
                    </p>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Target Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Resume Points</label>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={6}
                        className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-3 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={executeAIResume}
                      disabled={aiLoading}
                      className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs font-mono uppercase flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {aiLoading ? 'Auditing Resume Metrics...' : 'Evaluate Resume Points'}
                    </button>
                  </>
                )}

                {aiActiveFeature === 'roadmap' && (
                  <>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium">
                      Input your target engineering role and key dream tech firms to output a customized week-by-week preparation curriculum.
                    </p>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Engineering Role</label>
                      <input
                        type="text"
                        value={placementRole}
                        onChange={(e) => setPlacementRole(e.target.value)}
                        className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Target Companies</label>
                      <input
                        type="text"
                        value={placementTargetCompanies}
                        onChange={(e) => setPlacementTargetCompanies(e.target.value)}
                        className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>
                    <button
                      onClick={executeAIPlacement}
                      disabled={aiLoading}
                      className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs font-mono uppercase flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {aiLoading ? 'Compiling Placement Tracks...' : 'Synthesize Prep Roadmap'}
                    </button>
                  </>
                )}
              </div>
            )}

            {aiResult && (
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {aiResult}
                </div>
                <button
                  onClick={() => setAiResult(null)}
                  className="w-full py-2.5 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 text-xs font-bold font-mono uppercase cursor-pointer"
                >
                  Configure and Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
