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

// Initial Mock Datasets to deliver a high-fidelity visual experience out of the box
const initialProfile: StudentProfile = {
  uid: 'guest_user_123',
  fullName: 'Alex Mercer',
  email: 'alex.mercer@university.edu',
  university: 'Stanford University',
  major: 'Computer Science',
  graduationYear: 2027,
  streakCount: 5,
  lastActive: new Date().toISOString()
};

const initialSemesters: Semester[] = [
  { id: 'sem_1', title: 'Fall 2026 (Current)', targetGPA: 3.9, currentGPA: 3.82 }
];

const initialCourses: Course[] = [
  { id: 'c_1', code: 'CS 301', name: 'Advanced Algorithms', instructor: 'Prof. Cormen', credits: 4, semesterId: 'sem_1', attendancePresent: 18, attendanceAbsent: 2 },
  { id: 'c_2', code: 'MATH 201', name: 'Discrete Mathematics', instructor: 'Dr. Euler', credits: 3, semesterId: 'sem_1', attendancePresent: 15, attendanceAbsent: 1 },
  { id: 'c_3', code: 'CS 380', name: 'Database Systems', instructor: 'Dr. Codd', credits: 4, semesterId: 'sem_1', attendancePresent: 14, attendanceAbsent: 4 }
];

const initialAssignments: Assignment[] = [
  { id: 'a_1', title: 'Red-Black Tree Optimization Lab', courseId: 'c_1', dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], priority: 'high', status: 'pending', notes: 'Implement deletion and self-balancing verification modules.' },
  { id: 'a_2', title: 'Graph Isomorphism Theorem Sheet', courseId: 'c_2', dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], priority: 'medium', status: 'pending', notes: 'Work through questions 1-5 regarding isomorphic matrices.' },
  { id: 'a_3', title: 'SQL Tuning & Query Plan Analysis', courseId: 'c_3', dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], priority: 'low', status: 'completed', notes: 'Benchmark nested queries versus hash index setups.' }
];

const initialHackathons: Hackathon[] = [
  {
    id: 'h_1',
    name: 'Global AI Innovation Hack',
    date: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    teamSize: 3,
    rolesRequired: ['UI/UX Designer', 'FastAPI Developer'],
    ideas: ['AI-driven flashcard synthesizers', 'Collaborative interactive canvas graphs'],
    milestones: [
      { id: 'm_1', title: 'Form core team and draft UI wireframes', completed: true },
      { id: 'm_2', title: 'Implement Gemini model grounding and test prompts', completed: false },
      { id: 'm_3', title: 'Record 2-minute video pitch', completed: false }
    ],
    status: 'registered',
    notes: 'Primary focus: Student learning acceleration.'
  }
];

const initialCodingProfiles: CodingProfile[] = [
  { id: 'cp_1', platform: 'LeetCode', username: 'alex_mercer', solvedCount: 142, easyCount: 60, mediumCount: 65, hardCount: 17, rating: 1850, lastUpdated: new Date().toISOString() },
  { id: 'cp_2', platform: 'GitHub', username: 'alexmercer-dev', solvedCount: 418, lastUpdated: new Date().toISOString() }
];

const initialApplications: InternshipApplication[] = [
  { id: 'app_1', company: 'Google', role: 'SWE Intern', status: 'interview', appliedDate: '2026-06-15', nextDeadline: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], salary: '$45/hr', notes: 'Technical round focusing on system performance and graphs.' },
  { id: 'app_2', company: 'Stripe', role: 'Frontend Engineer Intern', status: 'online_test', appliedDate: '2026-07-01', nextDeadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], salary: '$50/hr', notes: 'Highly focused on component engineering and standard layouts.' }
];

const initialProjects: Project[] = [
  {
    id: 'p_1',
    title: 'EduSphere AI Graph Parser',
    description: 'A tool that parses slides into visual interactive node graphs using vector similarity searches.',
    techStack: ['React', 'Tailwind CSS', 'Vite', 'Express', 'Gemini'],
    repoUrl: 'https://github.com/alexmercer/edusphere-graph',
    liveUrl: 'https://edusphere-demo.dev',
    tasks: [
      { id: 'pt_1', title: 'Build interactive canvas coordinate mapper', completed: true },
      { id: 'pt_2', title: 'Connect server-side Gemini summary parser', completed: false }
    ],
    status: 'in_progress'
  }
];

const initialResearchPapers: ResearchPaper[] = [
  { id: 'rp_1', title: 'Vector Quantized Contrastive Learning in Adaptive Tutoring Systems', authors: 'Alex Mercer, Prof. Sarah Jenkins', journal: 'IEEE Transactions on Learning Technologies', status: 'writing', notes: 'Drafting section 4 regarding hyperparameter tuning results.' }
];

const initialCertificates: Certificate[] = [
  { id: 'cert_1', title: 'Stanford Neural Networks and Deep Learning', issuer: 'Stanford Online / Coursera', issueDate: '2025-11-20', credentialUrl: 'https://coursera.org/verify/stanford-dl', category: 'technical' }
];

const initialAchievements: Achievement[] = [
  { id: 'ach_1', title: 'First Place Winner - Stanford TreeHacks 2026', organization: 'Stanford University / MLH', date: '2026-02-15', description: 'Built an AI-powered lecture-to-mindmap graph generation tool, beating out 300+ other student teams.', awardAmount: '$5,000', category: 'competition' },
  { id: 'ach_2', title: 'Dean\'s List Academic Excellence Honors', organization: 'Stanford University', date: '2025-12-18', description: 'Maintained a perfect 4.0 GPA during the Autumn 2025 semester.', category: 'academic' }
];

const initialFinanceTransactions: FinanceTransaction[] = [
  { id: 'f_1', type: 'income', category: 'Research Fellowship Stipend', amount: 1200, date: '2026-07-01', description: 'Monthly teaching/research stipend allocation.' },
  { id: 'f_2', type: 'expense', category: 'Textbooks & Software License', amount: 145, date: '2026-07-05', description: 'CS 301 textbook and visual graph charting tools license.' },
  { id: 'f_3', type: 'expense', category: 'Coffee & Cafeteria Spend', amount: 32, date: '2026-07-12', description: 'Late night coding fuel.' }
];

const initialGoals: Goal[] = [
  { id: 'g_1', title: 'Reach 200 Solved Problems on LeetCode', targetDate: '2026-09-01', category: 'Coding', progress: 71, completed: false },
  { id: 'g_2', title: 'Maintain attendance above 90% in CS 301', targetDate: '2026-12-15', category: 'Academic', progress: 90, completed: false }
];

const initialCalendarEvents: CalendarEvent[] = [
  { id: 'e_1', title: 'CS 301: Advanced Algorithms Lecture', start: new Date().toISOString().split('T')[0] + 'T10:00:00', end: new Date().toISOString().split('T')[0] + 'T11:30:00', type: 'class', description: 'Weekly focus: dynamic programming vs memoization schemes.' },
  { id: 'e_2', title: 'Discrete Math Quizz Block', start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00', end: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T15:00:00', type: 'exam', description: 'Discrete probability counts.' }
];

const initialNotes: Note[] = [
  { id: 'n_1', title: 'CS 301 Master Cheatsheet', content: '### CS 301 Master Formula Notes\n\n- **Master Theorem Formula**: \n  $T(n) = aT(n/b) + f(n)$\n- **Time Complexity Cases**:\n  1. If $f(n) = O(n^{\\log_b a - \\epsilon})$, then $T(n) = \\Theta(n^{\\log_b a})$\n  2. If $f(n) = \\Theta(n^{\\log_b a})$, then $T(n) = \\Theta(n^{\\log_b a} \\lg n)$\n  3. If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$, then $T(n) = \\Theta(f(n))$\n\n- **Dynamic Programming Core Checklist**:\n  - Identify subproblems.\n  - Define state variable.\n  - State recurrence relations.\n  - Implement memoization table (top-down or bottom-up).', lastModified: new Date().toISOString(), tags: ['CS301', 'Theory'] }
];

const initialNotifications: NotificationItem[] = [
  { id: 'nt_1', title: 'Critical Attendance Warning', message: 'Database Systems attendance is sitting at 74%. Attend next class to push back to safety.', timestamp: new Date().toISOString(), read: false, type: 'warning' },
  { id: 'nt_2', title: 'Assignment Due Alert', message: 'discrete Math sheet is due in less than 24 hours.', timestamp: new Date().toISOString(), read: false, type: 'deadline' }
];

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
    await firebaseAuth.signOut();
  };

  // Local storage helper helper
  const getStored = <T,>(key: string, initial: T): T => {
    const value = localStorage.getItem(`student_os_${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return initial;
      }
    }
    return initial;
  };

  // State Declarations backed by local save
  const [profile, setProfile] = useState<StudentProfile>(() => getStored('profile', initialProfile));
  const [semesters, setSemesters] = useState<Semester[]>(() => getStored('semesters', initialSemesters));
  const [courses, setCourses] = useState<Course[]>(() => getStored('courses', initialCourses));
  const [assignments, setAssignments] = useState<Assignment[]>(() => getStored('assignments', initialAssignments));
  const [hackathons, setHackathons] = useState<Hackathon[]>(() => getStored('hackathons', initialHackathons));
  const [codingProfiles, setCodingProfiles] = useState<CodingProfile[]>(() => getStored('codingProfiles', initialCodingProfiles));
  const [applications, setApplications] = useState<InternshipApplication[]>(() => getStored('applications', initialApplications));
  const [projects, setProjects] = useState<Project[]>(() => getStored('projects', initialProjects));
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>(() => getStored('researchPapers', initialResearchPapers));
  const [certificates, setCertificates] = useState<Certificate[]>(() => getStored('certificates', initialCertificates));
  const [achievements, setAchievements] = useState<Achievement[]>(() => getStored('achievements', initialAchievements));
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => getStored('transactions', initialFinanceTransactions));
  const [goals, setGoals] = useState<Goal[]>(() => getStored('goals', initialGoals));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => getStored('calendarEvents', initialCalendarEvents));
  const [notes, setNotes] = useState<Note[]>(() => getStored('notes', initialNotes));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStored('notifications', initialNotifications));

  const [sidebarTheme, setSidebarTheme] = useState<string>(() => getStored('sidebarTheme', 'violet'));
  const [customCategories, setCustomCategories] = useState<{ academic: string; professional: string; general: string; }>(() => 
    getStored('customCategories', { academic: 'Academic', professional: 'Professional', general: 'General' })
  );

  const updateCategoryLabel = (key: 'academic' | 'professional' | 'general', label: string) => {
    setCustomCategories(prev => ({ ...prev, [key]: label }));
  };

  // Auto save hook whenever states mutate
  useEffect(() => {
    localStorage.setItem('student_os_profile', JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem('student_os_sidebarTheme', JSON.stringify(sidebarTheme));
  }, [sidebarTheme]);
  useEffect(() => {
    localStorage.setItem('student_os_customCategories', JSON.stringify(customCategories));
  }, [customCategories]);
  useEffect(() => {
    localStorage.setItem('student_os_semesters', JSON.stringify(semesters));
  }, [semesters]);
  useEffect(() => {
    localStorage.setItem('student_os_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('student_os_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('student_os_hackathons', JSON.stringify(hackathons));
  }, [hackathons]);
  useEffect(() => {
    localStorage.setItem('student_os_codingProfiles', JSON.stringify(codingProfiles));
  }, [codingProfiles]);
  useEffect(() => {
    localStorage.setItem('student_os_applications', JSON.stringify(applications));
  }, [applications]);
  useEffect(() => {
    localStorage.setItem('student_os_projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem('student_os_researchPapers', JSON.stringify(researchPapers));
  }, [researchPapers]);
  useEffect(() => {
    localStorage.setItem('student_os_certificates', JSON.stringify(certificates));
  }, [certificates]);
  useEffect(() => {
    localStorage.setItem('student_os_achievements', JSON.stringify(achievements));
  }, [achievements]);
  useEffect(() => {
    localStorage.setItem('student_os_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('student_os_goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem('student_os_calendarEvents', JSON.stringify(calendarEvents));
  }, [calendarEvents]);
  useEffect(() => {
    localStorage.setItem('student_os_notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('student_os_notifications', JSON.stringify(notifications));
  }, [notifications]);

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
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
