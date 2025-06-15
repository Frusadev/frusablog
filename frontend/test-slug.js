// Test script for slug utilities
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function extractIdFromSlug(slug) {
  // Extract the UUID from the end of the slug
  // Format: "title-slug--uuid" (double dash separator)
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

function createPostSlug(title, id) {
  const slug = generateSlug(title);
  return `${slug}--${id}`;
}

// Test with a sample title and UUID
const title = 'My Amazing Blog Post';
const uuid = '123e4567-e89b-12d3-a456-426614174000';

console.log('Original title:', title);
console.log('Original UUID:', uuid);

const slug = createPostSlug(title, uuid);
console.log('Generated slug:', slug);

const extractedId = extractIdFromSlug(slug);
console.log('Extracted UUID:', extractedId);

console.log('UUID matches:', uuid === extractedId);

// Test with a title that has dashes
const titleWithDashes = 'My-Super-Cool-Blog-Post';
const slug2 = createPostSlug(titleWithDashes, uuid);
console.log('\nTitle with dashes:', titleWithDashes);
console.log('Generated slug:', slug2);
const extractedId2 = extractIdFromSlug(slug2);
console.log('Extracted UUID:', extractedId2);
console.log('UUID matches:', uuid === extractedId2);
