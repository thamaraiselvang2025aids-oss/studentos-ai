import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Award,
  Sparkles,
  Layers,
  Users,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';
import { Hackathon } from '../types';

export default function Hackathons() {
  const {
    hackathons,
    addHackathon,
    updateHackathon,
    deleteHackathon,
    getAIRecommendation
  } = useStudentOS();

  // Hackathon states
  const [hName, setHName] = useState('');
  const [hDate, setHDate] = useState('');
  const [hStartDate, setHStartDate] = useState('');
  const [hEndDate, setHEndDate] = useState('');
  const [hDuration, setHDuration] = useState('');
  const [hSubmissionDeadline, setHSubmissionDeadline] = useState('');
  const [hStanding, setHStanding] = useState<'participation' | 'winner' | 'runner_up' | 'none'>('none');
  const [hTeam, setHTeam] = useState(3);
  const [hRoles, setHRoles] = useState('');

  // AI Hackathon Ideator states
  const [aiHack, setAiHack] = useState<Hackathon | null>(null);
  const [aiIdeatorResult, setAiIdeatorResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('EdTech AI assistant platform');

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName) return;
    addHackathon({
      name: hName,
      date: hStartDate || hDate || new Date().toISOString().split('T')[0],
      startDate: hStartDate,
      endDate: hEndDate,
      duration: hDuration,
      submissionDeadline: hSubmissionDeadline,
      standing: hStanding,
      teamSize: Number(hTeam),
      rolesRequired: hRoles.split(',').map((r) => r.trim()).filter(Boolean),
      ideas: [],
      milestones: [
        { id: `m1_${Date.now()}`, title: 'Team setup & kickoff ideas brainstorming', completed: false },
        { id: `m2_${Date.now()}`, title: 'Build system skeleton, views, and server routes', completed: false },
        { id: `m3_${Date.now()}`, title: 'Polish aesthetics, compile client, and record video', completed: false }
      ],
      status: 'registered'
    });
    setHName('');
    setHDate('');
    setHStartDate('');
    setHEndDate('');
    setHDuration('');
    setHSubmissionDeadline('');
    setHStanding('none');
    setHRoles('');
    setHTeam(3);
  };

  const handleToggleHackMilestone = (hackId: string, milestoneId: string, completed: boolean) => {
    const hack = hackathons.find((h) => h.id === hackId);
    if (!hack) return;
    const updated = hack.milestones.map((m) => (m.id === milestoneId ? { ...m, completed } : m));
    updateHackathon(hackId, { milestones: updated });
  };

  const generateHackathonIdeas = async () => {
    if (!aiHack) return;
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('hackathon_planner', {
        hackathonName: aiHack.name,
        targetVertical: aiPromptTopic,
        teamSize: aiHack.teamSize,
        roles: aiHack.rolesRequired
      });
      setAiIdeatorResult(resp);
    } catch (err) {
      console.error(err);
      setAiIdeatorResult('Failed to generate brainstorming ideas.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="hackathons_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Hackathons & <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Code Sprints</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Log registered hackathons, map team sizes, track sprint milestones, and run an AI concept brainstomer to pitch your solution perfectly.
        </p>
      </header>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Left Col: Hackathons list */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" /> Registered Hackathons
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-mono font-bold">
                {hackathons.length} Scheduled
              </span>
            </div>

            {hackathons.length > 0 ? (
              <div className="flex flex-col gap-5">
                {hackathons.map((hack) => (
                  <div
                    key={hack.id}
                    className="p-5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:border-purple-300 transition-all text-left"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm font-bold text-gray-900 font-sans">{hack.name}</h3>
                        
                        {/* Start Date / Date Badge */}
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded font-mono font-bold">
                          Date: {hack.startDate || hack.date}
                        </span>

                        {/* Standing Badge */}
                        {hack.standing && hack.standing !== 'none' && (
                          <span className={`text-[10px] border px-2.5 py-0.5 rounded font-mono font-bold ${
                            hack.standing === 'winner' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            hack.standing === 'runner_up' ? 'bg-gray-200 text-gray-800 border-gray-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                          }`}>
                            {hack.standing === 'winner' ? '🏆 Winner' :
                             hack.standing === 'runner_up' ? '🥈 Runner-Up' : '🎖️ Participation'}
                          </span>
                        )}

                        {/* Deadline Countdown Logic */}
                        {(() => {
                          if (hack.status === 'won' || hack.status === 'ended') return null;
                          const hackDate = new Date(hack.startDate || hack.date);
                          if (isNaN(hackDate.getTime())) return null;
                          const diffTime = Math.ceil((hackDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          if (diffTime < 0) {
                            return <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded font-mono font-bold">Past Due</span>;
                          }
                          return (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded font-mono font-bold">
                              {diffTime === 0 ? 'Today' : `${diffTime} days left`}
                            </span>
                          );
                        })()}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1.5 font-sans">
                        Team Size: <span className="font-semibold text-gray-900">{hack.teamSize}</span> • Roles: {hack.rolesRequired.join(', ') || 'Any'}
                      </p>

                      {/* Extended Journey Parameters (Start, End, Duration, Deadline) */}
                      <div className="grid grid-cols-2 gap-2 mt-3 max-w-md text-[10px] text-gray-500 font-mono">
                        {hack.startDate && <div>🚀 Start Date: <span className="text-gray-700 font-bold">{hack.startDate}</span></div>}
                        {hack.endDate && <div>🏁 End Date: <span className="text-gray-700 font-bold">{hack.endDate}</span></div>}
                        {hack.duration && <div>⏱️ Duration: <span className="text-gray-700 font-bold">{hack.duration}</span></div>}
                        {hack.submissionDeadline && <div>⏰ Submission: <span className="text-gray-700 font-bold">{hack.submissionDeadline}</span></div>}
                      </div>

                      <button
                        onClick={() => {
                          setAiHack(hack);
                          setAiIdeatorResult(null);
                        }}
                        className="flex items-center gap-1.5 mt-4 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-lg border border-purple-200 transition-all font-semibold font-mono uppercase cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-600" /> Brainstorm AI Pitch Concepts
                      </button>

                      {/* Hackathon Status & Standing Selectors */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Status:</span>
                          <select
                            value={hack.status}
                            onChange={(e) => updateHackathon(hack.id, { status: e.target.value as any })}
                            className="bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans cursor-pointer"
                          >
                            <option value="planning">Planning</option>
                            <option value="registered">Registered</option>
                            <option value="submitted">Submitted</option>
                            <option value="won">Won</option>
                            <option value="ended">Ended</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Standing:</span>
                          <select
                            value={hack.standing || 'none'}
                            onChange={(e) => updateHackathon(hack.id, { standing: e.target.value as any })}
                            className="bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans cursor-pointer"
                          >
                            <option value="none">None</option>
                            <option value="participation">Participation</option>
                            <option value="winner">Winner</option>
                            <option value="runner_up">Runner-Up</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Milestones checklist status */}
                    <div className="flex-1 text-left border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 max-w-sm">
                      <p className="text-[10px] text-gray-500 font-bold uppercase font-mono mb-2">Milestones Tracker</p>
                      <div className="flex flex-col gap-1.5">
                        {hack.milestones.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleToggleHackMilestone(hack.id, m.id, !m.completed)}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            {m.completed ? (
                              <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 shrink-0" />
                            )}
                            <span className={`text-xs font-sans ${m.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex items-center md:self-start">
                      <button
                        onClick={() => deleteHackathon(hack.id)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors border border-gray-200 bg-white cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No hackathons registered.</p>
            )}
          </div>
        </div>

        {/* Right Col: Add Hackathon Form */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" /> Log Registered Hackathon
            </h3>
            <form onSubmit={handleCreateHackathon} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Smart India Hackathon"
                  value={hName}
                  onChange={(e) => setHName(e.target.value)}
                  required
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Start Date</label>
                <input
                  type="date"
                  value={hStartDate}
                  onChange={(e) => setHStartDate(e.target.value)}
                  required
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">End Date</label>
                <input
                  type="date"
                  value={hEndDate}
                  onChange={(e) => setHEndDate(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Duration (e.g. 36 hours)</label>
                <input
                  type="text"
                  placeholder="e.g. 36 hours"
                  value={hDuration}
                  onChange={(e) => setHDuration(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Submission Deadline</label>
                <input
                  type="date"
                  value={hSubmissionDeadline}
                  onChange={(e) => setHSubmissionDeadline(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Standing</label>
                <select
                  value={hStanding}
                  onChange={(e) => setHStanding(e.target.value as any)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans cursor-pointer animate-fade-in"
                >
                  <option value="none">None</option>
                  <option value="participation">Participation</option>
                  <option value="winner">Winner</option>
                  <option value="runner_up">Runner-Up</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Target Team Size</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={hTeam}
                  onChange={(e) => setHTeam(Number(e.target.value))}
                  required
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Roles Needed (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Dev, ML Architect"
                  value={hRoles}
                  onChange={(e) => setHRoles(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase font-mono cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Index Hackathon
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Brainstorming Modal */}
      {aiHack && (
        <div className="fixed inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-gray-100 flex flex-col gap-4 text-left animate-scale-in">
            <button
              onClick={() => {
                setAiHack(null);
                setAiIdeatorResult(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold font-mono px-3 py-1 rounded-full border border-purple-200">
                COGNITIVE SPRINT BRAINSTORMER
              </span>
              <h3 className="text-md font-bold text-gray-950 mt-3 font-sans">
                Elevating {aiHack.name} Pitch Concepts
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-sans">
                Input your vertical/topic description below and let Gemini design an optimized stack, architecture blueprint, and pitch slide framework.
              </p>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9.5px] font-bold font-mono text-gray-500 uppercase">Vertical / Idea Concept</label>
              <input
                type="text"
                value={aiPromptTopic}
                onChange={(e) => setAiPromptTopic(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={generateHackathonIdeas}
              disabled={aiLoading}
              className="py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xs font-mono uppercase rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Synthesizing custom pitch blueprint...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" /> Trigger AI Brainstorm Engine
                </>
              )}
            </button>

            {aiIdeatorResult && (
              <div className="bg-purple-950/5 border border-purple-100 p-4 rounded-xl max-h-[260px] overflow-y-auto mt-2">
                <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5 uppercase font-mono tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Generated Pitch Strategy:
                </h4>
                <p className="text-xs text-gray-800 whitespace-pre-line font-sans leading-relaxed">
                  {aiIdeatorResult}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
