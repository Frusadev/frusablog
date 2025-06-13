import type { RegisterDTO, LoginDTO } from "../dto/auth";
import ky from "ky";
import type { BackendMessage } from "../dto/message";
import { API_URL } from "@/lib/config/env";
import { resolveRequest } from "../utils";

export async function register(data: RegisterDTO) {
  const request = ky
    .post<BackendMessage>(`${API_URL}/auth/email/register`, {
      json: data,
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function login(data: LoginDTO) {
  const request = ky
    .post<BackendMessage>(`${API_URL}/auth/email/login`, {
      json: data,
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function authenticate(authSessionId: string) {
  const request = ky
    .get<BackendMessage>(
      `${API_URL}/auth/email/authenticate/${authSessionId}`,
      { credentials: "include" },
    )
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}
