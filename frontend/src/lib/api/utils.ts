import { HTTPError } from "ky";
import type { APIError } from "./types/error";

export async function resolveRequest<T>(
  promise: Promise<T>,
): Promise<[T, undefined] | [undefined, APIError]> {
  try {
    const value = await promise;
    return [value, undefined];
  } catch (e) {
    if (e instanceof HTTPError) {
      const err = await e.response.json<APIError>();
      return [undefined, err];
    }
    return [undefined, { detail: "An unknown error occured." }];
  }
}
