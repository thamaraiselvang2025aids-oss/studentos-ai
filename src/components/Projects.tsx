import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  GitBranch,
  ExternalLink,
  Github,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Projects() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject
  } = useStudentOS();

  // Project form states
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pTech, setPTech] = useState('');
  const [pRepo, setPRepo] = useState('');
  const [pLive, setPLive] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle) return;
    addProject({
      title: pTitle,
      description: pDesc,
      techStack: pTech.split(',').map((t) => t.trim()).filter(Boolean),
      repoUrl: pRepo,
      liveUrl: pLive,
      status: 'in_progress',
      tasks: []
    });
    setPTitle('');
    setPDesc('');
    setPTech('');
    setPRepo('');
    setPLive('');
  };

  const handleToggleProjectTask = (projectId: string, taskId: string, completed: boolean) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const updatedTasks = project.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    updateProject(projectId, { tasks: updatedTasks });
  };

  const handleAddProjectTask = (projectId: string, taskTitle: string) => {
    if (!taskTitle.trim()) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const newTask = { id: `pt_${Date.now()}`, title: taskTitle, completed: false };
    updateProject(projectId, { tasks: [...project.tasks, newTask] });
  };

  return (
    <div id="projects_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Coding <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Projects & Portfolios</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Manage your software repositories, technical portfolio projects, and code milestone checklists.
        </p>
      </header>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Left Col: Projects list */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-600" /> Active Coding Portfolios
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-mono font-bold">
                {projects.length} Active
              </span>
            </div>

            {projects.length > 0 ? (
              <div className="flex flex-col gap-5">
                {projects.map((proj) => {
                  const doneCount = proj.tasks.filter((t) => t.completed).length;
                  const totalCount = proj.tasks.length;
                  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-5 rounded-lg bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-white transition-all flex flex-col gap-4 text-left"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 font-sans">{proj.title}</h3>
                          <div className="flex items-center gap-2">
                            {proj.repoUrl && (
                              <a
                                href={proj.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors border border-gray-200 bg-white"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors border border-gray-200 bg-white"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => deleteProject(proj.id)}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors border border-gray-200 bg-white cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-1.5 font-sans leading-relaxed">{proj.description}</p>

                        {/* Tech stacks */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {proj.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="text-[9px] bg-white text-gray-600 border border-gray-200 px-2 py-0.5 rounded font-mono uppercase"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Milestones checklists and progress */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="font-bold text-purple-700 font-mono uppercase tracking-wider">Project Milestones</span>
                          <span className="font-mono text-gray-500">{doneCount}/{totalCount} completed</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-4 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        {/* Tasks list */}
                        <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                          {proj.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleProjectTask(proj.id, task.id, !task.completed)}
                              className="flex items-center gap-2 p-2 rounded bg-white hover:bg-purple-50/20 border border-gray-200 text-xs text-left cursor-pointer transition-all"
                            >
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                              <span className={task.completed ? 'line-through text-gray-400 font-sans' : 'text-gray-700 font-sans'}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Quick task adder */}
                        <input
                          type="text"
                          placeholder="+ Add project action point (Press Enter)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddProjectTask(proj.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="w-full bg-white border border-gray-300 text-xs text-gray-800 rounded-lg px-3 py-2 mt-3 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No projects logged yet.</p>
            )}
          </div>
        </div>

        {/* Right Col: Add Project Form */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" /> Add Coding Portfolio
            </h3>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-3.5">
              <input
                type="text"
                placeholder="Project title"
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                required
                className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
              <textarea
                placeholder="Short description of core features..."
                value={pDesc}
                onChange={(e) => setPDesc(e.target.value)}
                rows={3}
                className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
              />
              <input
                type="text"
                placeholder="Tech stacks (Comma separated: React, Gemini)"
                value={pTech}
                onChange={(e) => setPTech(e.target.value)}
                className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
              <input
                type="text"
                placeholder="Repo link (GitHub URL)"
                value={pRepo}
                onChange={(e) => setPRepo(e.target.value)}
                className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
              <input
                type="text"
                placeholder="Live deployment link"
                value={pLive}
                onChange={(e) => setPLive(e.target.value)}
                className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
              <button
                type="submit"
                className="py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase font-mono cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Index Coding Portfolio
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
