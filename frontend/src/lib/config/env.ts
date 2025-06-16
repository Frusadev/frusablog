export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://api.ametsowou.me";
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";
export const SERVER_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8000";
export const API_URL =
  `${SERVER_URL}/${API_VERSION}` || "https://api.ametsowou.me/v1";
