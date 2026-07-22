import React, { useState, useEffect } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  GitBranch,
  Wallet,
  Calendar as CalendarIcon,
  Sparkles,
  Search,
  Bell,
  LogOut,
  Flame,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Code,
  Award,
  ChevronRight,
  PlusCircle,
  Cpu,
  BookOpen,
  Tag,
  Activity,
  DollarSign,
  Filter,
  CheckSquare,
  FileText
} from 'lucide-react';
import { Assignment, Course, Goal, FinanceTransaction, Hackathon, CodingProfile, InternshipApplication, Project, Certificate, CalendarEvent } from '../types';

export default function Dashboard() {
  const {
    profile,
    courses,
    assignments,
    hackathons,
    codingProfiles,
    applications,
    projects,
    certificates,
    transactions,
    goals,
    calendarEvents,
    notes,
    notifications,
    updateAssignment,
    addAssignment,
    deleteAssignment,
    addHackathon,
    deleteHackathon,
    addCodingProfile,
    deleteCodingProfile,
    addApplication,
    deleteApplication,
    addProject,
    deleteProject,
    addCertificate,
    deleteCertificate,
    getAIRecommendation,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab
  } = useStudentOS();

  // Control tabs for the Third Row Patient-Style Table
  const [activeTableTab, setActiveTableTab] = useState<'assignments' | 'hackathons' | 'coding' | 'projects' | 'internships' | 'certificates'>('assignments');

  // Today's custom checkbox tasks (persisted locally)
  const [todayTasks, setTodayTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);

  // Quick Notes persistence
  const [scratchMemo, setScratchMemo] = useState<string>('');

  useEffect(() => {
    if (!profile.uid) return;
    const stored = localStorage.getItem(`student_os_${profile.uid}_today_tasks`);
    if (stored) {
      try {
        setTodayTasks(JSON.parse(stored));
      } catch (e) {
        setTodayTasks([]);
      }
    } else {
      setTodayTasks([]);
    }

    const storedMemo = localStorage.getItem(`student_os_${profile.uid}_dashboard_memo`);
    setScratchMemo(storedMemo || '');
  }, [profile.uid]);

  // Wrapped updater to save to user-scoped storage
  const updateTodayTasks = (newTasks: { id: string; text: string; done: boolean }[] | ((prev: { id: string; text: string; done: boolean }[]) => { id: string; text: string; done: boolean }[])) => {
    setTodayTasks((prev) => {
      const next = typeof newTasks === 'function' ? newTasks(prev) : newTasks;
      if (profile.uid) {
        localStorage.setItem(`student_os_${profile.uid}_today_tasks`, JSON.stringify(next));
      }
      return next;
    });
  };

  const updateScratchMemo = (newMemo: string) => {
    setScratchMemo(newMemo);
    if (profile.uid) {
      localStorage.setItem(`student_os_${profile.uid}_dashboard_memo`, newMemo);
    }
  };

  // AI Advice state
  const [aiTip, setAiTip] = useState<string>("Welcome to StudentOS! Click 'Sync AI' to fetch dynamic study plan recommendations.");
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);

  // Quick Add State selectors
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [quickCourseId, setQuickCourseId] = useState(courses[0]?.id || 'c_1');

  // Inline table creation states
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignCourse, setNewAssignCourse] = useState(courses[0]?.id || 'c_1');
  const [newAssignDue, setNewAssignDue] = useState('');
  const [newAssignPriority, setNewAssignPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [newHackName, setNewHackName] = useState('');
  const [newHackDate, setNewHackDate] = useState('');
  const [newHackRoles, setNewHackRoles] = useState('');
  const [newHackStatus, setNewHackStatus] = useState<'planning' | 'registered' | 'submitted' | 'won'>('registered');

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjStack, setNewProjStack] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<'idea' | 'in_progress' | 'completed'>('in_progress');

  const [newInternCompany, setNewInternCompany] = useState('');
  const [newInternRole, setNewInternRole] = useState('');
  const [newInternStatus, setNewInternStatus] = useState<'wishlist' | 'applied' | 'online_test' | 'interview' | 'offer' | 'rejected'>('applied');
  const [newInternDue, setNewInternDue] = useState('');

  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertCategory, setNewCertCategory] = useState<'academic' | 'technical' | 'soft_skills'>('technical');

  // Aggregates for Top Row KPI cards
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'pending').length;
  const activeHackathonsCount = hackathons.filter(h => h.status !== 'ended').length;
  const leetcodeSolved = codingProfiles.find(cp => cp.platform === 'LeetCode')?.solvedCount || 0;
  const activeProjectsCount = projects.filter(p => p.status !== 'completed').length;
  const activeAppsCount = applications.filter(a => a.status === 'applied' || a.status === 'online_test' || a.status === 'interview').length;
  const totalCertsCount = certificates.length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle || !quickDueDate) return;
    addAssignment({
      title: quickTitle,
      courseId: quickCourseId,
      dueDate: quickDueDate,
      priority: quickPriority,
      status: 'pending'
    });
    setQuickTitle('');
    setQuickDueDate('');
  };

  const handleAddTodayTask = () => {
    const text = prompt('Enter new daily task text:');
    if (text) {
      updateTodayTasks([...todayTasks, { id: String(Date.now()), text, done: false }]);
    }
  };

  const toggleTodayTask = (id: string) => {
    updateTodayTasks(todayTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleTriggerAIEngine = async () => {
    setIsGeneratingTip(true);
    try {
      const tip = await getAIRecommendation('strategic_audit', {
        assignments,
        courses,
        applications,
        codingProfiles,
        goals
      });
      setAiTip(tip);
    } catch (err) {
      setAiTip("Ensure Discrete Mathematics (MATH 201) formulas are reviewed. Ensure LeetCode solved counts hit 150 before next campus interview drive.");
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const submitInlineRegistryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTableTab === 'assignments') {
      if (!newAssignTitle || !newAssignDue) return;
      addAssignment({
        title: newAssignTitle,
        courseId: newAssignCourse,
        dueDate: newAssignDue,
        priority: newAssignPriority,
        status: 'pending'
      });
      setNewAssignTitle('');
      setNewAssignDue('');
    } else if (activeTableTab === 'hackathons') {
      if (!newHackName || !newHackDate) return;
      addHackathon({
        name: newHackName,
        date: newHackDate,
        teamSize: 3,
        rolesRequired: newHackRoles ? newHackRoles.split(',').map(s => s.trim()) : ['UI/UX', 'Backend'],
        ideas: ['AI Workspace'],
        milestones: [],
        status: newHackStatus
      });
      setNewHackName('');
      setNewHackDate('');
      setNewHackRoles('');
    } else if (activeTableTab === 'projects') {
      if (!newProjTitle) return;
      addProject({
        title: newProjTitle,
        description: 'Registry entry',
        techStack: newProjStack ? newProjStack.split(',').map(s => s.trim()) : ['React'],
        tasks: [],
        status: newProjStatus
      });
      setNewProjTitle('');
      setNewProjStack('');
    } else if (activeTableTab === 'internships') {
      if (!newInternCompany || !newInternRole) return;
      addApplication({
        company: newInternCompany,
        role: newInternRole,
        status: newInternStatus,
        appliedDate: new Date().toISOString().split('T')[0],
        nextDeadline: newInternDue || undefined
      });
      setNewInternCompany('');
      setNewInternRole('');
      setNewInternDue('');
    } else if (activeTableTab === 'certificates') {
      if (!newCertTitle || !newCertIssuer) return;
      addCertificate({
        title: newCertTitle,
        issuer: newCertIssuer,
        issueDate: new Date().toISOString().split('T')[0],
        category: newCertCategory
      });
      setNewCertTitle('');
      setNewCertIssuer('');
    }
    setShowInlineForm(false);
  };

  // Filter lists based on global search
  const filteredAssignments = assignments.filter(a => 
    globalSearchQuery === '' || a.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredHackathons = hackathons.filter(h =>
    globalSearchQuery === '' || h.name.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    globalSearchQuery === '' || p.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredApps = applications.filter(a =>
    globalSearchQuery === '' || a.company.toLowerCase().includes(globalSearchQuery.toLowerCase()) || a.role.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredCerts = certificates.filter(c =>
    globalSearchQuery === '' || c.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-gray-800 select-none overflow-hidden h-full">
      
      {/* TOP HEADER - Minimal, structured, standard ERP layout */}
      <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4 w-1/3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search master record directory..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full bg-[#F1F5F9] text-xs text-gray-800 pl-9 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-indigo-600 font-sans placeholder-gray-400"
            />
          </div>
        </div>

        {/* Current Date & Mini Context Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>SYS TIME:</span>
          <span className="text-gray-900 font-semibold">2026-07-18 15:43 UTC</span>
          <span className="text-gray-300">|</span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded text-[10px]">PRODUCTION DB</span>
        </div>

        {/* Quick Add and Action Trigger Bar */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleQuickAdd} className="hidden lg:flex items-center gap-2">
            <input
              type="text"
              placeholder="Quick Add Assignment..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              required
              className="bg-[#F1F5F9] text-[11px] text-gray-800 px-3 py-1.5 rounded border border-gray-300 focus:outline-none w-48 placeholder-gray-400"
            />
            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              required
              className="bg-[#F1F5F9] text-[11px] text-gray-700 px-2 py-1.5 rounded border border-gray-300 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>

          <div className="w-px h-6 bg-gray-200" />

          {/* User profile capsule info */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[11px] font-bold text-gray-900 leading-none">{profile.fullName}</p>
              <p className="text-[9px] text-gray-500 font-mono mt-0.5">{profile.university}</p>
            </div>
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase border border-indigo-500">
              {profile.fullName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD WORKSPACE - Side-by-side Layout with Content area and Right Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COMPONENT: Large content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
          
          {/* TOP ROW: 6 Colorful Statistic Cards with Gradient accents */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            
            {/* KPI 1: Assignments Due */}
            <div
              onClick={() => setActiveTab('academic')}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-3.5 rounded-xl border border-indigo-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider font-mono">Assignments Due</span>
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{pendingAssignmentsCount}</h4>
                <p className="text-[9px] text-indigo-100/90 mt-1">Outstanding homework</p>
              </div>
            </div>

            {/* KPI 2: Hackathons */}
            <div
              onClick={() => setActiveTab('hackathons')}
              className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-3.5 rounded-xl border border-teal-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-teal-100 font-bold uppercase tracking-wider font-mono">Active Hackathons</span>
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{activeHackathonsCount}</h4>
                <p className="text-[9px] text-teal-100/90 mt-1">Registered challenges</p>
              </div>
            </div>

            {/* KPI 3: Coding Problems */}
            <div
              onClick={() => setActiveTab('labs')}
              className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-3.5 rounded-xl border border-orange-600 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-100 font-bold uppercase tracking-wider font-mono">Coding Solved</span>
                <Code className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{leetcodeSolved}</h4>
                <p className="text-[9px] text-orange-100/90 mt-1 font-sans">LeetCode solved</p>
              </div>
            </div>

            {/* KPI 4: Projects */}
            <div
              onClick={() => setActiveTab('projects')}
              className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-3.5 rounded-xl border border-emerald-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider font-mono">Active Projects</span>
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{activeProjectsCount}</h4>
                <p className="text-[9px] text-emerald-100/90 mt-1">Build repositories</p>
              </div>
            </div>

            {/* KPI 5: Internships */}
            <div
              onClick={() => setActiveTab('placement')}
              className="bg-gradient-to-br from-rose-600 to-pink-700 text-white p-3.5 rounded-xl border border-rose-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-100 font-bold uppercase tracking-wider font-mono">Internships</span>
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{activeAppsCount}</h4>
                <p className="text-[9px] text-rose-100/90 mt-1 font-sans">Active pipelines</p>
              </div>
            </div>

            {/* KPI 6: Certificates */}
            <div
              onClick={() => setActiveTab('profile')}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl border border-blue-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 duration-150 cursor-pointer transition-all flex flex-col justify-between h-24"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider font-mono">Certificates</span>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="mt-2 text-left">
                <h4 className="text-2xl font-black font-mono leading-none">{totalCertsCount}</h4>
                <p className="text-[9px] text-blue-100/90 mt-1 font-sans">Validated credentials</p>
              </div>
            </div>

          </div>

          {/* SECOND ROW: Small Information Cards (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            
            {/* Widget 1: Today's Tasks */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between min-h-64">
              <div className="text-left">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Daily Duty Checklist
                  </h3>
                  <button onClick={handleAddTodayTask} className="text-[10px] text-indigo-600 font-bold uppercase hover:text-indigo-800 transition-colors cursor-pointer">
                    + Add Task
                  </button>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {todayTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTodayTask(task.id)}
                          className="w-4 h-4 accent-indigo-600 border-gray-300 rounded cursor-pointer"
                        />
                        <span className={`${task.done ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>{task.text}</span>
                      </div>
                      <button
                        onClick={() => updateTodayTasks(todayTasks.filter(t => t.id !== task.id))}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-mono text-left border-t border-gray-100 pt-2 mt-2">
                CRITIC: {todayTasks.filter(t => !t.done).length} unfinished items pending.
              </div>
            </div>

            {/* Widget 2: Academic Scratchpad / Notes */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between min-h-64">
              <div className="text-left">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" /> Lecture Scratchpad
                  </h3>
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded uppercase font-mono font-bold">Auto Saving</span>
                </div>
                <textarea
                  value={scratchMemo}
                  onChange={(e) => updateScratchMemo(e.target.value)}
                  placeholder="Type temporary lecture notes, formulae or memory triggers..."
                  className="w-full bg-gray-50 text-xs text-gray-800 p-2.5 rounded-lg border border-gray-200 h-32 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed placeholder-gray-400"
                />
              </div>
              <div className="text-[10px] text-gray-500 text-left pt-2 border-t border-gray-100">
                Character count: {scratchMemo.length} bytes (Max 1KB safety).
              </div>
            </div>

            {/* Widget 3: Quick AI Tips & Strategic Suggestions */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between min-h-64">
              <div className="text-left">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> ERP Cognitive Assistant
                  </h3>
                  <button
                    onClick={handleTriggerAIEngine}
                    disabled={isGeneratingTip}
                    className="text-[10px] text-indigo-600 font-bold uppercase hover:text-indigo-800 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isGeneratingTip ? 'Consulting...' : 'Sync AI'}
                  </button>
                </div>
                <div className="bg-indigo-50/50 p-2.5 rounded border border-indigo-100 text-xs text-gray-700 min-h-32 flex flex-col justify-center leading-relaxed font-sans">
                  <p className="leading-relaxed font-sans">{aiTip}</p>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 text-left border-t border-gray-100 pt-2">
                Source: Unified Academic Registry Analysis Engine.
              </div>
            </div>

          </div>

          {/* THIRD ROW: Large Hospital-Style Table Workspace */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            
            {/* Dense ERP Navigation Menu for Tables */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-mono text-gray-500 mr-2 uppercase font-bold">RECORDS MATRIX:</span>
                <div className="flex bg-gray-100 p-0.5 rounded border border-gray-300 shadow-xs">
                  {[
                    { id: 'assignments', label: 'ASSIGNMENTS' },
                    { id: 'hackathons', label: 'HACKATHONS' },
                    { id: 'projects', label: 'PROJECTS' },
                    { id: 'internships', label: 'INTERNSHIPS' },
                    { id: 'certificates', label: 'CERTIFICATES' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTableTab(tab.id as any); setShowInlineForm(false); }}
                      className={`px-3 py-1 text-[10px] font-bold rounded uppercase font-mono transition-colors cursor-pointer ${
                        activeTableTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Ribbon */}
              <button
                onClick={() => setShowInlineForm(!showInlineForm)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 text-[10px] font-bold uppercase font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> 
                {showInlineForm ? 'CLOSE FORM' : 'ADD NEW RECORD'}
              </button>
            </div>

            {/* INLINE RECORD ENTRY FORM (ERP workflow) */}
            {showInlineForm && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 animate-fade-in">
                <h4 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider mb-3">
                  Register New {activeTableTab.toUpperCase()} Entry
                </h4>
                <form onSubmit={submitInlineRegistryItem} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  
                  {activeTableTab === 'assignments' && (
                    <>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Red-Black Tree Lab"
                          value={newAssignTitle}
                          onChange={e => setNewAssignTitle(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Course Code</label>
                        <select
                          value={newAssignCourse}
                          onChange={e => setNewAssignCourse(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Due Date</label>
                        <input
                          type="date"
                          required
                          value={newAssignDue}
                          onChange={e => setNewAssignDue(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Priority</label>
                        <select
                          value={newAssignPriority}
                          onChange={e => setNewAssignPriority(e.target.value as any)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="low">LOW</option>
                          <option value="medium">MEDIUM</option>
                          <option value="high">HIGH</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeTableTab === 'hackathons' && (
                    <>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Hack Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AI Innovation Hackathon"
                          value={newHackName}
                          onChange={e => setNewHackName(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Target Date</label>
                        <input
                          type="date"
                          required
                          value={newHackDate}
                          onChange={e => setNewHackDate(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Required Roles</label>
                        <input
                          type="text"
                          placeholder="e.g. UI/UX designer, API developer"
                          value={newHackRoles}
                          onChange={e => setNewHackRoles(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Reg status</label>
                        <select
                          value={newHackStatus}
                          onChange={e => setNewHackStatus(e.target.value as any)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="planning">PLANNING</option>
                          <option value="registered">REGISTERED</option>
                          <option value="submitted">SUBMITTED</option>
                          <option value="won">WON PRIZE</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeTableTab === 'projects' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Project Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. StudentOS AI Core"
                          value={newProjTitle}
                          onChange={e => setNewProjTitle(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Tech Stack</label>
                        <input
                          type="text"
                          placeholder="e.g. React, Tailwind, Vite"
                          value={newProjStack}
                          onChange={e => setNewProjStack(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Status</label>
                        <select
                          value={newProjStatus}
                          onChange={e => setNewProjStatus(e.target.value as any)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="idea">IDEATION</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="completed">COMPLETED</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeTableTab === 'internships' && (
                    <>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Company</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Microsoft"
                          value={newInternCompany}
                          onChange={e => setNewInternCompany(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Role Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SWE Summer Intern"
                          value={newInternRole}
                          onChange={e => setNewInternRole(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Process status</label>
                        <select
                          value={newInternStatus}
                          onChange={e => setNewInternStatus(e.target.value as any)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="wishlist">WISHLIST</option>
                          <option value="applied">APPLIED</option>
                          <option value="online_test">ONLINE TEST</option>
                          <option value="interview">INTERVIEW</option>
                          <option value="offer">OFFER RECIEVED</option>
                          <option value="rejected">REJECTED</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Next milestone date</label>
                        <input
                          type="date"
                          value={newInternDue}
                          onChange={e => setNewInternDue(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {activeTableTab === 'certificates' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Credential Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AWS Certified Solutions Architect"
                          value={newCertTitle}
                          onChange={e => setNewCertTitle(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Issuer Agency</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Amazon Web Services"
                          value={newCertIssuer}
                          onChange={e => setNewCertIssuer(e.target.value)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase font-mono mb-1">Classification</label>
                        <select
                          value={newCertCategory}
                          onChange={e => setNewCertCategory(e.target.value as any)}
                          className="w-full bg-white text-xs text-gray-800 px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="technical">TECHNICAL SKILL</option>
                          <option value="academic">ACADEMIC HONORS</option>
                          <option value="soft_skills">PROFESSIONAL DEVELOPMENT</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-span-1 md:col-span-4 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowInlineForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold uppercase px-4 py-2 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase px-4 py-2 rounded transition-colors"
                    >
                      Commit to Registry
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* DENSE HOSPITAL PATIENT RECORD MATRIX (Unified Database Tables) */}
            <div className="overflow-x-auto">
              
              {/* Table A: Assignments */}
              {activeTableTab === 'assignments' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Assignment Title</th>
                      <th className="p-3 text-left font-bold">Course Ref</th>
                      <th className="p-3 text-left font-bold">Priority Badge</th>
                      <th className="p-3 text-left font-bold">Registry Status</th>
                      <th className="p-3 text-left font-bold">Target Due Date</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map(a => {
                      const course = courses.find(c => c.id === a.courseId);
                      return (
                        <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 pl-4 font-semibold text-gray-950 font-sans">{a.title}</td>
                          <td className="p-3 text-indigo-600 font-mono font-semibold">{course ? course.code : 'MATH 201'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                              a.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                              a.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {a.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                              a.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">{a.dueDate}</td>
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {a.status === 'pending' && (
                                <button
                                  onClick={() => updateAssignment(a.id, { status: 'completed' })}
                                  className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                  title="Complete assignment"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAssignment(a.id)}
                                className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                title="Delete from registry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAssignments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Assignments database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Table B: Hackathons */}
              {activeTableTab === 'hackathons' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Hackathon Name</th>
                      <th className="p-3 text-left font-bold">Target Date</th>
                      <th className="p-3 text-left font-bold">Team Vacancies</th>
                      <th className="p-3 text-left font-bold">Registration State</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHackathons.map(h => (
                      <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-gray-950 font-sans">{h.name}</td>
                        <td className="p-3 font-mono text-gray-600">{h.date}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {h.rolesRequired.map((r, i) => (
                              <span key={i} className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-700 font-mono border border-gray-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                            {h.status}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => deleteHackathon(h.id)}
                            className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredHackathons.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Hackathons database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Table C: Coding Labs */}
              {activeTableTab === 'coding' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Evaluation Platform</th>
                      <th className="p-3 text-left font-bold">Scholar Handle</th>
                      <th className="p-3 text-left font-bold">Solved Solutions</th>
                      <th className="p-3 text-left font-bold">Competitive Rating</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codingProfiles.map(cp => (
                      <tr key={cp.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-gray-950 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-orange-500" />
                          {cp.platform}
                        </td>
                        <td className="p-3 font-mono text-gray-600">@{cp.username}</td>
                        <td className="p-3 font-mono font-bold text-gray-950">{cp.solvedCount}</td>
                        <td className="p-3 font-mono text-indigo-600">{cp.rating ? cp.rating : 'N/A'}</td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => deleteCodingProfile(cp.id)}
                            className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {codingProfiles.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Coding database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Table D: Project Repositories */}
              {activeTableTab === 'projects' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Build Repositories</th>
                      <th className="p-3 text-left font-bold">Engineering Stack</th>
                      <th className="p-3 text-left font-bold">Status Cycle</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4">
                          <p className="font-semibold text-gray-950 font-sans">{p.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 font-sans truncate max-w-xs">{p.description}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {p.techStack.map((tech, i) => (
                              <span key={i} className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-700 font-mono border border-gray-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Projects database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Table E: Internship pipelines */}
              {activeTableTab === 'internships' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Company</th>
                      <th className="p-3 text-left font-bold">Target Role</th>
                      <th className="p-3 text-left font-bold">Pipeline Stage</th>
                      <th className="p-3 text-left font-bold">Next Milestone</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(app => (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-gray-950 font-sans">{app.company}</td>
                        <td className="p-3 font-sans text-gray-700 font-medium">{app.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            app.status === 'offer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            app.status === 'interview' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            app.status === 'online_test' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-600">{app.nextDeadline ? app.nextDeadline : 'No deadline'}</td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredApps.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Internship database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Table F: Certificates */}
              {activeTableTab === 'certificates' && (
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-3 pl-4 text-left font-bold">Credential Title</th>
                      <th className="p-3 text-left font-bold">Issuing Authority</th>
                      <th className="p-3 text-left font-bold">Issue Date</th>
                      <th className="p-3 text-left font-bold">Classification</th>
                      <th className="p-3 text-right pr-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map(cert => (
                      <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-gray-950 font-sans flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-600" />
                          {cert.title}
                        </td>
                        <td className="p-3 text-gray-600">{cert.issuer}</td>
                        <td className="p-3 font-mono text-gray-600">{cert.issueDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                            {cert.category}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => deleteCertificate(cert.id)}
                            className="p-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCerts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 uppercase font-mono text-[10px]">
                          No records committed in Certificates database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>

            {/* Pagination / Record telemetry */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <div>
                SHOWING ACTIVE SCHEMA: <span className="text-gray-900 font-semibold">studentos.{activeTableTab}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>ROW DATA OK • {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE PANEL: Upcoming Events, Today's Schedule, Notifications, Calendar */}
        <aside className="w-80 border-l border-gray-200 bg-white flex flex-col justify-between shrink-0 overflow-y-auto p-4 space-y-4 text-left z-10 shadow-xs">
          
          {/* Top block: Today's Schedule (Classes & exams) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" /> Academic Agenda (Today)
            </h3>
            <div className="space-y-2">
              {calendarEvents.slice(0, 3).map(ev => {
                const isClass = ev.type === 'class';
                return (
                  <div key={ev.id} className={`p-2.5 rounded border text-xs text-left ${
                    isClass ? 'bg-indigo-50 border-indigo-200 text-indigo-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold leading-tight">{ev.title}</p>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isClass ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {ev.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{ev.start.split('T')[1]?.substring(0, 5) || 'All Day'}</p>
                    {ev.description && <p className="text-[10px] text-gray-600 mt-1 italic">{ev.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle block: Notifications and System Log Stream */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <Bell className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> SYSTEM ALERTS & NOTIFICATIONS
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notifications.slice(0, 3).map(n => {
                const isWarn = n.type === 'warning';
                return (
                  <div key={n.id} className={`p-2.5 rounded border text-xs text-left ${
                    isWarn ? 'bg-red-50 border-red-200 text-red-950' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}>
                    <p className="font-bold leading-tight flex items-center gap-1">
                      {isWarn && <AlertTriangle className="w-3.5 h-3.5 text-red-600 inline" />}
                      {n.title}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1 leading-snug">{n.message}</p>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <div className="p-3 text-center text-gray-500 font-mono text-[10px]">
                  All alerts green. System telemetry clear.
                </div>
              )}
            </div>
          </div>

          {/* Bottom block: Dynamic Calendar grid simulation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" /> July 2026 Calendar
            </h3>
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center text-gray-500 font-bold uppercase mb-2 border-b border-gray-200 pb-1">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-center">
                {/* Simulated grid of month days */}
                {Array.from({ length: 31 }).map((_, idx) => {
                  const day = idx + 1;
                  const isCurrent = day === 18;
                  const hasDeadline = day === 19 || day === 21;
                  return (
                    <div
                      key={idx}
                      className={`p-1 rounded flex flex-col items-center justify-between h-7 ${
                        isCurrent ? 'bg-indigo-600 text-white font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span>{day}</span>
                      {hasDeadline && <span className="h-1 w-1 bg-amber-500 rounded-full" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom quick tips box */}
          <div className="p-3 rounded bg-indigo-50 border border-indigo-150 text-xs text-indigo-950">
            <p className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Quick Scholar Tip
            </p>
            <p className="text-indigo-900 text-[11px] mt-1 leading-relaxed">
              Consolidate your study guides before Friday to maintain a highly-structured and up-to-date registry database.
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
}
