import type { User } from "./user";

export interface Comment {
  id: string;
  likes: number;
  content: string;
  created_at: string; // ISO 8601 date string
  author: User;
  children: Comment[]; // Array of child comments
  parent_id: string | null; // Parent comment ID (or null if root)
  level: number; // Nesting level
  post?: { id: string; title: string }; // Optional post reference for admin views
}
