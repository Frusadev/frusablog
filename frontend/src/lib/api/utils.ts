import { HTTPError } from "ky";
import type { APIError } from "./types/error";

export async function resolveRequest<T>(
  promise: Promise<T>,
): Promise<[T, undefined] | [undefined, APIError]> {
  try {
    const value = await promise;
    return [value, undefined];
  } catch (e) {
    console.error("API Request error:", e);

    // Handle abort errors specifically
    if (
      e instanceof Error &&
      (e.name === "AbortError" || e.message.includes("aborted"))
    ) {
      return [undefined, { detail: "Request was cancelled." }];
    }

    // Handle network errors
    if (
      e instanceof Error &&
      (e.message.includes("fetch") || e.message.includes("network"))
    ) {
      return [
        undefined,
        { detail: "Network error. Please check your connection." },
      ];
    }

    if (e instanceof HTTPError) {
      try {
        const err = await e.response.json<APIError>();
        return [undefined, err];
      } catch (jsonError) {
        console.error(jsonError);
        return [
          undefined,
          {
            detail: `HTTP Error ${e.response.status}: ${e.response.statusText}`,
          },
        ];
      }
    }

    return [undefined, { detail: "An unknown error occurred." }];
  }
}
