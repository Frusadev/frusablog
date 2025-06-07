export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
export const SERVER_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8000";
export const API_URL =
  `${SERVER_URL}/${API_VERSION}` || "http://localhost:8000/v1";
