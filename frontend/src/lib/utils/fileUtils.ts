/**
 * Constructs a file URL for displaying resources
 * @param resourceId - The UUID of the file resource
 * @returns The complete URL to access the file resource
 */
export function getResourceUrl(resourceId: string | undefined | null): string | null {
  if (!resourceId) return null;
  
  // Use the frontend proxy route for file access
  return `/files/${resourceId}`;
}
