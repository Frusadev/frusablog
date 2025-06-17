/**
 * Constructs a file URL for displaying resources
 * @param resourceId - The UUID of the file resource
 * @returns The complete URL to access the file resource
 */
export function getResourceUrl(resourceId: string | undefined | null): string | null {
  if (!resourceId) return null;
  
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://api.ametsowou.me";
  return `${serverUrl}/v1/resources/${resourceId}`;
}
