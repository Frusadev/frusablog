import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { Comment } from "../dto/comment";

export async function getPostComments({
  postId,
  skip = 0,
  limit = 10,
}: {
  postId: string;
  skip?: number;
  limit?: number;
}) {
  const request = ky
    .get<Comment[]>(`${API_URL}/comments/${postId}`, {
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

export async function getAllComments({
  skip = 0,
  limit = 20,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  // Note: This assumes there's an admin endpoint to get all comments
  // If not available, you'd need to implement this differently
  const request = ky
    .get<Comment[]>(`${API_URL}/admin/comments`, {
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

export async function createComment(data: {
  postId: string;
  content: string;
  parentId?: string | null;
}) {
  const request = ky
    .post<Comment>(`${API_URL}/comment`, {
      json: {
        post_id: data.postId,
        content: data.content,
        parent_id: data.parentId,
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

export async function updateComment(data: {
  id: string;
  content: string;
}) {
  const request = ky
    .put<Comment>(`${API_URL}/comment`, {
      json: {
        id: data.id,
        content: data.content,
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

export async function likeComment(commentId: string) {
  const request = ky
    .put<Comment>(`${API_URL}/comment/like`, {
      searchParams: { comment_id: commentId },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function deleteComment(commentId: string) {
  const request = ky
    .delete(`${API_URL}/comment/${commentId}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}
