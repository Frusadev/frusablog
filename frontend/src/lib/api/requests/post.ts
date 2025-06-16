import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { Post, PostUpdateDTO, PostCreationDTO } from "../dto/post";

export async function updatePost(data: PostUpdateDTO) {
  const request = ky.put<Post>(`${API_URL}/post`, {
    json: data,
    credentials: "include",
  }).json()
  const [response, error] = await resolveRequest(request)
  if (error) {
    throw new Error(error.detail)
  }
  return response
}

export async function getPosts({
  skip = 0,
  limit = 10,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts`, {
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

export async function getFeaturedPosts() {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/featured`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function likePost(postId: string) {
  const request = ky
    .put<Post>(`${API_URL}/post/like`, {
      searchParams: { post_id: postId },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function toggleFeaturedPost(postId: string, featured: boolean) {
  // First get the current post data
  const getRequest = ky
    .get<Post>(`${API_URL}/post/${postId}`, {
      credentials: "include",
    })
    .json();
  const [currentPost, getError] = await resolveRequest(getRequest);
  if (getError) {
    throw getError;
  }

  // Then update with the new featured status
  const updateData: PostUpdateDTO = {
    id: postId,
    title: currentPost.title,
    description: currentPost.description,
    cover: currentPost.cover,
    content: currentPost.content,
    published: currentPost.published,
    archived: currentPost.archived,
    featured: featured,
  };

  const request = ky.put<Post>(`${API_URL}/post`, {
    json: updateData,
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function getPost(postId: string) {
  const request = ky
    .get<Post>(`${API_URL}/post/${postId}`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getDraftPosts({
  skip = 0,
  limit = 10,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/drafts`, {
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

export async function getArchivedPosts({
  skip = 0,
  limit = 10,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/archived`, {
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

export async function createPost(data: PostCreationDTO) {
  const request = ky.post<Post>(`${API_URL}/post`, {
    json: data,
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function deletePost(postId: string) {
  const request = ky.delete(`${API_URL}/post/${postId}`, {
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
}

export async function searchPosts({
  query,
  skip,
  limit,
}: {
  query: string;
  skip: number;
  limit: number;
}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/search`, {
      searchParams: {
        query: query,
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

export async function getAllPosts({
  skip = 0,
  limit = 10,
}: {
  skip?: number;
  limit?: number;
} = {}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/all`, {
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

export async function searchAllPosts({
  query,
  skip,
  limit,
}: {
  query: string;
  skip: number;
  limit: number;
}) {
  const request = ky
    .get<Post[]>(`${API_URL}/posts/search/all`, {
      searchParams: {
        query: query,
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
