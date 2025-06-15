export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function extractIdFromSlug(slug: string): string {
  // Extract the UUID from the end of the slug
  // Format: "title-slug--uuid" (double dash separator)
  // The UUID regex pattern matches the standard UUID format
  const uuidRegex = /--([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const match = slug.match(uuidRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: if no UUID found with double dash, try to find any UUID in the string
  const fallbackUuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const fallbackMatch = slug.match(fallbackUuidRegex);
  
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }
  
  // If no UUID found, return the whole slug (fallback)
  return slug;
}

export function createPostSlug(title: string, id: string): string {
  const slug = generateSlug(title);
  return `${slug}--${id}`;
}
