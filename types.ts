
import { ReactNode } from 'react';

export type ResourceType = 'pdf' | 'link';

export type Semester = 
  | 'Semester 1'
  | 'Semester 2'
  | '3rd Semester'
  | '4th Semester'
  | '5th Semester'
  | '6th Semester (Normal)'
  | '6th Semester (Internship)';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
}

export interface ResourceCategory {
  id: string;
  title: string;
  type: 'collection' | 'direct_link';
  items?: Resource[];
  url?: string;
  description?: string;
}

export interface Subject {
  id: string;
  title: string;
  semester: Semester;
  description?: string;
  categories: ResourceCategory[];
  driveLink?: string;
  prerequisites?: string[]; // Optional array of Subject IDs
}

export interface VideoLecture {
  id: string;
  title: string;
  youtubeId: string;
  instructor: string;
  duration: string;
  semester: Semester;
  subjectId?: string;
}

export interface DepartmentAnnouncement {
  id: string;
  title: string;
  message: string;
  date?: string;
  variant?: 'info' | 'warning' | 'gradient';
  links?: { text: string; url: string }[];
}

// --- NEW NOTEBOOK ANNOUNCEMENT TYPE ---
export interface AppNotice {
  id: string;
  date: string;
  title: string;
  content: string;
  links?: { label: string; url: string }[];
  isNew?: boolean;
}
// ------------------------------

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: ReactNode; 
  color: string;
  subjects: Subject[];
  videos: VideoLecture[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingMetadata?: any;
}

// Bookmark Interface
export interface BookmarkItem {
  id: string;
  type: 'subject' | 'video';
  title: string;
  subtitle: string; // Semester or Author
  data: Subject | VideoLecture; // Store full object for easy restoration
  deptId?: string; // Context for navigation
}

// Quiz Interfaces
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation?: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

// Scholarship Interface
export interface ScholarshipPost {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string; // ISO format or text
  description: string;
  eligibility: string[];
  applicationLink: string;
  tags: string[]; // e.g., "Merit", "State Govt", "Girls only"
  isNew?: boolean;
}

// Search Interface
export interface SearchResultItem {
  type: 'dept' | 'subject' | 'video';
  item: Department | Subject | VideoLecture;
  dept?: Department;
  sem?: string;
  score: number;
}
