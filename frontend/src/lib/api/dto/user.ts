export interface User {
  id: string;
  username: string;
  name: string;
}

export interface DetailedUserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  joined_at: string;
  banned: boolean;
  last_ban_motive: string | null;
  in_newsletter: boolean;
}

export interface UserListResponse {
  length: number;
  users: DetailedUserInfo[];
}

export interface UserMessageSendDTO {
  recipient_id: string;
  mail_content: string;
  mail_subject: string;
}

export interface BroadcastData {
  recipients_ids: string | "all";
  mail_content: string;
  mail_subject: string;
}

export interface BanUserRequest {
  motive: string;
}

// Admin: User messages (contact/unsubscribe etc.)
export interface UserMessageDTO {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  created_at: string; // ISO datetime
  viewed: boolean;
}
