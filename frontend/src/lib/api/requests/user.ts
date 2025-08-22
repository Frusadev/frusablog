import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type {
  User,
  DetailedUserInfo,
  UserListResponse,
  UserMessageSendDTO,
  BroadcastData,
  BanUserRequest,
  UserMessageDTO,
} from "../dto/user";
import type { BackendMessage } from "../dto/message";

export async function me() {
  const request = ky
    .get<User>(`${API_URL}/users/me`, { credentials: "include" })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function detailedMe() {
  const request = ky
    .get<DetailedUserInfo>(`${API_URL}/users/me/detailed`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function canPost() {
  const request = ky
    .get<boolean>(`${API_URL}/users/me/can-post`, { credentials: "include" })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function isBanned() {
  const request = ky
    .get<boolean>(`${API_URL}/users/me/banned`, { credentials: "include" })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function getUsers(skip = 0, limit = 10) {
  const request = ky
    .get<UserListResponse>(`${API_URL}/users?skip=${skip}&limit=${limit}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function getBannedUsers(skip = 0, limit = 10) {
  const request = ky
    .get<UserListResponse>(
      `${API_URL}/users/banned?skip=${skip}&limit=${limit}`,
      {
        credentials: "include",
      },
    )
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function banUser(userId: string, motive: string) {
  const request = ky
    .post(`${API_URL}/users/${userId}/ban`, {
      credentials: "include",
      json: { motive } as BanUserRequest,
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function mailUser(data: UserMessageSendDTO) {
  const request = ky
    .post(`${API_URL}/users/mail`, {
      credentials: "include",
      json: data,
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function deleteUser(userId: string) {
  const request = ky
    .delete(`${API_URL}/users/${userId}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function sendBroadcast(data: BroadcastData) {
  const request = ky
    .post(`${API_URL}/users/broadcast`, {
      credentials: "include",
      json: data,
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function searchUsers(query: string, skip = 0, limit = 10) {
  const request = ky
    .get<DetailedUserInfo[]>(
      `${API_URL}/users/search?query=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`,
      {
        credentials: "include",
      },
    )
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function joinNewsletter() {
  const request = ky
    .post<BackendMessage>(`${API_URL}/users/me/subscribe`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function leaveNewsletter() {
  const request = ky
    .post<BackendMessage>(`${API_URL}/users/me/unsubscribe`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function sendUserMessage(subject: string, content: string) {
  const request = ky
    .post<BackendMessage>(`${API_URL}/ua/messages`, {
      credentials: "include",
      json: { subject, content },
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

// Admin messages API
export async function getUserMessages(params?: { skip?: number; limit?: number; all?: boolean }) {
  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 20;
  const all = params?.all ?? false;
  const request = ky
    .get<UserMessageDTO[]>(`${API_URL}/ua/messages?skip=${skip}&limit=${limit}&all=${all}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function getUserMessage(messageId: string) {
  const request = ky
    .get<UserMessageDTO>(`${API_URL}/ua/messages/${messageId}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}
