import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Plus,
  Trash2,
  Check,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  User,
  Star,
  Award,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { Course, Semester } from '../types';

export default function Academic() {
  const {
    courses,
    semesters,
    addCourse,
    updateCourse,
    deleteCourse,
    addSemester,
    updateSemester,
    deleteSemester,
    getAIRecommendation
  } = useStudentOS();

  // Create course form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState(3);
  const [selectedSemId, setSelectedSemId] = useState(semesters[0]?.id || 'sem_1');

  // Create semester states
  const [semTitle, setSemTitle] = useState('');
  const [semTargetGpa, setSemTargetGpa] = useState(9.0);

  // AI Planner modal state
  const [aiPlanCourse, setAiPlanCourse] = useState<Course | null>(null);
  const [aiPlanResult, setAiPlanResult] = useState<string | null>(null);
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [targetGrade, setTargetGrade] = useState('A+');
  const [weeksLeft, setWeeksLeft] = useState(4);
  const [confidence, setConfidence] = useState('Medium');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    addCourse({
      code,
      name,
      instructor,
      credits: Number(credits),
      semesterId: selectedSemId,
      attendancePresent: 0,
      attendanceAbsent: 0
    });
    setCode('');
    setName('');
    setInstructor('');
  };

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semTitle) return;
    addSemester({
      title: semTitle,
      targetGPA: Number(semTargetGpa)
    });
    setSemTitle('');
  };

  const handleAIStudyPlan = async (course: Course) => {
    setAiPlanCourse(course);
    setAiPlanResult(null);
  };

  const generateAIPlan = async () => {
    if (!aiPlanCourse) return;
    setAiPlanLoading(true);
    try {
      const plan = await getAIRecommendation('study_planner', {
        courseName: `${aiPlanCourse.code}: ${aiPlanCourse.name}`,
        targetGrade,
        weeks: weeksLeft,
        confidence,
        topics: 'Syllabus and active lectures review.'
      });
      setAiPlanResult(plan);
    } catch (err) {
      console.error(err);
      setAiPlanResult('Error generating plan. Please try again.');
    } finally {
      setAiPlanLoading(false);
    }
  };

  // GPA Weight converter
  const getGradeValue = (grade: string): number => {
    switch (grade.toUpperCase()) {
      case 'O': return 10.0;
      case 'A+': return 9.0;
      case 'A': return 8.0;
      case 'B+': return 7.0;
      case 'B': return 6.0;
      case 'C': return 5.0;
      case 'U': return 0.0;
      case 'F': return 0.0;
      default: return 10.0;
    }
  };

  // Calculate semester-specific aggregated expected GPA
  const calculateExpectedGPA = (semId: string) => {
    const semCourses = courses.filter((c) => c.semesterId === semId && c.grade);
    if (semCourses.length === 0) return 'N/A';
    const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);
    const weightedPoints = semCourses.reduce((sum, c) => sum + getGradeValue(c.grade || 'A') * c.credits, 0);
    return totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 'N/A';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header Banner */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Academic Manager & <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Attendance HQ</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Organize your semester schedules, track lecture attendance compliance limits, calculate GPAs, and formulate study sprints.
        </p>
      </header>

      {/* Grid: Semesters, Courses, Add Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left/Middle: Semesters and Course Details (col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Active Semesters cards */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" /> Semester Performance Targets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {semesters.map((sem) => {
                const calculated = calculateExpectedGPA(sem.id);
                return (
                  <div
                    key={sem.id}
                    className="p-5 rounded-lg bg-gray-50 border border-gray-200 hover:border-purple-300 transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wide font-sans">{sem.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">Target GPA: <span className="text-gray-900 font-mono font-bold">{sem.targetGPA}</span></p>
                      <button
                        onClick={() => deleteSemester(sem.id)}
                        className="text-gray-500 hover:text-rose-600 mt-3 text-xs flex items-center gap-1 cursor-pointer transition-colors font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Current GPA</span>
                      <span className="text-xl font-bold text-purple-600 font-mono block mt-1">{calculated}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course list grid with Attendance Ring indicators */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider mb-4">Course Offerings & Attendance Registers</h2>

            {courses.length > 0 ? (
              <div className="flex flex-col gap-4">
                {courses.map((c) => {
                  const total = c.attendancePresent + c.attendanceAbsent;
                  const attendancePct = total > 0 ? Math.round((c.attendancePresent / total) * 100) : 100;
                  const isWarning = attendancePct < 75;

                  // SVG Ring math
                  const radius = 24;
                  const circumference = 2 * Math.PI * radius;
                  const strokeOffset = circumference - (attendancePct / 100) * circumference;

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-100/50 transition-all"
                    >
                      {/* Left: Code, Name, Instructor */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase">
                            {c.code}
                          </span>
                          <span className="text-xs text-gray-600 font-mono font-bold">{c.credits} Credits</span>
                        </div>
                        <h3 className="text-md font-bold text-gray-900 mt-1.5 font-sans">{c.name}</h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1 font-sans">
                          <User className="w-3.5 h-3.5 text-gray-500" /> {c.instructor || 'Unspecified Teacher'}
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                          <select
                            value={c.grade || ''}
                            onChange={(e) => updateCourse(c.id, { grade: e.target.value })}
                            className="bg-white text-xs text-gray-700 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="">Expected Grade...</option>
                            {['O', 'A+', 'A', 'B+', 'B', 'C', 'U', 'F'].map((g) => (
                              <option key={g} value={g}>Grade: {g}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleAIStudyPlan(c)}
                            className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 transition-all font-semibold cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> AI Study Plan
                          </button>

                          <button
                            onClick={() => deleteCourse(c.id)}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors border border-gray-200 bg-white hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Right: Attendance controls and beautiful SVG Ring */}
                      <div className="flex items-center gap-5 border-t md:border-t-0 border-gray-200 pt-4 md:pt-0">
                        {/* Present / Absent Counters */}
                        <div className="text-left flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase font-mono tracking-wider">Attendance logs</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCourse(c.id, { attendancePresent: c.attendancePresent + 1 })}
                              className="px-2.5 py-1 text-xs rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold font-mono cursor-pointer"
                            >
                              P +1
                            </button>
                            <span className="text-sm font-bold text-gray-900 font-mono">{c.attendancePresent}</span>

                            <button
                              onClick={() => updateCourse(c.id, { attendanceAbsent: c.attendanceAbsent + 1 })}
                              className="px-2.5 py-1 text-xs rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold font-mono cursor-pointer"
                            >
                              A +1
                            </button>
                            <span className="text-sm font-bold text-gray-900 font-mono">{c.attendanceAbsent}</span>
                          </div>
                        </div>

                        {/* Attendance visual Ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r={radius}
                              stroke="#e5e7eb"
                              strokeWidth="5"
                              fill="transparent"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r={radius}
                              stroke={isWarning ? "#ef4444" : "#8b5cf6"}
                              strokeWidth="5"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeOffset}
                              className="transition-all duration-500 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className={`text-xs font-bold font-mono ${isWarning ? 'text-red-600' : 'text-purple-700'}`}>
                              {attendancePct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm font-sans flex flex-col items-center gap-2">
                <BookOpen className="w-10 h-10 text-gray-400" />
                No course offerings configured yet. Use the sidebar add form to initialize your semester.
              </div>
            )}
          </div>
        </div>

        {/* Right side: Add Course / Semester forms (col-span-1) */}
        <div className="flex flex-col gap-6 text-left">
          {/* Add Course form */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider mb-4">Add Course Offering</h3>
            <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS 301"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Algorithms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Instructor Name</label>
                  <input
                    type="text"
                    placeholder="Prof. Cormen"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full bg-white text-sm text-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Credits Weight</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    required
                    className="w-full bg-white text-sm text-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Select Semester Mapping</label>
                <select
                  value={selectedSemId}
                  onChange={(e) => setSelectedSemId(e.target.value)}
                  className="w-full bg-white text-sm text-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer font-sans"
                >
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs uppercase font-mono cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Course Offering
              </button>
            </form>
          </div>

          {/* Add Semester form */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider mb-4">Add Semester Target</h3>
            <form onSubmit={handleCreateSemester} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Semester Title</label>
                <input
                  type="text"
                  placeholder="e.g. Spring 2027"
                  value={semTitle}
                  onChange={(e) => setSemTitle(e.target.value)}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-bold uppercase font-mono mb-1.5">Target GPA (1.00 - 10.00)</label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="10"
                  value={semTargetGpa}
                  onChange={(e) => setSemTargetGpa(Number(e.target.value))}
                  required
                  className="w-full bg-white text-sm text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs uppercase font-mono cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Semester Target
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Study Planner Overlay Modal */}
      {aiPlanCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-left">
            <button
              onClick={() => {
                setAiPlanCourse(null);
                setAiPlanResult(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-900 font-sans">
                AI Study Planner: {aiPlanCourse.code}
              </h3>
            </div>

            {/* Inputs block prior to generation */}
            {!aiPlanResult && (
              <div className="flex flex-col gap-4 py-2 overflow-y-auto">
                <p className="text-xs text-gray-600 font-sans leading-relaxed">
                  Tailor your study strategy. Specify your goals below, and Gemini will assemble a chronological review list, recall guides, and test checkpoints.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Target Grade</label>
                    <select
                      value={targetGrade}
                      onChange={(e) => setTargetGrade(e.target.value)}
                      className="w-full bg-white text-xs text-gray-700 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {['A+', 'A', 'A-', 'B+', 'B', 'B-'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Weeks Left</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={weeksLeft}
                      onChange={(e) => setWeeksLeft(Number(e.target.value))}
                      className="w-full bg-white text-xs text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase font-mono mb-1">Current Confidence</label>
                    <select
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value)}
                      className="w-full bg-white text-xs text-gray-700 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateAIPlan}
                  disabled={aiPlanLoading}
                  className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs uppercase font-mono flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {aiPlanLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Assembling Sprints...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Synthesize Study Plan
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Display Generated Plan */}
            {aiPlanResult && (
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-sm text-gray-800 whitespace-pre-wrap font-sans max-w-none leading-relaxed">
                  {aiPlanResult}
                </div>
                <button
                  onClick={() => setAiPlanResult(null)}
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
