import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { Tag } from "../dto/tag";
import type { Post } from "../dto/post";

export async function getTags({
  skip = 0,
  limit = 50,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Tag[]>(`${API_URL}/tags`, {
      searchParams: {
        skip: skip,
        limit: limit,
      },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function createTag(name: string) {
  const request = ky
    .post<Tag>(`${API_URL}/tag`, {
      json: { name },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function deleteTag(tagId: string) {
  const request = ky.delete(`${API_URL}/tag/${tagId}`, {
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getRelatedPosts(tagId: string, {
  skip = 0,
  limit = 10,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Post[]>(`${API_URL}/tag/${tagId}/related-posts`, {
      searchParams: {
        skip: skip,
        limit: limit,
      },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}
