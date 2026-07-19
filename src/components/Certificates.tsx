import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Award,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Sparkles,
  ExternalLink,
  Filter,
  CheckCircle2,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import Markdown from 'react-markdown';

export default function Certificates() {
  const {
    certificates,
    addCertificate,
    deleteCertificate,
    profile,
    getAIRecommendation
  } = useStudentOS();

  // Certificate Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState<'academic' | 'technical' | 'soft_skills' | 'extracurricular'>('technical');
  const [newUrl, setNewUrl] = useState('');

  // Filtering State
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'academic' | 'technical' | 'soft_skills' | 'extracurricular'>('all');

  // AI Recommender State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIssuer.trim() || !newDate) return;

    addCertificate({
      title: newTitle.trim(),
      issuer: newIssuer.trim(),
      issueDate: newDate,
      category: newCategory,
      credentialUrl: newUrl.trim() || undefined
    });

    // Reset Form
    setNewTitle('');
    setNewIssuer('');
    setNewDate('');
    setNewCategory('technical');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleGenerateAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const resp = await getAIRecommendation('achievement_recommender', {
        major: profile.major,
        university: profile.university,
        currentAchievements: certificates.map(c => ({
          title: c.title,
          issuer: c.issuer,
          category: c.category
        }))
      });
      setAiRecommendations(resp);
    } catch (err) {
      console.error(err);
      setAiRecommendations('Failed to synthesize professional certification suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'technical':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'soft_skills':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'extracurricular':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const formatCategoryLabel = (cat: string) => {
    return cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredCertificates = certificates.filter(
    (cert) => categoryFilter === 'all' || cert.category === categoryFilter
  );

  return (
    <div id="certificates_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" /> Verifiable <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">Certificates</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1 font-sans">
            Manage your industry certifications, digital licensing credentials, and verified educational badges.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold font-mono uppercase transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Register Certificate'}
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Main List Column (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Collapsible Log Form */}
          {showAddForm && (
            <form onSubmit={handleAddCertificate} className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-4 animate-fade-in text-left">
              <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Register Verifiable Certification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Certified Solutions Architect - Associate"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Issuing Institution *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services (AWS)"
                    value={newIssuer}
                    onChange={(e) => setNewIssuer(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all h-10"
                  >
                    <option value="technical">Technical License</option>
                    <option value="academic">Academic Certificate</option>
                    <option value="soft_skills">Soft Skills Accreditation</option>
                    <option value="extracurricular">Extracurricular / Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-bold font-mono text-gray-500 uppercase">Verification URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.credly.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs font-mono uppercase rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-200">
            {(['all', 'academic', 'technical', 'soft_skills', 'extracurricular'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                  categoryFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'View All' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Certificates Grid List */}
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group relative text-left"
                >
                  <div>
                    {/* Top bar with badge and delete */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wide rounded-md border ${getCategoryStyles(cert.category)}`}>
                        {formatCategoryLabel(cert.category)}
                      </span>
                      <button
                        onClick={() => deleteCertificate(cert.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete Certificate Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-gray-950 leading-snug tracking-tight">{cert.title}</h4>
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 font-sans">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {cert.issuer}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {cert.issueDate}
                    </span>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider text-[10px] bg-indigo-50 px-2 py-1 rounded"
                      >
                        Verify Credential <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 italic">
              No verifiable certificates registered in this category. Click "Register Certificate" to get started!
            </div>
          )}
        </div>

        {/* Sidebar and AI certification recommendations */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Certificate statistics index summary */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Credentials Index
            </h3>

            <div className="flex flex-col gap-3.5 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total Registered Credentials:</span>
                <span className="font-bold text-gray-950 font-mono">{certificates.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Technical Licenses:</span>
                <span className="font-bold text-violet-600 font-mono">{certificates.filter(c => c.category === 'technical').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Academic Certifications:</span>
                <span className="font-bold text-emerald-600 font-mono">{certificates.filter(c => c.category === 'academic').length}</span>
              </div>
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> AI Credentials Advisor
              </h3>
              <button
                onClick={handleGenerateAIRecommendations}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg font-bold font-mono uppercase cursor-pointer disabled:opacity-50 transition-all"
              >
                {aiLoading ? 'Analyzing...' : 'Recommend'}
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Let the Gemini career counselor analyze your field of study to suggest industry-standard certifications (AWS, GCP, Scrum, etc.) to target.
            </p>

            {aiRecommendations ? (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed markdown-body">
                <Markdown>{aiRecommendations}</Markdown>
              </div>
            ) : (
              <div className="py-6 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400 italic">
                Click "Recommend" above to synthesize high-value credential suggestions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
