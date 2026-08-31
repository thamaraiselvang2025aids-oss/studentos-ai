import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Sparkles,
  Send,
  Terminal,
  FileText,
  Bookmark,
  Award,
  Layers,
  Clock,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIAssistant() {
  const { getAIRecommendation, aiLoading } = useStudentOS();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_m',
      sender: 'assistant',
      text: 'Hi there! I am your dedicated StudentOS AI Assistant. I can deconstruct algorithms, critique resume metrics, draft mock behavioral templates, or compile week-by-week study sprints. Select a quick action template below or type your prompt!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');

  const quickTemplates = [
    { label: 'Formulate Study Plan', topic: 'Assemble an intensive 4-week study plan for an Advanced Algorithms final focusing on dynamic programming and NP-complete graph reductions.' },
    { label: 'Analyze Resume points', topic: 'Audit my SWE internship resume bullet points: "Assisted in writing API route handlers with Express, decreased database fetch times, helped team migrate static UI elements."' },
    { label: 'Google Coding Coach', topic: 'Critique my JavaScript BFS implementation for graph shortest path, explain time-space complexities, and give optimization pointers.' },
    { label: 'Formulate Placement Roadmap', topic: 'Generate a step-by-step 8-week placement prep timeline targeting backend roles at high-performance companies like Google and Stripe.' }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || aiLoading) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');

    try {
      // Execute proxy call
      const response = await getAIRecommendation('chat_assistant', { query: textToSend });
      const assistantMessage: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error processing request: ${err.message || err}. Please check backend logs.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-8 text-[var(--text-secondary)] flex flex-col justify-between h-[85vh] scroll-smooth theme-transition">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight font-sans">
          StudentOS <span className="bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">AI Copilot</span>
        </h1>
        <p className="text-sm text-[var(--text-dimmed)] mt-1 font-sans">
          Get real-time, context-grounded study recommendations, algorithmic walkthroughs, and technical critique reports.
        </p>
      </header>

      {/* Conversations log */}
      <div className="flex-1 bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-y-auto flex flex-col gap-4 mb-6 pr-2">
        {messages.map((m) => {
          const isAssistant = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] ${isAssistant ? 'self-start text-left' : 'self-end text-right'}`}
            >
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                  isAssistant
                    ? 'bg-purple-950/20 border border-purple-500/10 text-[var(--text-secondary)]'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[9px] text-[var(--text-dimmed)] mt-1.5 px-1 font-mono uppercase">{m.timestamp}</span>
            </div>
          );
        })}

        {aiLoading && (
          <div className="self-start text-left max-w-[80%] flex flex-col">
            <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-500/10 text-[var(--text-muted)] text-xs font-sans flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Gemini is reasoning and writing code skeleton recommendations...
            </div>
          </div>
        )}
      </div>

      {/* Templates Row */}
      <div className="mb-4">
        <span className="text-[10px] text-[var(--text-dimmed)] font-bold uppercase font-mono tracking-wider block mb-2 text-left">Quick Query Templates</span>
        <div className="flex flex-wrap gap-2 justify-start">
          {quickTemplates.map((t) => (
            <button
              key={t.label}
              onClick={() => handleSendMessage(t.topic)}
              disabled={aiLoading}
              className="text-[11px] bg-[var(--border-subtle)] border border-[var(--border-primary)] hover:border-purple-500/40 hover:bg-purple-500/10 text-[var(--text-muted)] font-semibold px-3 py-2 rounded-xl cursor-pointer transition-all disabled:opacity-50 font-sans"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Send Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputVal);
        }}
        className="flex gap-2 relative"
      >
        <input
          type="text"
          placeholder="Ask anything (e.g. solve Dijkstra, audit resume bullet points...)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={aiLoading}
          className="w-full bg-[var(--bg-input)] text-sm text-[var(--text-secondary)] px-5 py-4 rounded-xl border border-[var(--border-primary)] focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-sans pr-14"
        />

        <button
          type="submit"
          disabled={aiLoading}
          className="absolute right-2 top-2 p-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
