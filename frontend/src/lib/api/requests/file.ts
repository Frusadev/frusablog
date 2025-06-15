import { API_URL } from "@/lib/config/env";
import { resolveRequest } from "../utils";
import ky from "ky";

export interface FileResource {
  id: string;
  name: string;
  filetype: string;
  protected: boolean;
  created_at: string;
  owner?: {
    id: string;
    username: string;
    name: string;
  };
}

export async function getFileURL(resourceId?: string) {
  const request = ky
    .get(`${API_URL}/resources/${resourceId}`, {
      credentials: "include",
    })
    .blob();
  const [blob, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return URL.createObjectURL(blob);
}

export async function uploadFile(file: File, isProtected: boolean = false) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("protected", isProtected.toString());

  const request = ky
    .post<FileResource>(`${API_URL}/resource`, {
      body: formData,
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function uploadFiles(files: File[], isProtected: boolean = false) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("protected", isProtected.toString());

  const request = ky
    .post<FileResource[]>(`${API_URL}/resources`, {
      body: formData,
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getAllFiles(): Promise<FileResource[]> {
  const request = ky
    .get<FileResource[]>(`${API_URL}/resources`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function deleteFile(fileId: string): Promise<void> {
  const request = ky
    .delete(`${API_URL}/resources/${fileId}`, {
      credentials: "include",
    });
  const [, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
}
