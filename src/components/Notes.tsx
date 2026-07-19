import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import ReactMarkdown from 'react-markdown';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Tag,
  Search,
  BookOpen
} from 'lucide-react';

export default function Notes() {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote
  } = useStudentOS();

  // Notes states
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [noteEditMode, setNoteEditMode] = useState<'edit' | 'preview'>('edit');
  const [noteSearch, setNoteSearch] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote = {
      title: 'Untitled Study Memo',
      content: '### New Study Notes\n\nWrite formula guides, checklists, or summaries here...',
      lastModified: new Date().toISOString(),
      tags: ['General']
    };
    addNote(newNote);
  };

  const filteredNotes = notes.filter((n) => {
    const term = noteSearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term) ||
      n.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  return (
    <div id="notes_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Study Memos & <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Lecture Notes</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Draft study cheatsheets, mathematical derivations, lecture summaries, or formulas in Markdown and preview them instantly.
        </p>
      </header>

      {/* Main layout card */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-5">
        {/* Notes Workspace Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Interactive Memos
          </h2>

          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-lg font-bold font-mono uppercase cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Study Memo
          </button>
        </div>

        {/* Side by side layout of notes workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
          {/* Notes List panel */}
          <div className="lg:col-span-1 border-r border-gray-100 pr-4 flex flex-col gap-3 h-full overflow-y-auto text-left">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tags or titles..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg text-xs pl-9 pr-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>

            {filteredNotes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      n.id === activeNoteId || (activeNote && n.id === activeNote.id)
                        ? 'bg-purple-50 border-purple-400 text-purple-950 ring-1 ring-purple-400/30 font-medium'
                        : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    <h4 className="text-xs font-bold truncate text-gray-950 font-sans">{n.title}</h4>
                    <p className="text-[10px] text-gray-500 truncate mt-1 font-sans">{n.content.replace(/[#*`_-]/g, '').slice(0, 60)}</p>
                    <div className="flex gap-1 flex-wrap mt-2.5">
                      {n.tags.map((tag) => (
                        <span key={tag} className="text-[8px] bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-8">No matching notes indexed.</p>
            )}
          </div>

          {/* Note edit / preview area */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full justify-between">
            {activeNote ? (
              <>
                {/* Mode switcher tabs */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setNoteEditMode('edit')}
                      className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 font-mono uppercase font-bold cursor-pointer ${
                        noteEditMode === 'edit'
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'text-gray-500 hover:text-gray-950'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editor
                    </button>
                    <button
                      onClick={() => setNoteEditMode('preview')}
                      className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 font-mono uppercase font-bold cursor-pointer ${
                        noteEditMode === 'preview'
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'text-gray-500 hover:text-gray-950'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Markdown Preview
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newTag = prompt('Enter a new tag:');
                        if (newTag?.trim()) {
                          const updatedTags = Array.from(new Set([...activeNote.tags, newTag.trim()]));
                          updateNote(activeNote.id, { tags: updatedTags });
                        }
                      }}
                      className="text-gray-500 hover:text-purple-600 p-1.5 rounded-lg hover:bg-gray-100 border border-gray-200 bg-white cursor-pointer"
                      title="Add Tag"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(activeNote.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 border border-gray-200 bg-white cursor-pointer"
                      title="Delete Memo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conditional Editor versus Previewer */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {noteEditMode === 'edit' ? (
                    <div className="flex flex-col gap-4 h-full text-left">
                      <input
                        type="text"
                        value={activeNote.title}
                        onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                        className="w-full bg-transparent border-b border-dashed border-gray-200 pb-2 text-md font-bold text-gray-950 focus:outline-none placeholder-gray-400 font-sans"
                        placeholder="Study Memo Title..."
                      />
                      <textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                        className="w-full flex-1 bg-transparent border-none text-xs text-gray-800 font-mono focus:outline-none placeholder-gray-400 resize-none min-h-[300px]"
                        placeholder="Draft your markdown lecture formulas, code snippets, or notes here..."
                      />
                    </div>
                  ) : (
                    <div className="text-left prose prose-sm max-w-none text-xs text-gray-800 font-sans leading-relaxed markdown-body">
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-full text-gray-400 text-sm font-sans">
                <BookOpen className="w-10 h-10 text-gray-300" />
                Select or create a study note memo to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
