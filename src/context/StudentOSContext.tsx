import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  Assignment,
  Semester,
  Hackathon,
  CodingProfile,
  InternshipApplication,
  Project,
  ResearchPaper,
  Certificate,
  Achievement,
  FinanceTransaction,
  Goal,
  CalendarEvent,
  Note,
  StudentProfile,
  NotificationItem,
  PriorityType
} from '../types';
import { firebaseAuth, AuthUser } from '../lib/firebase';

// Custom hook to manage user-scoped state synced with localStorage
function useUserScopedState<T>(key: string, initial: T, authUser: AuthUser | null) {
  const getStoredForUser = (userVal: AuthUser | null): T => {
    if (!userVal) return initial;
    const value = localStorage.getItem(`student_os_${userVal.uid}_${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return initial;
      }
    }
    if (key === 'profile') {
      return {
        uid: userVal.uid,
        fullName: userVal.displayName || '',
        email: userVal.email || '',
        university: '',
        major: '',
        graduationYear: new Date().getFullYear() + 4,
        streakCount: 1,
        lastActive: new Date().toISOString()
      } as unknown as T;
    }
    return initial;
  };

  const [state, setStateInternal] = useState<T>(() => getStoredForUser(authUser));

  useEffect(() => {
    setStateInternal(getStoredForUser(authUser));
  }, [authUser, key]);

  const setState = (value: T | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      const next = typeof value === 'function' ? (value as Function)(prev) : value;
      if (authUser) {
        localStorage.setItem(`student_os_${authUser.uid}_${key}`, JSON.stringify(next));
      }
      return next;
    });
  };

  return [state, setState] as const;
}

interface StudentOSContextType {
  authUser: AuthUser | null;
  authLoading: boolean;
  signOutUser: () => Promise<void>;
  profile: StudentProfile;
  semesters: Semester[];
  courses: Course[];
  assignments: Assignment[];
  hackathons: Hackathon[];
  codingProfiles: CodingProfile[];
  applications: InternshipApplication[];
  projects: Project[];
  researchPapers: ResearchPaper[];
  certificates: Certificate[];
  achievements: Achievement[];
  transactions: FinanceTransaction[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  notes: Note[];
  notifications: NotificationItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  sidebarTheme: string;
  setSidebarTheme: (theme: string) => void;
  customCategories: { academic: string; professional: string; general: string; };
  updateCategoryLabel: (key: 'academic' | 'professional' | 'general', label: string) => void;

  // AI Assistant Integrations
  aiLoading: boolean;
  getAIRecommendation: (feature: string, payload: any) => Promise<string>;

  // CRUD Operators
  updateProfile: (profile: Partial<StudentProfile>) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  updateSemester: (id: string, sem: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  addHackathon: (hack: Omit<Hackathon, 'id'>) => void;
  updateHackathon: (id: string, hack: Partial<Hackathon>) => void;
  deleteHackathon: (id: string) => void;
  addCodingProfile: (cp: Omit<CodingProfile, 'id'>) => void;
  updateCodingProfile: (id: string, cp: Partial<CodingProfile>) => void;
  deleteCodingProfile: (id: string) => void;
  addApplication: (app: Omit<InternshipApplication, 'id'>) => void;
  updateApplication: (id: string, app: Partial<InternshipApplication>) => void;
  deleteApplication: (id: string) => void;
  addProject: (proj: Omit<Project, 'id'>) => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addResearchPaper: (paper: Omit<ResearchPaper, 'id'>) => void;
  updateResearchPaper: (id: string, paper: Partial<ResearchPaper>) => void;
  deleteResearchPaper: (id: string) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, cert: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  addAchievement: (ach: Omit<Achievement, 'id'>) => void;
  updateAchievement: (id: string, ach: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;
  addTransaction: (trans: Omit<FinanceTransaction, 'id'>) => void;
  updateTransaction: (id: string, trans: Partial<FinanceTransaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const StudentOSContext = createContext<StudentOSContextType | undefined>(undefined);

export function StudentOSProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => firebaseAuth.getCurrentUser());
  const [authLoading, setAuthLoading] = useState<boolean>(!firebaseAuth.isInitialized());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setAuthUser(user);
      setAuthLoading(!firebaseAuth.isInitialized());
    });
    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await firebaseAuth.signOut();
  };

  // State Declarations backed by user-scoped hook
  const [profile, setProfile] = useUserScopedState<StudentProfile>('profile', {
    uid: '',
    fullName: '',
    email: '',
    university: '',
    major: '',
    graduationYear: new Date().getFullYear() + 4,
    streakCount: 0,
    lastActive: ''
  }, authUser);

  const [semesters, setSemesters] = useUserScopedState<Semester[]>('semesters', [], authUser);
  const [courses, setCourses] = useUserScopedState<Course[]>('courses', [], authUser);
  const [assignments, setAssignments] = useUserScopedState<Assignment[]>('assignments', [], authUser);
  const [hackathons, setHackathons] = useUserScopedState<Hackathon[]>('hackathons', [], authUser);
  const [codingProfiles, setCodingProfiles] = useUserScopedState<CodingProfile[]>('codingProfiles', [], authUser);
  const [applications, setApplications] = useUserScopedState<InternshipApplication[]>('applications', [], authUser);
  const [projects, setProjects] = useUserScopedState<Project[]>('projects', [], authUser);
  const [researchPapers, setResearchPapers] = useUserScopedState<ResearchPaper[]>('researchPapers', [], authUser);
  const [certificates, setCertificates] = useUserScopedState<Certificate[]>('certificates', [], authUser);
  const [achievements, setAchievements] = useUserScopedState<Achievement[]>('achievements', [], authUser);
  const [transactions, setTransactions] = useUserScopedState<FinanceTransaction[]>('transactions', [], authUser);
  const [goals, setGoals] = useUserScopedState<Goal[]>('goals', [], authUser);
  const [calendarEvents, setCalendarEvents] = useUserScopedState<CalendarEvent[]>('calendarEvents', [], authUser);
  const [notes, setNotes] = useUserScopedState<Note[]>('notes', [], authUser);
  const [notifications, setNotifications] = useUserScopedState<NotificationItem[]>('notifications', [], authUser);

  const [sidebarTheme, setSidebarTheme] = useUserScopedState<string>('sidebarTheme', 'violet', authUser);
  const [customCategories, setCustomCategories] = useUserScopedState<{ academic: string; professional: string; general: string; }>('customCategories', { academic: 'Academic', professional: 'Professional', general: 'General' }, authUser);

  const updateCategoryLabel = (key: 'academic' | 'professional' | 'general', label: string) => {
    setCustomCategories(prev => ({ ...prev, [key]: label }));
  };



  // Periodic Deadline Watcher (Simulates the custom deadline reminder scheduler)
  useEffect(() => {
    const checkDeadlines = () => {
      const now = Date.now();
      assignments.forEach((assignment) => {
        if (assignment.status === 'completed') return;

        const dueTime = new Date(assignment.dueDate).getTime();
        const diffMs = dueTime - now;
        const diffHrs = diffMs / (1000 * 60 * 60);

        // Notify 3 days before
        if (diffHrs > 70 && diffHrs < 73) {
          triggerDeadlineNotification(assignment, '3 days remaining');
        }
        // Notify 1 day before
        else if (diffHrs > 22 && diffHrs < 25) {
          triggerDeadlineNotification(assignment, '1 day remaining (CRITICAL)');
        }
        // Notify 2 hours before
        else if (diffHrs > 1.8 && diffHrs < 2.2) {
          triggerDeadlineNotification(assignment, '2 hours left - submit now!');
        }
      });
    };

    const interval = setInterval(checkDeadlines, 60000 * 10); // Check every 10 min
    return () => clearInterval(interval);
  }, [assignments]);

  const triggerDeadlineNotification = (assignment: Assignment, contextStr: string) => {
    const exists = notifications.some(
      (n) => n.title.includes(assignment.title) && n.message.includes(contextStr)
    );
    if (!exists) {
      addNotification({
        title: `🚨 Deadline Warning: ${assignment.title}`,
        message: `Task is due soon. Status: ${contextStr}. Complete current action points immediately.`,
        read: false,
        type: 'deadline',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Profile
  const updateProfile = (p: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...p }));
  };

  // Semesters
  const addSemester = (sem: Omit<Semester, 'id'>) => {
    const newSem: Semester = { ...sem, id: `sem_${Date.now()}` };
    setSemesters((prev) => [...prev, newSem]);
  };
  const updateSemester = (id: string, sem: Partial<Semester>) => {
    setSemesters((prev) => prev.map((item) => (item.id === id ? { ...item, ...sem } : item)));
  };
  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((item) => item.id !== id));
  };

  // Courses
  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: `c_${Date.now()}` };
    setCourses((prev) => [...prev, newCourse]);
    // Auto-create calendar events for this class
    addCalendarEvent({
      title: `Class Session: ${course.code}`,
      start: new Date().toISOString().split('T')[0] + 'T09:00:00',
      end: new Date().toISOString().split('T')[0] + 'T10:30:00',
      type: 'class',
      courseId: newCourse.id,
      description: `Instructor: ${course.instructor}`
    });
  };
  const updateCourse = (id: string, course: Partial<Course>) => {
    setCourses((prev) => prev.map((item) => (item.id === id ? { ...item, ...course } : item)));
  };
  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((item) => item.id !== id));
    setAssignments((prev) => prev.filter((item) => item.courseId !== id));
  };

  // Assignments
  const addAssignment = (assign: Omit<Assignment, 'id'>) => {
    const newAssign: Assignment = { ...assign, id: `a_${Date.now()}` };
    setAssignments((prev) => [...prev, newAssign]);
    // Create Calendar Event
    addCalendarEvent({
      title: `❗ Due: ${assign.title}`,
      start: assign.dueDate + 'T23:59:00',
      end: assign.dueDate + 'T23:59:59',
      type: 'assignment',
      courseId: assign.courseId,
      description: 'System synchronized deadline calendar marker.'
    });
  };
  const updateAssignment = (id: string, assign: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((item) => (item.id === id ? { ...item, ...assign } : item)));
  };
  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  // Hackathons
  const addHackathon = (hack: Omit<Hackathon, 'id'>) => {
    const newHack: Hackathon = { ...hack, id: `h_${Date.now()}` };
    setHackathons((prev) => [...prev, newHack]);
  };
  const updateHackathon = (id: string, hack: Partial<Hackathon>) => {
    setHackathons((prev) => prev.map((item) => (item.id === id ? { ...item, ...hack } : item)));
  };
  const deleteHackathon = (id: string) => {
    setHackathons((prev) => prev.filter((item) => item.id !== id));
  };

  // Coding Profiles
  const addCodingProfile = (cp: Omit<CodingProfile, 'id'>) => {
    const newCp: CodingProfile = { ...cp, id: `cp_${Date.now()}` };
    setCodingProfiles((prev) => [...prev, newCp]);
  };
  const updateCodingProfile = (id: string, cp: Partial<CodingProfile>) => {
    setCodingProfiles((prev) => prev.map((item) => (item.id === id ? { ...item, ...cp } : item)));
  };
  const deleteCodingProfile = (id: string) => {
    setCodingProfiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Applications
  const addApplication = (app: Omit<InternshipApplication, 'id'>) => {
    const newApp: InternshipApplication = { ...app, id: `app_${Date.now()}` };
    setApplications((prev) => [...prev, newApp]);
  };
  const updateApplication = (id: string, app: Partial<InternshipApplication>) => {
    setApplications((prev) => prev.map((item) => (item.id === id ? { ...item, ...app } : item)));
  };
  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
  };

  // Projects
  const addProject = (proj: Omit<Project, 'id'>) => {
    const newProj: Project = { ...proj, id: `p_${Date.now()}` };
    setProjects((prev) => [...prev, newProj]);
  };
  const updateProject = (id: string, proj: Partial<Project>) => {
    setProjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...proj } : item)));
  };
  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((item) => item.id !== id));
  };

  // Research
  const addResearchPaper = (paper: Omit<ResearchPaper, 'id'>) => {
    const newPaper: ResearchPaper = { ...paper, id: `rp_${Date.now()}` };
    setResearchPapers((prev) => [...prev, newPaper]);
  };
  const updateResearchPaper = (id: string, paper: Partial<ResearchPaper>) => {
    setResearchPapers((prev) => prev.map((item) => (item.id === id ? { ...item, ...paper } : item)));
  };
  const deleteResearchPaper = (id: string) => {
    setResearchPapers((prev) => prev.filter((item) => item.id !== id));
  };

  // Certificates
  const addCertificate = (cert: Omit<Certificate, 'id'>) => {
    const newCert: Certificate = { ...cert, id: `cert_${Date.now()}` };
    setCertificates((prev) => [...prev, newCert]);
  };
  const updateCertificate = (id: string, cert: Partial<Certificate>) => {
    setCertificates((prev) => prev.map((item) => (item.id === id ? { ...item, ...cert } : item)));
  };
  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((item) => item.id !== id));
  };

  // Achievements
  const addAchievement = (ach: Omit<Achievement, 'id'>) => {
    const newAch: Achievement = { ...ach, id: `ach_${Date.now()}` };
    setAchievements((prev) => [...prev, newAch]);
  };
  const updateAchievement = (id: string, ach: Partial<Achievement>) => {
    setAchievements((prev) => prev.map((item) => (item.id === id ? { ...item, ...ach } : item)));
  };
  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((item) => item.id !== id));
  };

  // Finances
  const addTransaction = (trans: Omit<FinanceTransaction, 'id'>) => {
    const newTrans: FinanceTransaction = { ...trans, id: `f_${Date.now()}` };
    setTransactions((prev) => [...prev, newTrans]);
  };
  const updateTransaction = (id: string, trans: Partial<FinanceTransaction>) => {
    setTransactions((prev) => prev.map((item) => (item.id === id ? { ...item, ...trans } : item)));
  };
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Goals
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goal, id: `g_${Date.now()}` };
    setGoals((prev) => [...prev, newGoal]);
  };
  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...goal } : item)));
  };
  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
  };

  // Calendar
  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = { ...ev, id: `e_${Date.now()}` };
    setCalendarEvents((prev) => [...prev, newEv]);
  };
  const updateCalendarEvent = (id: string, ev: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => prev.map((item) => (item.id === id ? { ...item, ...ev } : item)));
  };
  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((item) => item.id !== id));
  };

  // Notes
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote: Note = { ...note, id: `n_${Date.now()}` };
    setNotes((prev) => [...prev, newNote]);
  };
  const updateNote = (id: string, note: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...note, lastModified: new Date().toISOString() } : item))
    );
  };
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
  };

  // Notifications
  const addNotification = (notif: Omit<NotificationItem, 'id'>) => {
    const newNotif: NotificationItem = { ...notif, id: `nt_${Date.now()}` };
    setNotifications((prev) => [newNotif, ...prev]);
  };
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // AI assistant dispatcher
  const getAIRecommendation = async (feature: string, customPayload: any): Promise<string> => {
    setAiLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authUser) {
        headers['x-user-id'] = authUser.uid;
      }
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ feature, payload: customPayload }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      const data = await response.json();
      return data.result || 'Failed to parse recommendation.';
    } catch (err: any) {
      console.error('AI request failure:', err);
      return `Error generating recommendations: ${err.message || err}`;
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <StudentOSContext.Provider
      value={{
        authUser,
        authLoading,
        signOutUser,
        profile,
        semesters,
        courses,
        assignments,
        hackathons,
        codingProfiles,
        applications,
        projects,
        researchPapers,
        certificates,
        achievements,
        transactions,
        goals,
        calendarEvents,
        notes,
        notifications,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        sidebarTheme,
        setSidebarTheme,
        customCategories,
        updateCategoryLabel,

        aiLoading,
        getAIRecommendation,

        updateProfile,
        addCourse,
        updateCourse,
        deleteCourse,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addSemester,
        updateSemester,
        deleteSemester,
        addHackathon,
        updateHackathon,
        deleteHackathon,
        addCodingProfile,
        updateCodingProfile,
        deleteCodingProfile,
        addApplication,
        updateApplication,
        deleteApplication,
        addProject,
        updateProject,
        deleteProject,
        addResearchPaper,
        updateResearchPaper,
        deleteResearchPaper,
        addCertificate,
        updateCertificate,
        deleteCertificate,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addNote,
        updateNote,
        deleteNote,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </StudentOSContext.Provider>
  );
}

export function useStudentOS() {
  const context = useContext(StudentOSContext);
  if (context === undefined) {
    throw new Error('useStudentOS must be used within a StudentOSProvider');
  }
  return context;
}
