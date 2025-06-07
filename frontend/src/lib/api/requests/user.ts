import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { User } from "../dto/user";

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
