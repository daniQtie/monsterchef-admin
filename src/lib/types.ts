import { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "teacher" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  gradeLevel?: string;     // students only (e.g. "Grade 11")
  sectionId?: string;      // students only
  sectionName?: string;    // denormalized for display
  teacherId?: string;      // who can approve this student
  approved: boolean;       // students need approval; teachers auto-approved
  createdAt: Timestamp;
  lastSeen?: Timestamp;
  photoURL?: string;
}

export interface Section {
  id: string;
  name: string;
  teacherId: string;
  studentCount: number;
  createdAt: Timestamp;
}

export interface Score {
  id: string;
  studentId: string;
  studentName: string;
  sectionId: string;
  sectionName: string;
  teacherId: string;
  recipe: string;
  score: number;
  errors: number;
  timeSeconds: number;
  stars: number;
  completedAt: Timestamp;
  /** Set when the teacher releases this score to the student. */
  sentAt?: Timestamp;
  /** Optional feedback the teacher attached when releasing the score. */
  teacherNote?: string;
}

export interface LiveSession {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  status: "requesting" | "streaming" | "ended";
  startedAt: Timestamp;
  endedAt?: Timestamp;
}
