import React, { useState } from 'react';
import { StudentOSProvider, useStudentOS } from './context/StudentOSContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Academic from './components/Academic';
import Projects from './components/Projects';
import Research from './components/Research';
import Hackathons from './components/Hackathons';
import Placement from './components/Placement';
import Labs from './components/Labs';
import Calendar from './components/Calendar';
import Notes from './components/Notes';
import Profile from './components/Profile';
import Achievements from './components/Achievements';
import Certificates from './components/Certificates';
import AIAssistant from './components/AIAssistant';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';

function AppContent() {
  const { authUser, authLoading, activeTab, notifications, markNotificationRead, clearAllNotifications } = useStudentOS();
  const [showNotifications, setShowNotifications] = useState(false);

  // Active subview map router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'academic':
        return <Academic />;
      case 'projects':
        return <Projects />;
      case 'research':
        return <Research />;
      case 'hackathons':
        return <Hackathons />;
      case 'placement':
        return <Placement />;
      case 'labs':
        return <Labs />;
      case 'calendar':
        return <Calendar />;
      case 'notes':
        return <Notes />;
      case 'profile':
        return <Profile />;
      case 'achievements':
        return <Achievements />;
      case 'certificates':
        return <Certificates />;
      case 'ai_assistant':
        return <AIAssistant />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!authUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex w-screen h-screen bg-[#08090c] overflow-hidden select-none relative">
      {/* Sidebar navigation */}
      <Sidebar onOpenNotifications={() => setShowNotifications(true)} />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {renderActiveView()}
      </main>

      {/* Floating Notifications Drawer overlay (glassmorphic slideout) */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-[#000]/60 backdrop-blur-sm flex justify-end">
          <div className="w-96 h-full bg-[#0d0e12]/95 border-l border-white/5 backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between animate-slide-in relative">
            <button
              onClick={() => setShowNotifications(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logs List */}
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mt-2">
                <h3 className="text-md font-bold text-white flex items-center gap-1.5 font-sans">
                  <Bell className="w-5 h-5 text-purple-400" /> Notifications Board
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-purple-400 font-bold uppercase hover:text-purple-300 font-mono cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3.5 mt-2 text-left">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const isWarning = n.type === 'warning';
                    return (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border relative transition-all ${
                          n.read
                            ? 'bg-white/[0.01] border-white/5 opacity-60'
                            : isWarning
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-purple-500/5 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                          ) : (
                            <Flame className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          )}

                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug font-sans">{n.message}</p>
                            <span className="text-[8px] text-gray-500 font-mono block mt-2 uppercase">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {!n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-gray-600" />
                    All logs clear. Outstanding notifications list is empty!
                  </div>
                )}
              </div>
            </div>

            {/* Footer notice */}
            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">StudentOS AI Security hardened Ruleset</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StudentOSProvider>
      <AppContent />
    </StudentOSProvider>
  );
}
