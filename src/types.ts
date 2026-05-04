export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student'
}

export enum SubscriptionStatus {
  FREE = 'free',
  PREMIUM = 'premium',
  INACTIVE = 'inactive'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionStatus?: SubscriptionStatus; // Optional for future use
  currentClass?: '9' | '10';
  bookmarks?: string[];
  createdAt: any;
  lastLogin: any;
  isBlocked?: boolean;
  provider?: string;
  photoURL?: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
  subjectId: string;
  classId?: string;
  order?: number;
  isFree?: boolean;
  content: ChapterContent;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface QuestionEntry {
  q: string;
  a: string;
  m?: number;
}

export interface ChapterContent {
  chapterId?: string;
  notes: string;
  questions: QuestionEntry[];
  quiz: QuizQuestion[];
  summary: string;
  keywords: { word: string; definition: string }[];
  dates?: { date: string; event: string }[];
  characters?: { name: string; description: string }[];
}

export interface SiteSettings {
  globalNotice?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: any;
}

export interface UserFile {
  id: string;
  name: string;
  folderId?: string;
  size: string;
  createdAt: any;
}

export interface UserNote {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  createdAt: any;
}
