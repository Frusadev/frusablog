import ky from "ky";
import { resolveRequest } from "../utils";
import { API_URL } from "@/lib/config/env";

// Stats DTOs
export interface GeneralStats {
  total_likes: number;
  total_comments: number;
  total_articles: number;
}

// API Functions
export async function getGeneralStats() {
  const request = ky
    .get<GeneralStats>(`${API_URL}/stats/general`, {
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getGlobalViews({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number>(`${API_URL}/stats/views/global`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getViews({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number[]>(`${API_URL}/stats/views`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getGlobalVisits({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number>(`${API_URL}/stats/visits/global`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getVisits({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number[]>(`${API_URL}/stats/visits`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getAverageVisitTime({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number[]>(`${API_URL}/stats/average-visit-time`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}

export async function getAverageViewTime({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const request = ky
    .get<number[]>(`${API_URL}/stats/average-view-time`, {
      searchParams: { start, end },
      credentials: "include",
    })
    .json();
  const [response, error] = await resolveRequest(request);
  if (error) {
    throw error;
  }
  return response;
}
