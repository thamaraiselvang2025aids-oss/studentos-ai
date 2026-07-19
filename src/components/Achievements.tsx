import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Sparkles,
  Award,
  Filter,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';
import Markdown from 'react-markdown';

export default function Achievements() {
  const {
    achievements,
    addAchievement,
    deleteAchievement,
    profile,
    getAIRecommendation
  } = useStudentOS();

  // Achievement Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAwardAmount, setNewAwardAmount] = useState('');
  const [newCategory, setNewCategory] = useState<'competition' | 'academic' | 'leadership' | 'extracurricular'>('competition');

  // Filtering State
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'competition' | 'academic' | 'leadership' | 'extracurricular'>('all');

  // AI Recommender State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim() || !newDate || !newDesc.trim()) return;

    addAchievement({
      title: newTitle.trim(),
      organization: newOrg.trim(),
      date: newDate,
      description: newDesc.trim(),
      awardAmount: newAwardAmount.trim() || undefined,
      category: newCategory
    });

    // Reset Form
    setNewTitle('');
    setNewOrg('');
    setNewDate('');
    setNewDesc('');
    setNewAwardAmount('');
    setNewCategory('competition');
    setShowAddForm(false);
  };

  const handleGenerateAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('achievement_recommender', {
        major: profile.major,
        university: profile.university,
        currentAchievements: achievements.map(a => ({
          title: a.title,
          organization: a.organization,
          category: a.category
        }))
      });
      setAiRecommendations(resp);
    } catch (err) {
      console.error(err);
      setAiRecommendations('Failed to synthesize achievement recommendations from Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryBadgeStyles = (category: string) => {
    switch (category) {
      case 'competition':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'academic':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'leadership':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'extracurricular':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredAchievements = achievements.filter(
    (ach) => categoryFilter === 'all' || ach.category === categoryFilter
  );

  return (
    <div id="achievements_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 animate-bounce" /> Professional <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text">Achievements</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1 font-sans">
            Track and catalog your academic rewards, hackathon victories, campus leadership positions, and scholarship awards.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold font-mono uppercase transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Log Achievement'}
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Main List column (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Collapsible Log Form */}
          {showAddForm && (
            <form onSubmit={handleAddAchievement} className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-4 animate-fade-in text-left">
              <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                <Award className="w-4 h-4 text-amber-500" /> Log New Achievement / Honor
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Achievement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place - TreeHacks 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Granting Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanford University / MLH"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Date of Award *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all h-10"
                  >
                    <option value="competition">Competition / Hackathon</option>
                    <option value="academic">Academic Honor</option>
                    <option value="leadership">Campus Leadership</option>
                    <option value="extracurricular">Extracurricular / Community</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Award Amount / Stipend (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. $5,000 cash grant"
                      value={newAwardAmount}
                      onChange={(e) => setNewAwardAmount(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg pl-9 pr-3 p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Description & Impact *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your role, the core technology/scheme used, and the direct impact of this accomplishment..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs font-mono uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          )}

          {/* Filtering Tabs */}
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-200">
            {(['all', 'competition', 'academic', 'leadership', 'extracurricular'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                  categoryFilter === tab
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'View All' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Achievements Grid List */}
          {filteredAchievements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group text-left relative overflow-hidden"
                >
                  {/* Category Accent Stripe */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    ach.category === 'competition' ? 'bg-amber-500' :
                    ach.category === 'academic' ? 'bg-emerald-500' :
                    ach.category === 'leadership' ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />

                  <div className="pl-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wide rounded border ${getCategoryBadgeStyles(ach.category)}`}>
                          {ach.category === 'competition' ? '🏆 Competition' : ach.category.toUpperCase()}
                        </span>
                        <h3 className="text-base font-bold text-gray-950 mt-2 tracking-tight">{ach.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {ach.organization}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteAchievement(ach.id)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                        title="Delete Achievement Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-700 mt-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100 font-sans leading-relaxed">
                      {ach.description}
                    </p>

                    {/* Footer bar */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Date awarded: {ach.date}
                      </span>

                      {ach.awardAmount && (
                        <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase text-[10px]">
                          Award: {ach.awardAmount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 italic">
              No professional achievements logged in this category. Click the "Log Achievement" button above to get started!
            </div>
          )}
        </div>

        {/* Sidebar & AI Recommendations column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Status index summary */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Activity className="w-4 h-4 text-indigo-600" /> Metrics & Standing
            </h3>

            <div className="flex flex-col gap-3.5 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total Logged Achievements:</span>
                <span className="font-bold text-gray-950 font-mono">{achievements.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Competitions & Wins:</span>
                <span className="font-bold text-amber-600 font-mono">{achievements.filter(a => a.category === 'competition').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Academic Honors:</span>
                <span className="font-bold text-emerald-600 font-mono">{achievements.filter(a => a.category === 'academic').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-gray-150 pt-3">
                <span className="text-gray-700 font-semibold">Active Major Profile:</span>
                <span className="font-bold text-indigo-600">{profile.major || 'Computer Science'}</span>
              </div>
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> AI Goal Planner
              </h3>
              <button
                onClick={handleGenerateAIRecommendations}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg font-bold font-mono uppercase cursor-pointer disabled:opacity-50 transition-all"
              >
                {aiLoading ? 'Analyzing...' : 'Target Goals'}
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Analyze your current logged credentials and major to generate personalized, high-impact career and credential recommendation lists.
            </p>

            {aiRecommendations ? (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed markdown-body">
                <Markdown>{aiRecommendations}</Markdown>
              </div>
            ) : (
              <div className="py-6 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400 italic">
                Click "Target Goals" above to receive tailored goals from the Gemini Advisor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
