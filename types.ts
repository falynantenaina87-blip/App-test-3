export enum UserRole {
  STUDENT = 'élève',
  ADMIN = 'professeur'
}

export interface User {
  id: string;
  email: string;
  role: UserRole; // Mapped from profiles table
  name: string;
}

export interface Message {
  id: string;
  user_id: string;
  profile?: { name: string; role: string }; // Joined from profiles
  content: string;
  created_at: string;
  // Computed on frontend or stored in DB
  is_mandarin?: boolean;
  pinyin?: string; 
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  priority: 'NORMAL' | 'URGENT';
}

export interface ScheduleItem {
  id: string;
  day: string; // Lundi, Mardi...
  time: string; // "09:00 - 10:30"
  subject: string;
  room: string;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string; // The prompt (could be Hanzi or French)
  options: string[];
  correctAnswer: string;
  explanation: string;
  type?: 'HANZI_TO_FR' | 'FR_TO_HANZI';
}

export interface QuizResult {
  id: string;
  user_id: string;
  score: number;
  total: number;
  created_at: string;
}