import type { User } from "./user";

interface Comment {
  id: string;
  likes: number;
  content: string;
  created_at: string; // ISO 8601 date string
  author: User;
  children: Comment[]; // Array of child comment IDs
  parent: string; // Parent comment ID (or null if root)
  level: number; // Nesting level
}
