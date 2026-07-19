import React from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  GitBranch,
  Wallet,
  Calendar,
  Sparkles,
  Search,
  Bell,
  LogOut,
  Flame,
  User,
  ShieldCheck,
  BookOpen,
  Award,
  Trophy,
  Terminal,
  FileText
} from 'lucide-react';

interface SidebarProps {
  onOpenNotifications: () => void;
}

export default function Sidebar({ onOpenNotifications }: SidebarProps) {
  const {
    signOutUser,
    activeTab,
    setActiveTab,
    profile,
    notifications,
    globalSearchQuery,
    setGlobalSearchQuery,
    sidebarTheme,
    setSidebarTheme,
    customCategories,
    updateCategoryLabel
  } = useStudentOS();

  const [editingCategoryKey, setEditingCategoryKey] = React.useState<'academic' | 'professional' | 'general' | null>(null);
  const [tempCategoryLabel, setTempCategoryLabel] = React.useState('');

  const startEditingCategory = (key: 'academic' | 'professional' | 'general', currentLabel: string) => {
    setEditingCategoryKey(key);
    setTempCategoryLabel(currentLabel);
  };

  const saveCategoryLabel = (key: 'academic' | 'professional' | 'general') => {
    if (tempCategoryLabel.trim()) {
      updateCategoryLabel(key, tempCategoryLabel.trim());
    }
    setEditingCategoryKey(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuGroups = [
    {
      key: 'academic' as const,
      category: customCategories.academic || 'Academic',
      items: [
        { id: 'academic', label: 'Course Registry', icon: GraduationCap },
        { id: 'projects', label: 'Projects & Repos', icon: GitBranch },
        { id: 'research', label: 'Research Papers', icon: BookOpen },
        { id: 'hackathons', label: 'Hackathons', icon: Award }
      ]
    },
    {
      key: 'professional' as const,
      category: customCategories.professional || 'Professional',
      items: [
        { id: 'placement', label: 'Placement Tracker', icon: Briefcase },
        { id: 'labs', label: 'Coding Labs', icon: Terminal },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'certificates', label: 'Certificates', icon: Award }
      ]
    },
    {
      key: 'general' as const,
      category: customCategories.general || 'General',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
        { id: 'notes', label: 'Lecture Memos', icon: FileText },
        { id: 'profile', label: 'Student Profile Settings', icon: User },
        { id: 'ai_assistant', label: 'AI Command Center', icon: Sparkles }
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen bg-[#0F0F12] border-r border-[#27272A] flex flex-col justify-between shrink-0 select-none text-gray-300 font-sans z-30">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Compact ERP Header */}
        <div className="p-4 border-b border-[#27272A] bg-[#141417]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-white tracking-wider font-mono">
                STUDENT-OS <span className="text-[10px] text-indigo-400 font-bold font-sans">v4.2</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Admin Management Console</p>
            </div>
          </div>
        </div>

        {/* Search Input widget */}
        <div className="p-3 border-b border-[#27272A] bg-[#141417]/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search registry index..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full bg-[#1C1C1F] text-xs text-gray-200 pl-8 pr-3 py-1.5 rounded border border-[#27272A] focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Theme Customization Bar */}
        <div className="px-3 py-2 border-b border-[#27272A] bg-[#141417]/20 flex items-center justify-between">
          <span className="text-[9px] text-gray-500 font-mono tracking-wider font-bold">THEME ACCENT:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSidebarTheme('violet')}
              className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all border ${
                sidebarTheme === 'violet'
                  ? 'bg-violet-950/60 text-violet-300 border-violet-500'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              } cursor-pointer`}
            >
              VIOLET
            </button>
            <button
              onClick={() => setSidebarTheme('brown')}
              className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all border ${
                sidebarTheme === 'brown'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-600'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              } cursor-pointer`}
            >
              BROWN
            </button>
            <button
              onClick={() => setSidebarTheme('default')}
              className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all border ${
                sidebarTheme === 'default'
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              } cursor-pointer`}
            >
              CLASSIC
            </button>
          </div>
        </div>

        {/* Grouped Category Menus */}
        <div className="flex-1 p-3 flex flex-col gap-5 mt-2">
          {menuGroups.map((group) => {
            const isEditing = editingCategoryKey === group.key;
            
            let headerStyle = "text-gray-400 bg-[#1C1C1F] border-l-2 border-indigo-500/50 py-1.5 px-2 rounded";
            let activeItemStyle = "bg-[#1D1D21] text-white border-l-2 border-indigo-500 font-semibold";
            let activeIconStyle = "text-indigo-400";
            
            if (sidebarTheme === 'violet') {
              headerStyle = "text-violet-200 bg-violet-950/60 border-l-2 border-violet-500 py-1.5 px-2.5 rounded";
              activeItemStyle = "bg-violet-950/30 text-violet-200 border-l-2 border-violet-500 font-semibold";
              activeIconStyle = "text-violet-400";
            } else if (sidebarTheme === 'brown') {
              headerStyle = "text-amber-200 bg-amber-950/50 border-l-2 border-amber-600 py-1.5 px-2.5 rounded";
              activeItemStyle = "bg-amber-950/30 text-amber-200 border-l-2 border-amber-600 font-semibold";
              activeIconStyle = "text-amber-500";
            }

            return (
              <div key={group.key} className="flex flex-col gap-1.5 text-left">
                {isEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-0.5 bg-[#141417] rounded border border-[#27272A]">
                    <input
                      type="text"
                      value={tempCategoryLabel}
                      onChange={(e) => setTempCategoryLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCategoryLabel(group.key);
                        if (e.key === 'Escape') setEditingCategoryKey(null);
                      }}
                      className="w-full bg-transparent text-xs text-white px-2 py-0.5 focus:outline-none font-sans font-medium"
                      autoFocus
                    />
                    <button
                      onClick={() => saveCategoryLabel(group.key)}
                      className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all cursor-pointer text-[10px] font-bold shrink-0"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingCategoryKey(null)}
                      className="p-1 rounded text-red-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer text-[10px] font-bold shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between ${headerStyle}`}>
                    <span className="text-[9.5px] font-bold tracking-wider font-mono uppercase">
                      {group.category}
                    </span>
                    <button
                      onClick={() => startEditingCategory(group.key, group.category)}
                      className="text-[8.5px] text-gray-500 hover:text-white px-1 rounded hover:bg-white/5 font-mono cursor-pointer transition-all"
                      title="Edit Category Title"
                    >
                      EDIT
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-xs transition-all cursor-pointer font-sans ${
                          isActive ? activeItemStyle : 'text-gray-400 hover:bg-[#141417] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? activeIconStyle : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.id === 'ai_assistant' && (
                          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${sidebarTheme === 'violet' ? 'bg-violet-400' : sidebarTheme === 'brown' ? 'bg-amber-500' : 'bg-indigo-400'}`}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Session status */}
      <div className="border-t border-[#27272A] p-3 bg-[#141417] flex flex-col gap-2">
        {/* User profile action block */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 text-left min-w-0">
            <div className="w-7 h-7 rounded bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs font-mono shrink-0">
              {profile.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">{profile.fullName}</p>
              <p className="text-[9px] text-gray-500 font-mono uppercase truncate mt-0.5 max-w-[100px]">{profile.major}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenNotifications}
              className="p-1.5 rounded bg-[#1C1C1F] border border-[#27272A] text-gray-400 hover:text-white hover:bg-[#27272A] relative cursor-pointer"
              title="Open System logs"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={signOutUser}
              title="Secure Logout"
              className="p-1.5 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
