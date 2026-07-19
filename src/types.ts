export type PriorityType = 'low' | 'medium' | 'high';

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  grade?: string;
  semesterId: string;
  attendancePresent: number;
  attendanceAbsent: number;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  priority: PriorityType;
  status: 'pending' | 'completed';
  notes?: string;
}

export interface Semester {
  id: string;
  title: string;
  targetGPA: number;
  currentGPA?: number;
}

export interface Hackathon {
  id: string;
  name: string;
  date: string;
  teamSize: number;
  rolesRequired: string[];
  ideas: string[];
  milestones: { id: string; title: string; completed: boolean }[];
  status: 'register' | 'submit' | 'complete';
  notes?: string;
}

export interface CodingProfile {
  id: string;
  platform: 'LeetCode' | 'Codeforces' | 'GitHub' | 'HackerRank';
  username: string;
  solvedCount: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
  rating?: number;
  lastUpdated: string;
}

export interface InternshipApplication {
  id: string;
  company: string;
  role: string;
  status: 'wishlist' | 'applied' | 'online_test' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  nextDeadline?: string;
  salary?: string;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  tasks: { id: string; title: string; completed: boolean }[];
  status: 'idea' | 'in_progress' | 'completed';
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract?: string;
  authors: string;
  journal?: string;
  status: 'writing' | 'reviewing' | 'accepted' | 'published';
  docLink?: string;
  notes?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  category: 'academic' | 'technical' | 'soft_skills' | 'extracurricular';
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  awardAmount?: string;
  category: 'competition' | 'academic' | 'leadership' | 'extracurricular';
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  category: string;
  progress: number; // 0 to 100
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  courseId?: string;
  type: 'class' | 'assignment' | 'exam' | 'personal' | 'milestone';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  tags: string[];
}

export interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  university: string;
  major: string;
  graduationYear: number;
  streakCount: number;
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'deadline';
}
