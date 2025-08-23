import type { Tag } from "./tag";
import type { User } from "./user";

export interface Post {
  id: string;
  title: string;
  description: string;
  cover: string; // UUID
  likes: number;
  content: string;
  published: boolean;
  archived: boolean;
  featured: boolean;
  created_at: string; // ISO 8601 timestamp
  author: User;
  tags: Tag[];
  series?: string | null; // UUID
}

export interface PostCreationDTO {
  title: string;
  description: string;
  cover?: string | null;
  content: string;
  published: boolean;
  tags: Tag[];
  series?: string | null; // UUID
}

export interface PostUpdateDTO {
  id: string;
  title: string;
  description: string;
  cover?: string | null;
  content: string;
  published: boolean;
  archived: boolean;
  featured: boolean;
  tag_ids: string[];
  series?: string | null; // UUID
};

export interface PostTranslationResult {
  title: string;
  description: string;
  content: string;
}

export type SupportedLanguages = 
  | "English" 
  | "French" 
  | "Chinese" 
  | "Japanese" 
  | "Spanish" 
  | "German";

export type LanguageOption = SupportedLanguages | "Original";
