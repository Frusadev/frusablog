import { API_URL } from "@/lib/config/env";
import ky from "ky";
import { resolveRequest } from "../utils";
import type { PostSeries, PostSeriesCreationDTO, PostSeriesUpdateDTO } from "../dto/post-series";
import type { Post } from "../dto/post";

export const createPostSeries = async (data: PostSeriesCreationDTO): Promise<PostSeries> => {
  const request = ky.post<PostSeries>(`${API_URL}/post-series`, {
    json: data,
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
};

export const getPostSeries = async (seriesId: string): Promise<PostSeries> => {
  const request = ky.get<PostSeries>(`${API_URL}/post-series/${seriesId}`, {
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
};

export const getAllPostSeries = async (skip = 0, limit = 10): Promise<PostSeries[]> => {
  const request = ky.get<PostSeries[]>(`${API_URL}/post-series`, {
    searchParams: { skip, limit },
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
};

export const updatePostSeries = async (data: PostSeriesUpdateDTO): Promise<PostSeries> => {
  const request = ky.put<PostSeries>(`${API_URL}/post-series`, {
    json: data,
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
};

export const deletePostSeries = async (seriesId: string): Promise<{ message: string }> => {
  const request = ky.delete<{ message: string }>(`${API_URL}/post-series/${seriesId}`, {
    credentials: "include",
  }).json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw new Error(error.detail);
  }
  return response;
};

export const getSeriesPosts = async (
  seriesId: string,
  skip = 0,
  limit = 10
): Promise<Post[]> => {
  const request = ky
    .get<Post[]>(`${API_URL}/post-series/${seriesId}/posts`, {
      searchParams: { skip, limit },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
};
