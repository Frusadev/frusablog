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
}

export interface PostCreationDTO {
  title: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  tags: Tag[];
}

export interface PostUpdateDTO {
  id: string;
  title: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  archived: boolean;
  featured: boolean;
};
