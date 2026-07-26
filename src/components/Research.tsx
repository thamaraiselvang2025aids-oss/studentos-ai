import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Plus,
  Trash2,
  BookOpen,
  Bookmark,
  Layers,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { ResearchPaper } from '../types';

export default function Research() {
  const {
    researchPapers,
    addResearchPaper,
    deleteResearchPaper
  } = useStudentOS();
  // Research states
  const [rTitle, setRTitle] = useState('');
  const [rAuthors, setRAuthors] = useState('');
  const [rJournal, setRJournal] = useState('');
  const [rStatus, setRStatus] = useState<ResearchPaper['status']>('writing');
  const [rDoi, setRDoi] = useState('');
  const [rPublishLink, setRPublishLink] = useState('');
  const [rCertificate, setRCertificate] = useState('');

  const handleCreateResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle) return;
    addResearchPaper({
      title: rTitle,
      authors: rAuthors,
      journal: rJournal,
      status: rStatus,
      doi: rDoi,
      publishLink: rPublishLink,
      certificate: rCertificate,
      notes: ''
    });
    setRTitle('');
    setRAuthors('');
    setRJournal('');
    setRStatus('writing');
    setRDoi('');
    setRPublishLink('');
    setRCertificate('');
  };
  return (
    <div id="research_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Academic <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Research & Literature</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Log literature studies, monitor paper drafts and academic publications, and track publication pipelines.
        </p>
      </header>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Left Col: Research Papers list */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" /> Research Publications
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-mono font-bold">
                {researchPapers.length} Papers
              </span>
            </div>

            {researchPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchPapers.map((paper) => {
                  const colorMap = {
                    idea: 'bg-gray-100 text-gray-700 border-gray-200',
                    writing: 'bg-purple-100 text-purple-800 border-purple-200',
                    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
                    published: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  };

                  return (
                    <div
                      key={paper.id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left flex flex-col justify-between hover:border-purple-300 hover:bg-white transition-all min-h-[140px]"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-gray-950 leading-relaxed font-sans">{paper.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1.5 font-sans">Authors: {paper.authors || 'Self'}</p>
                          <p className="text-[10px] text-gray-600 mt-1 font-mono font-medium">{paper.journal || 'Target: Unspecified Venue'}</p>
                          
                          {paper.doi && (
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">
                              DOI: <span className="font-semibold text-gray-700">{paper.doi}</span>
                            </p>
                          )}
                          {paper.publishLink && (
                            <div className="mt-1">
                              <a
                                href={paper.publishLink.startsWith('http') ? paper.publishLink : `https://${paper.publishLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-700 font-semibold transition-all"
                              >
                                Published Link <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {paper.certificate && (
                            <p className="text-[10px] text-gray-500 mt-1 font-sans">
                              📜 Certificate: <span className="text-gray-700 font-medium">{paper.certificate}</span>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteResearchPaper(paper.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-2 items-center mt-4 pt-3 border-t border-gray-200/50">
                        <span className={`text-[8.5px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${colorMap[paper.status]}`}>
                          {paper.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                No active academic research draft profiles have been loaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Add Research Paper form */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-purple-600" /> Log Paper Draft
            </h3>
            <form onSubmit={handleCreateResearch} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Paper Title</label>
                <input
                  type="text"
                  placeholder="e.g. LLM Reasoning Paradigms"
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  required
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Co-Authors</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Doe, Prof. Smith"
                  value={rAuthors}
                  onChange={(e) => setRAuthors(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Target Conference/Journal</label>
                <input
                  type="text"
                  placeholder="e.g. NeurIPS 2026, IEEE Trans"
                  value={rJournal}
                  onChange={(e) => setRJournal(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Pipeline Status</label>
                <select
                  value={rStatus}
                  onChange={(e) => setRStatus(e.target.value as ResearchPaper['status'])}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                >
                  <option value="idea">Idea Stage</option>
                  <option value="writing">Writing & Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">DOI Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10.1145/3318464.3389700"
                  value={rDoi}
                  onChange={(e) => setRDoi(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Paper Published Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://dl.acm.org/..."
                  value={rPublishLink}
                  onChange={(e) => setRPublishLink(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-gray-500 font-bold font-mono uppercase">Publication Certificate (e.g. name/URL)</label>
                <input
                  type="text"
                  placeholder="e.g. Certificate of Acceptance"
                  value={rCertificate}
                  onChange={(e) => setRCertificate(e.target.value)}
                  className="bg-white text-xs text-gray-800 p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase font-mono cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Index Draft Log
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
