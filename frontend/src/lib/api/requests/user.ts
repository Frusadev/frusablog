import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { 
  User, 
  DetailedUserInfo, 
  UserListResponse, 
  UserMessageSendDTO, 
  BroadcastData, 
  BanUserRequest 
} from "../dto/user";

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

export async function getUsers(skip: number = 0, limit: number = 10) {
  const request = ky
    .get<UserListResponse>(`${API_URL}/users?skip=${skip}&limit=${limit}`, { 
      credentials: "include" 
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function getBannedUsers(skip: number = 0, limit: number = 10) {
  const request = ky
    .get<UserListResponse>(`${API_URL}/users/banned?skip=${skip}&limit=${limit}`, { 
      credentials: "include" 
    })
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

export async function searchUsers(query: string, skip: number = 0, limit: number = 10) {
  const request = ky
    .get<DetailedUserInfo[]>(`${API_URL}/users/search?query=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`, { 
      credentials: "include" 
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}
