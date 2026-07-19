import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Terminal as TerminalIcon,
  Plus,
  Trash2,
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Code2
} from 'lucide-react';

export default function Labs() {
  const {
    codingProfiles,
    addCodingProfile,
    updateCodingProfile,
    deleteCodingProfile,
    getAIRecommendation
  } = useStudentOS();

  // Profile forms
  const [platform, setPlatform] = useState<'LeetCode' | 'Codeforces' | 'GitHub' | 'HackerRank'>('LeetCode');
  const [username, setUsername] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);

  // AI Modal States
  const [aiActiveFeature, setAiActiveFeature] = useState<'coach' | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI Coding Coach inputs
  const [coachTopic, setCoachTopic] = useState('Graph BFS Shortest Path');
  const [codeAttempt, setCodeAttempt] = useState('function bfs(graph, start) {\n  let queue = [start];\n  let visited = new Set([start]);\n  // ...\n}');

  // Sandbox states
  const [sandboxCode, setSandboxCode] = useState(`// Welcome to StudentOS Compiler Sandbox\n// Select a challenge or write code and click Run!\n\nfunction solve(n) {\n    let sequence = [0, 1];\n    for (let i = 2; i < n; i++) {\n        sequence.push(sequence[i-1] + sequence[i-2]);\n    }\n    return sequence.slice(0, n);\n}\n\nconsole.log(solve(8));`);
  const [sandboxOutput, setSandboxOutput] = useState<string[]>([
    'Sandbox virtual environment established.',
    'Ready for sandbox code execution.'
  ]);
  const [sandboxRunning, setSandboxRunning] = useState(false);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    addCodingProfile({
      platform,
      username,
      solvedCount: Number(solvedCount),
      lastUpdated: new Date().toISOString()
    });
    setUsername('');
    setSolvedCount(0);
  };

  const executeAICoach = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('coding_coach', {
        topic: coachTopic,
        codeAttempt: codeAttempt,
        targetComplexity: 'O(V + E) Optimal Space-Time Constraints'
      });
      setAiResult(resp);
    } catch (err) {
      console.error(err);
      setAiResult('Failed to contact Coding Coach.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunSandbox = () => {
    setSandboxRunning(true);
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' '));
    };

    setTimeout(() => {
      try {
        // Safe evaluation simulation
        const result = new Function(sandboxCode)();
        if (result !== undefined) {
          logs.push(`Returned result: ${JSON.stringify(result)}`);
        }
        setSandboxOutput([
          `[Compilation Success - ${new Date().toLocaleTimeString()}]`,
          ...logs,
          '-- Sandbox Terminated successfully --'
        ]);
      } catch (err: any) {
        setSandboxOutput([
          `[Compilation Error - ${new Date().toLocaleTimeString()}]`,
          `Error: ${err.message}`,
          '-- Execution Interrupted --'
        ]);
      } finally {
        console.log = originalLog;
        setSandboxRunning(false);
      }
    }, 450);
  };

  return (
    <div id="labs_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Coding <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Labs & Sandbox</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Solve programming workspace scripts, log algorithmic profiles, run quick compile runtimes, and interact with the Gemini AI Coding Coach.
        </p>
      </header>

      {/* Grid: Profiles & Sandbox */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Left Col: Sandbox & Coach trigger (col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Interactive Code Editor Sandbox */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" /> JS Compile Sandbox
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSandboxCode(`function solve(arr) {\n    return arr.filter(n => n % 2 === 0);\n}\n\nconsole.log(solve([1, 2, 3, 4, 5, 6, 7, 8]));`)}
                  className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase transition-all"
                >
                  Filter Even
                </button>
                <button
                  onClick={() => setSandboxCode(`function solve(str) {\n    return str.split('').reverse().join('');\n}\n\nconsole.log(solve("StudentOS Labs"));`)}
                  className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg font-mono font-bold uppercase transition-all"
                >
                  Reverse Str
                </button>
                <button
                  onClick={() => {
                    setAiActiveFeature('coach');
                    setAiResult(null);
                  }}
                  className="flex items-center gap-1.5 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-mono font-bold uppercase transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Consult AI Coach
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Compiler editor (span 2) */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="w-full h-72 bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none shadow-inner leading-relaxed"
                  spellCheck="false"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRunSandbox}
                    disabled={sandboxRunning}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold font-mono text-xs uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Sandbox Script
                  </button>
                  <button
                    onClick={() => {
                      setSandboxCode('');
                      setSandboxOutput(['Sandbox virtual workspace cleared. Ready for input.']);
                    }}
                    className="p-2.5 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Console log output (span 1) */}
              <div className="md:col-span-1 bg-gray-950 rounded-xl p-4 flex flex-col justify-between text-left h-72 md:h-auto font-mono text-[10px] border border-gray-900 relative">
                <span className="absolute top-3 right-3 text-[8px] bg-gray-900 border border-gray-800 text-gray-500 font-mono px-1.5 py-0.5 rounded uppercase">V_CONSOLE</span>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] text-emerald-400">
                  {sandboxOutput.map((log, index) => (
                    <div key={index} className={log.startsWith('[Compilation Error') || log.startsWith('Error') ? 'text-rose-400' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-900 pt-3 mt-3 flex items-center gap-1.5 text-gray-600 uppercase text-[8px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-gray-600" /> virtual runtime standard standard_out
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Solved logs & Add platform accounts (col-span-1) */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-orange-600" /> Platform Solved Logs
            </h2>

            {codingProfiles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {codingProfiles.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between hover:border-orange-300 hover:bg-white transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 font-mono uppercase">{cp.platform}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">@{cp.username}</p>

                      <div className="flex gap-2 items-center mt-3">
                        <input
                          type="number"
                          value={cp.solvedCount}
                          onChange={(e) => updateCodingProfile(cp.id, { solvedCount: Number(e.target.value) })}
                          className="w-16 bg-white text-xs text-gray-800 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="text-[10px] text-gray-600 font-sans">solved count</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCodingProfile(cp.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors border border-gray-200 bg-white hover:bg-rose-50 cursor-pointer animate-fade-in"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No platform profiles hooked yet.</p>
            )}

            <form onSubmit={handleCreateProfile} className="flex flex-col gap-3.5 border-t border-gray-200 pt-4 mt-2 text-left">
              <h4 className="text-xs font-bold text-gray-500 uppercase font-mono">Hook new Account</h4>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="bg-white text-xs text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="HackerRank">HackerRank</option>
                </select>

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white text-xs text-gray-800 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs font-mono uppercase transition-all cursor-pointer shadow-xs"
              >
                Hook Profile Account
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Coding Coach Modal overlay */}
      {aiActiveFeature && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
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
              <h3 className="text-lg font-bold text-gray-900 font-sans">Google Coding Coach</h3>
            </div>

            {!aiResult && (
              <div className="flex flex-col gap-4 py-2 overflow-y-auto">
                <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium">
                  Input the algorithm challenge and your Javascript draft. Gemini will return Space-Time complexity proofs and optimization pointers.
                </p>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Algorithm Topic</label>
                  <input
                    type="text"
                    value={coachTopic}
                    onChange={(e) => setCoachTopic(e.target.value)}
                    className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Algorithm CodeDraft</label>
                  <textarea
                    value={codeAttempt}
                    onChange={(e) => setCodeAttempt(e.target.value)}
                    rows={6}
                    className="w-full bg-white text-xs text-gray-800 border border-gray-300 rounded-lg p-3 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={executeAICoach}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs font-mono uppercase flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {aiLoading ? 'Deconstructing Complexities...' : 'Ask Coding Coach'}
                </button>
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
