# API Documentation

## Overview

The FrusaBlog API is built with **FastAPI** and provides comprehensive endpoints for managing a personal blog platform with user authentication, content management, and file handling.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-api-domain.com`

## Authentication

The API uses **cookie-based session authentication** with email verification.

### Authentication Flow

1. **Register/Login**: User submits email
2. **Email Sent**: Authentication link sent to email
3. **Verify**: User clicks link to authenticate
4. **Session Created**: Cookie-based session established

## API Endpoints

### Authentication

#### Register User
```http
POST /v1/auth/email/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "name": "Full Name"
}
```

**Response**:
```json
{
  "message": "Registration successful! Please check your email."
}
```

#### Login Request
```http
POST /v1/auth/email/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Login link sent! Please check your email."
}
```

#### Authenticate Session
```http
GET /v1/auth/email/authenticate/{auth_session_id}
```

**Response**:
```json
{
  "message": "Logged in successfully!"
}
```
*Sets authentication cookie*

#### Unsubscribe
```http
POST /v1/auth/email/unsubscribe
Authorization: Cookie
```

**Response**:
```json
{
  "message": "Successfully unsubscribed."
}
```

---

### Posts

#### Get Published Posts
```http
GET /v1/posts?skip=0&limit=10
```

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "Post Title",
    "description": "Post description",
    "content": "Post content in markdown",
    "cover": "file-uuid",
    "likes": 42,
    "published": true,
    "archived": false,
    "featured": false,
    "created_at": "2024-01-01T00:00:00Z",
    "author": {
      "id": "user-id",
      "username": "username",
      "name": "Full Name"
    },
    "tags": [
      {
        "id": "tag-id",
        "name": "Technology"
      }
    ]
  }
]
```

#### Get Single Post
```http
GET /v1/post/{post_id}
```

**Response**: Same as post object above

#### Get Featured Posts
```http
GET /v1/posts/featured?skip=0&limit=10
```

#### Search Posts
```http
GET /v1/posts/search?query=searchterm&skip=0&limit=50
```

#### Get Draft Posts (Admin)
```http
GET /v1/posts/drafts?skip=0&limit=10
Authorization: Cookie (admin required)
```

#### Get Archived Posts (Admin)
```http
GET /v1/posts/archived?skip=0&limit=10
Authorization: Cookie (admin required)
```

#### Create Post (Admin)
```http
POST /v1/post
Authorization: Cookie (admin required)
Content-Type: application/json

{
  "title": "New Post Title",
  "description": "Post description",
  "content": "# Post content in markdown",
  "cover": "file-uuid",
  "tags": [
    {"id": "tag-id", "name": "Technology"}
  ],
  "published": false
}
```

#### Update Post (Admin)
```http
PUT /v1/post
Authorization: Cookie (admin required)
Content-Type: application/json

{
  "id": "post-uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "content": "Updated content",
  "cover": "file-uuid",
  "published": true,
  "archived": false,
  "featured": true
}
```

#### Delete Post (Admin)
```http
DELETE /v1/post/{post_id}
Authorization: Cookie (admin required)
```

#### Like Post
```http
PUT /v1/post/like?post_id=uuid
Authorization: Cookie
```

---

### Comments

#### Get Post Comments
```http
GET /v1/comments/{post_id}?skip=0&limit=50
```

**Response**:
```json
[
  {
    "id": "comment-uuid",
    "content": "Comment content",
    "likes": 5,
    "created_at": "2024-01-01T00:00:00Z",
    "author": {
      "id": "user-id",
      "username": "username",
      "name": "Full Name"
    },
    "children": [
      {
        "id": "reply-uuid",
        "content": "Reply content",
        "likes": 2,
        "created_at": "2024-01-01T01:00:00Z",
        "author": {...},
        "children": [],
        "parent": {...},
        "level": 1
      }
    ],
    "parent": null,
    "level": 0
  }
]
```

#### Get Single Comment
```http
GET /v1/comment/{comment_id}
```

#### Create Comment
```http
POST /v1/comment
Authorization: Cookie
Content-Type: application/json

{
  "content": "Comment content",
  "post_id": "post-uuid",
  "parent_id": "parent-comment-uuid" // Optional for replies
}
```

#### Update Comment
```http
PUT /v1/comment
Authorization: Cookie
Content-Type: application/json

{
  "id": "comment-uuid",
  "content": "Updated comment content"
}
```

#### Like Comment
```http
PUT /v1/comment/like?comment_id=uuid
Authorization: Cookie
```

#### Delete Comment
```http
DELETE /v1/comment/{comment_id}
Authorization: Cookie
```

---

### Tags

#### Get All Tags
```http
GET /v1/tags?skip=0&limit=200
```

**Response**:
```json
[
  {
    "id": "tag-id",
    "name": "Technology"
  }
]
```

#### Create Tag (Admin)
```http
POST /v1/tag
Authorization: Cookie (admin required)
Content-Type: application/json

{
  "name": "New Tag"
}
```

#### Delete Tag (Admin)
```http
DELETE /v1/tag/{tag_id}
Authorization: Cookie (admin required)
```

#### Get Tag Related Posts
```http
GET /v1/tag/{tag_id}/related-posts?skip=0&limit=20
```

---

### File Management

#### Upload Single File
```http
POST /v1/resource
Authorization: Cookie
Content-Type: multipart/form-data

file: [binary file]
protected: false
```

**Response**:
```json
{
  "id": "file-uuid",
  "name": "filename.jpg",
  "protected": false,
  "created_at": "2024-01-01T00:00:00Z",
  "owner": {
    "id": "user-id",
    "username": "username",
    "name": "Full Name"
  }
}
```

#### Upload Multiple Files
```http
POST /v1/resources
Authorization: Cookie
Content-Type: multipart/form-data

files: [binary files array]
protected: false
```

#### Download File
```http
GET /v1/resources/{resource_id}
Authorization: Cookie (if protected)
```

**Response**: Binary file data with appropriate headers

---

### User Management

#### Get Current User
```http
GET /v1/users/me
Authorization: Cookie
```

**Response**:
```json
{
  "id": "user-id",
  "username": "username",
  "name": "Full Name"
}
```

#### Check Posting Permission
```http
GET /v1/users/me/can-post
Authorization: Cookie
```

**Response**:
```json
true
```

---

## Data Models

### User
```typescript
interface User {
  id: string
  username: string
  name: string
}
```

### Post
```typescript
interface Post {
  id: string
  title: string
  description: string
  content: string
  cover?: string // File resource UUID
  likes: number
  published: boolean
  archived: boolean
  featured: boolean
  created_at: string // ISO 8601
  author: User
  tags: Tag[]
}
```

### Comment
```typescript
interface Comment {
  id: string
  content: string
  likes: number
  created_at: string // ISO 8601
  author: User
  children: Comment[]
  parent?: Comment
  level: number // 0 for top-level, 1 for replies
}
```

### Tag
```typescript
interface Tag {
  id: string
  name: string
}
```

### FileResource
```typescript
interface FileResource {
  id: string
  name: string
  protected: boolean
  created_at: string // ISO 8601
  owner: User
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message"
}
```

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

### Validation Errors
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 100 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 uploads per minute per user
- **Comments**: 20 comments per minute per user
- **General**: 100 requests per minute per IP

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## File Upload Constraints

- **Max file size**: 5MB per file
- **Allowed types**: Images (jpg, png, gif, webp), documents (pdf, txt, md)
- **Protected files**: Require authentication to access
- **Public files**: Accessible without authentication

---

## Permissions System

### Roles
- **Admin**: Full access to all resources
- **User**: Can create comments, like posts
- **Guest**: Read-only access to published content

### Permission Checks
- **Global permissions**: Apply to resource types (e.g., can create posts)
- **Resource permissions**: Apply to specific resources (e.g., can edit specific post)
- **Inheritance**: Admins bypass all permission checks

---

## WebSocket Events (Future)

*Planned for real-time features:*

```typescript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws')

// Events
{
  "type": "comment_created",
  "data": { "post_id": "uuid", "comment": Comment }
}

{
  "type": "post_liked",
  "data": { "post_id": "uuid", "likes": 42 }
}
```

---

## Development

### OpenAPI Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Environment Variables
```bash
# Required
DB_STRING=postgresql+psycopg2://user:pass@localhost:5432/frusablog
EMAIL_APP_PASSWORD=your-smtp-password
APP_EMAIL_ADDRESS=your-email@domain.com

# Optional
DEBUG=True
PORT=8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### Running the API
```bash
cd backend
uv sync
python main.py
```

The API will be available at `http://localhost:8000` with interactive documentation at `http://localhost:8000/docs`.

---

## SDK/Client Libraries

### JavaScript/TypeScript
```typescript
// Example API client
class FrusaBlogAPI {
  constructor(private baseURL: string) {}
  
  async getPosts(skip = 0, limit = 10): Promise<Post[]> {
    const response = await fetch(`${this.baseURL}/v1/posts?skip=${skip}&limit=${limit}`)
    return response.json()
  }
  
  async createPost(post: PostCreateDTO): Promise<Post> {
    const response = await fetch(`${this.baseURL}/v1/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
      credentials: 'include'
    })
    return response.json()
  }
}
```

### Python
```python
import httpx

class FrusaBlogClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.Client(base_url=base_url)
    
    def get_posts(self, skip: int = 0, limit: int = 10) -> list[dict]:
        response = self.client.get(f"/v1/posts?skip={skip}&limit={limit}")
        response.raise_for_status()
        return response.json()
```

This API documentation provides comprehensive coverage of all available endpoints, data models, and usage examples for the FrusaBlog platform.
