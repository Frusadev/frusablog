# FrusaBlog API Documentation

> Comprehensive API reference for the FrusaBlog platform built with FastAPI

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?style=for-the-badge&logo=openapi-initiative&logoColor=white)](http://localhost:8000/docs)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Base URLs](#-base-urls)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication-1)
  - [Posts](#posts)
  - [Comments](#comments)
  - [Tags](#tags)
  - [File Management](#file-management)
  - [User Management](#user-management)
  - [Analytics & Statistics](#analytics--statistics)
- [Data Models](#-data-models)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Security](#-security)
- [Development](#-development)

---

## 🚀 Overview

The FrusaBlog API is a modern, high-performance REST API built with **FastAPI** and **Python 3.13+**. It provides comprehensive endpoints for managing a personal blog platform with user authentication, content management, file handling, and a robust permission system.

### ✨ Key Features

- **🔐 Passwordless Authentication**: Email-based magic link authentication
- **📝 Content Management**: Full CRUD operations for posts with markdown support
- **💬 Comment System**: Nested comments with threading (2 levels)
- **🏷️ Tag System**: Content categorization and discovery
- **📁 File Management**: Secure file upload with permission-based access
- **🛡️ Permission System**: Role-based access control with granular permissions
- **⚡ High Performance**: Async/await architecture with connection pooling
- **📚 Auto-Documentation**: Interactive Swagger UI and ReDoc documentation

## 🌐 Base URLs

| Environment | URL | Documentation |
|-------------|-----|---------------|
| **Development** | `http://localhost:8000` | [Swagger UI](http://localhost:8000/docs) |
| **Production** | `https://your-api-domain.com` | [Swagger UI](https://your-api-domain.com/docs) |

### 📖 Interactive Documentation
- **Swagger UI**: `/docs` - Interactive API testing interface
- **ReDoc**: `/redoc` - Alternative documentation interface  
- **OpenAPI Schema**: `/openapi.json` - Machine-readable API specification

---

## 🔐 Authentication

The API uses **cookie-based session authentication** with email verification for a passwordless experience.

### 🔄 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant EmailService
    
    User->>Frontend: Enter email
    Frontend->>API: POST /v1/auth/email/register
    API->>EmailService: Send magic link
    EmailService->>User: Email with link
    User->>Frontend: Click email link
    Frontend->>API: GET /v1/auth/email/authenticate/{session_id}
    API->>Frontend: Set session cookie
    Frontend->>User: Authenticated!
```

### 🍪 Session Management

- **Session Cookie**: `frusablog_session` (HTTP-only, secure)
- **Expiration**: 30 days from login
- **Security**: CSRF protection, same-site policy

---

## 📡 API Endpoints

### 🔐 Authentication

#### Register New User
```http
POST /v1/auth/email/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "unique_username",
  "name": "Full Name"
}
```

**Response** `201 Created`:
```json
{
  "message": "Registration successful! Please check your email for verification link.",
  "user_id": "usr_abc123"
}
```

**Validation Rules**:
- Email must be valid and unique
- Username must be 3-20 characters, alphanumeric + underscore
- Name must be 1-100 characters

#### Request Login
```http
POST /v1/auth/email/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** `200 OK`:
```json
{
  "message": "Login link sent! Please check your email.",
  "expires_in_minutes": 60
}
```

#### Complete Authentication
```http
GET /v1/auth/email/authenticate/{auth_session_id}
```

**Response** `200 OK`:
```json
{
  "message": "Authentication successful!",
  "user": {
    "id": "usr_abc123",
    "username": "username",
    "name": "Full Name"
  }
}
```

**Side Effects**: Sets `frusablog_session` cookie

#### Logout
```http
POST /v1/auth/logout
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
{
  "message": "Logged out successfully"
}
```

**Side Effects**: Clears session cookie and invalidates server session

### 📝 Posts

#### Get Published Posts
```http
GET /v1/posts?skip=0&limit=10
```

**Query Parameters**:
- `skip` (int): Number of posts to skip (default: 0)
- `limit` (int): Number of posts to return (max: 100, default: 10)

**Response** `200 OK`:
```json
[
  {
    "id": "pst_abc123",
    "title": "Building Modern APIs with FastAPI",
    "description": "A comprehensive guide to creating high-performance APIs",
    "content": "# Introduction\n\nFastAPI is a modern...",
    "cover": "file_def456",
    "likes": 42,
    "published": true,
    "archived": false,
    "featured": true,
    "created_at": "2024-01-15T10:30:00Z",
    "author": {
      "id": "usr_abc123",
      "username": "frusadev", 
      "name": "Daniel Ametsowou"
    },
    "tags": [
      {
        "id": "tag_ghi789",
        "name": "FastAPI"
      },
      {
        "id": "tag_jkl012",
        "name": "Python"
      }
    ]
  }
]
```

#### Get Single Post
```http
GET /v1/post/{post_id}
```

**Response** `200 OK`: Same as post object above

**Response** `404 Not Found`:
```json
{
  "detail": "Post not found"
}
```

#### Search Posts
```http
GET /v1/posts/search?q=fastapi&skip=0&limit=20
```

**Query Parameters**:
- `q` (string): Search query (searches title, description, content)
- `skip` (int): Pagination offset (default: 0)
- `limit` (int): Results per page (max: 50, default: 20)

#### Get Featured Posts
```http
GET /v1/posts/featured?skip=0&limit=5
```

#### Get Draft Posts (Admin Only)
```http
GET /v1/posts/drafts?skip=0&limit=10
Cookie: frusablog_session=session_token
```

**Authorization**: Requires admin role

#### Get Archived Posts (Admin Only)
```http
GET /v1/posts/archived?skip=0&limit=10
Cookie: frusablog_session=session_token
```

#### Create Post (Admin Only)
```http
POST /v1/post
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "title": "New Post Title",
  "description": "Brief description of the post content",
  "content": "# Post Content\n\nYour markdown content here...",
  "cover": "file_abc123",
  "tags": [
    {"name": "Technology"},
    {"name": "Programming"}
  ],
  "published": false,
  "featured": false
}
```

**Validation Rules**:
- `title`: 1-100 characters, required
- `description`: 1-400 characters, required  
- `content`: Minimum 1 character, required
- `cover`: Must be a valid file resource UUID
- `tags`: Array of tag objects with name (max 50 chars each)

**Response** `201 Created`: Post object

#### Update Post (Admin Only)
```http
PUT /v1/post
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "id": "pst_abc123",
  "title": "Updated Post Title",
  "description": "Updated description",
  "content": "Updated content...",
  "published": true,
  "featured": true,
  "archived": false
}
```

**Validation Rules**:
- `id`: Required, must be a valid post UUID
- Other fields follow same rules as post creation

**Response** `200 OK`: Updated post object

#### Delete Post (Admin Only)
```http
DELETE /v1/post/{post_id}
Cookie: frusablog_session=session_token
```

**Response** `204 No Content`

#### Like/Unlike Post
```http
PUT /v1/post/like
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "post_id": "pst_abc123"
}
```

**Request Body**:
- `post_id`: UUID of the post to like/unlike

**Response** `200 OK`:
```json
{
  "id": "pst_abc123",
  "title": "Post Title",
  "likes": 43,
  "liked": true,
  // ... other post fields
}
```

#### Get Post Views
```http
GET /v1/post/{post_id}/views
```

**Response** `200 OK`:
```json
142
```

#### Check If User Liked Post
```http
GET /v1/post/{post_id}/liked
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
true
```

### 💬 Comments

#### Get Post Comments
```http
GET /v1/comments/{post_id}?skip=0&limit=10
```

**Query Parameters**:
- `skip` (int): Number of comments to skip (default: 0)
- `limit` (int): Number of comments to return (max: 50, default: 10)

**Response** `200 OK`:
```json
[
  {
    "id": "cmt_abc123",
    "content": "Great article! Very informative.",
    "likes": 5,
    "level": 0,
    "created_at": "2024-01-15T12:00:00Z",
    "author": {
      "id": "usr_def456",
      "username": "johndoe",
      "name": "John Doe"
    },
    "children": [
      {
        "id": "cmt_ghi789",
        "content": "I agree! Thanks for sharing.",
        "likes": 2,
        "level": 1,
        "created_at": "2024-01-15T12:30:00Z",
        "author": {
          "id": "usr_jkl012",
          "username": "janedoe",
          "name": "Jane Doe"
        },
        "children": [],
        "parent_id": "cmt_abc123"
      }
    ],
    "parent_id": null
  }
]
```

#### Get Single Comment
```http
GET /v1/comment/{comment_id}
```

**Response** `200 OK`: Comment object with children

#### Create Comment
```http
POST /v1/comment
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "content": "This is a great post! Thanks for sharing.",
  "post_id": "pst_abc123",
  "parent_id": "cmt_def456"  // Optional: for replies
}
```

**Validation Rules**:
- `content`: 1-1000 characters, required
- `post_id`: Must be a valid published post UUID
- `parent_id`: Optional, must be valid comment UUID (for replies)
- Maximum nesting level: 1 (replies to replies not allowed)

**Response** `201 Created`: Comment object

#### Update Comment
```http
PUT /v1/comment
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "id": "cmt_abc123",
  "content": "Updated comment content here."
}
```

**Request Body**:
- `id`: Required, UUID of the comment to update
- `content`: Updated comment text (1-1000 characters)

**Authorization**: User must own the comment or be admin

**Response** `200 OK`: Updated comment object

#### Like/Unlike Comment
```http
PUT /v1/comment/like
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "comment_id": "cmt_abc123"
}
```

**Request Body**:
- `comment_id`: UUID of the comment to like/unlike

**Response** `200 OK`:
```json
{
  "id": "cmt_abc123",
  "content": "Comment text",
  "likes": 6,
  "liked": true,
  // ... other comment fields
}
```

#### Delete Comment
```http
DELETE /v1/comment/{comment_id}
Cookie: frusablog_session=session_token
```

**Authorization**: User must own the comment or be admin

**Response** `204 No Content`

**Note**: Deleting a parent comment will also delete all child comments

### 🏷️ Tags

#### Get All Tags
```http
GET /v1/tags?skip=0&limit=100
```

**Query Parameters**:
- `skip` (int): Number of tags to skip (default: 0)
- `limit` (int): Number of tags to return (max: 200, default: 10)

**Response** `200 OK`:
```json
[
  {
    "id": "tag_abc123",
    "name": "FastAPI",
    "post_count": 15
  },
  {
    "id": "tag_def456", 
    "name": "Python",
    "post_count": 23
  }
]
```

#### Get Tag by ID
```http
GET /v1/tag/{tag_id}
```

**Response** `200 OK`: Single tag object

#### Create Tag (Admin Only)
```http
POST /v1/tag
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "name": "Machine Learning"
}
```

**Validation Rules**:
- `name`: 1-50 characters, required, must be unique
- Automatically converted to lowercase
- Spaces and special characters allowed

**Response** `201 Created`: Tag object

#### Update Tag (Admin Only)
```http
PUT /v1/tag/{tag_id}
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "name": "Artificial Intelligence"
}
```

**Response** `200 OK`: Updated tag object

#### Delete Tag (Admin Only)
```http
DELETE /v1/tag/{tag_id}
Cookie: frusablog_session=session_token
```

**Response** `204 No Content`

**Note**: Deleting a tag will remove it from all associated posts

#### Get Posts by Tag
```http
GET /v1/tag/{tag_id}/posts?skip=0&limit=20
```

**Response** `200 OK`: Array of post objects with this tag

### 📁 File Management

#### Upload Single File
```http
POST /v1/resource
Cookie: frusablog_session=session_token
Content-Type: multipart/form-data

file: [binary file data]
protected: false
```

**Form Parameters**:
- `file`: Binary file data (required)
- `protected`: Boolean - requires authentication to access (default: false)

**File Constraints**:
- **Max size**: 5MB per file
- **Allowed types**: 
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Documents: `application/pdf`, `text/plain`, `text/markdown`
  - Archives: `application/zip`

**Response** `201 Created`:
```json
{
  "id": "file_abc123",
  "name": "screenshot.png",
  "filetype": "image/png",
  "protected": false,
  "created_at": "2024-01-15T14:00:00Z",
  "owner": {
    "id": "usr_def456",
    "username": "johndoe",
    "name": "John Doe"
  }
}
```

#### Upload Multiple Files
```http
POST /v1/resources
Cookie: frusablog_session=session_token
Content-Type: multipart/form-data

files: [array of binary files]
protected: false
```

**Response** `201 Created`: Array of file resource objects

#### Download/View File
```http
GET /v1/resource/{resource_id}
Cookie: frusablog_session=session_token  // Required only for protected files
```

**Response** `200 OK`: Binary file data with appropriate headers

**Headers**:
- `Content-Type`: Original file MIME type
- `Content-Disposition`: Attachment with original filename
- `Content-Length`: File size in bytes
- `Cache-Control`: Caching instructions

#### Get File Metadata
```http
GET /v1/resource/{resource_id}/info
Cookie: frusablog_session=session_token  // Required for protected files
```

**Response** `200 OK`: File resource object (without binary data)

#### Delete File
```http
DELETE /v1/resource/{resource_id}
Cookie: frusablog_session=session_token
```

**Authorization**: User must own the file or be admin

**Response** `204 No Content`

#### List User Files
```http
GET /v1/resources/me?skip=0&limit=50&protected_only=false
Cookie: frusablog_session=session_token
```

**Query Parameters**:
- `skip` (int): Pagination offset (default: 0)
- `limit` (int): Files per page (max: 100, default: 50)
- `protected_only` (bool): Only return protected files (default: false)

**Response** `200 OK`: Array of file resource objects owned by current user

### 👤 User Management

#### Get Current User Profile
```http
GET /v1/users/me
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
{
  "id": "usr_abc123",
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-10T10:00:00Z",
  "roles": [
    {
      "id": "role_def456",
      "name": "user",
      "description": "Standard user role"
    }
  ]
}
```

**Note**: Email is only visible to the user themselves

#### Update User Profile
```http
PUT /v1/users/me
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "name": "John Smith",
  "username": "johnsmith"
}
```

**Validation Rules**:
- `name`: 1-100 characters, optional
- `username`: 3-20 characters, alphanumeric + underscore, must be unique

**Response** `200 OK`: Updated user object

#### Check Posting Permissions
```http
GET /v1/users/me/can-post
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
true
```

#### Check If User Is Banned
```http
GET /v1/users/me/banned
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
false
```

#### Get All Users (Admin Only)
```http
GET /v1/users?skip=0&limit=10
Cookie: frusablog_session=session_token
```

**Query Parameters**:
- `skip` (int): Number of users to skip (default: 0)
- `limit` (int): Number of users to return (max: 100, default: 10)

**Response** `200 OK`:
```json
{
  "users": [
    {
      "id": "usr_abc123",
      "username": "johndoe",
      "name": "John Doe",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 42
}
```

#### Get Banned Users (Admin Only)
```http
GET /v1/users/banned?skip=0&limit=10
Cookie: frusablog_session=session_token
```

**Response** `200 OK`: Same format as get all users

#### Search Users (Admin Only)
```http
GET /v1/users/search?query=john&skip=0&limit=10
Cookie: frusablog_session=session_token
```

**Query Parameters**:
- `query` (string): Search term (required, min 1 character)
- `skip` (int): Pagination offset (default: 0)
- `limit` (int): Results per page (max: 100, default: 10)

#### Ban User (Admin Only)
```http
POST /v1/users/{user_id}/ban
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "motive": "Spam posting and inappropriate behavior"
}
```

**Response** `200 OK`: Success message

#### Delete User (Admin Only)
```http
DELETE /v1/users/{user_id}
Cookie: frusablog_session=session_token
```

**Response** `200 OK`: Success message

#### Send Message to User (Admin Only)
```http
POST /v1/users/mail
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "user_id": "usr_abc123",
  "subject": "Important Notice",
  "message": "Hello, this is a message from the admin..."
}
```

**Response** `200 OK`: Success message

#### Send Broadcast Message (Admin Only)
```http
POST /v1/users/broadcast
Cookie: frusablog_session=session_token
Content-Type: application/json

{
  "subject": "Site Maintenance Notice",
  "message": "We will be performing maintenance on..."
}
```

**Response** `200 OK`: Success message

### 📊 Analytics & Statistics

#### Get Public Statistics
```http
GET /v1/stats/public
```

**Response** `200 OK`:
```json
{
  "total_posts": 156,
  "total_comments": 834,
  "total_likes": 2847,
  "featured_posts": 12
}
```

#### Get General Statistics (Admin Only)
```http
GET /v1/stats/general
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
{
  "total_posts": 156,
  "total_comments": 834,
  "total_likes": 2847,
  "total_users": 245,
  "total_views": 18392,
  "total_visits": 5847
}
```

#### Get Global Views (Admin Only)
```http
GET /v1/stats/views/global?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z
Cookie: frusablog_session=session_token
```

**Query Parameters**:
- `start` (datetime): Start date (ISO 8601 format)
- `end` (datetime): End date (ISO 8601 format)

**Response** `200 OK`:
```json
15847
```

#### Get Daily Views (Admin Only)
```http
GET /v1/stats/views?start=2024-01-01T00:00:00Z&end=2024-01-07T23:59:59Z
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
[245, 387, 512, 389, 445, 367, 298]
```

#### Get Global Visits (Admin Only)
```http
GET /v1/stats/visits/global?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
5847
```

#### Get Daily Visits (Admin Only)
```http
GET /v1/stats/visits?start=2024-01-01T00:00:00Z&end=2024-01-07T23:59:59Z
Cookie: frusablog_session=session_token
```

**Response** `200 OK`:
```json
[89, 124, 156, 134, 142, 118, 97]
```

#### Get Average Visit Time (Admin Only)
```http
GET /v1/stats/average-visit-time?start=2024-01-01T00:00:00Z&end=2024-01-07T23:59:59Z
Cookie: frusablog_session=session_token
```

**Response** `200 OK` (times in seconds):
```json
[180, 234, 198, 267, 245, 189, 201]
```

#### Get Average View Time (Admin Only)
```http
GET /v1/stats/average-view-time?start=2024-01-01T00:00:00Z&end=2024-01-07T23:59:59Z
Cookie: frusablog_session=session_token
```

**Response** `200 OK` (times in seconds):
```json
[120, 145, 132, 178, 156, 134, 142]
```

---

## 📊 Data Models

### 👤 User
```typescript
interface User {
  id: string;              // Unique identifier (usr_...)
  username: string;        // Unique username (3-20 chars)
  name: string;           // Display name (1-100 chars)
  email?: string;         // Email address (private, only visible to self)
  created_at: string;     // ISO 8601 timestamp
  roles?: Role[];         // User roles (when included)
}
```

### 📝 Post
```typescript
interface Post {
  id: string;              // Unique identifier (pst_...)
  title: string;           // Post title (1-100 chars)
  description: string;     // Brief description (1-400 chars)
  content: string;         // Markdown content
  cover?: string;          // Cover image file UUID
  likes: number;           // Like count
  published: boolean;      // Publication status
  archived: boolean;       // Archive status  
  featured: boolean;       // Featured on homepage
  created_at: string;      // ISO 8601 timestamp
  author: User;            // Post author
  tags: Tag[];            // Associated tags
}
```

### 💬 Comment
```typescript
interface Comment {
  id: string;              // Unique identifier (cmt_...)
  content: string;         // Comment text (1-1000 chars)
  likes: number;           // Like count
  level: number;           // Nesting level (0=top-level, 1=reply)
  created_at: string;      // ISO 8601 timestamp
  author: User;            // Comment author
  children: Comment[];     // Child comments (replies)
  parent_id: string | null; // Parent comment ID (null for top-level)
}
```

### 🏷️ Tag
```typescript
interface Tag {
  id: string;              // Unique identifier (tag_...)
  name: string;            // Tag name (1-50 chars, unique)
  post_count?: number;     // Number of posts with this tag
}
```

### 📁 FileResource
```typescript
interface FileResource {
  id: string;              // Unique identifier (file_...)
  name: string;            // Original filename
  filetype: string;        // MIME type
  protected: boolean;      // Requires authentication to access
  created_at: string;      // ISO 8601 timestamp
  owner: User;             // File owner
}
```

### 🔐 Role & Permission
```typescript
interface Role {
  id: string;              // Unique identifier (role_...)
  name: string;            // Role name (e.g., "admin", "user")
  description: string;     // Role description
}

interface Permission {
  id: string;              // Unique identifier
  resource_name: string;   // Resource type (e.g., "post", "file")
  resource_id?: string;    // Specific resource ID (optional)
  action_name: string;     // Action type (e.g., "read", "write", "admin")
  role: Role;             // Associated role
}
```

### 📊 Statistics
```typescript
interface PublicStats {
  total_posts: number;     // Total published posts
  total_comments: number;  // Total comments
  total_likes: number;     // Total likes across all content
  featured_posts: number;  // Number of featured posts
}

interface GeneralStats extends PublicStats {
  total_users: number;     // Total registered users
  total_views: number;     // Total post views
  total_visits: number;    // Total site visits
}

interface UserListResponse {
  users: User[];           // Array of user objects
  total: number;          // Total count for pagination
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "error": true,
  "message": "Human-readable error message",
  "type": "ErrorType",
  "path": "/v1/endpoint"
}
```

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| `200` | **OK** | Request successful |
| `201` | **Created** | Resource created successfully |
| `204` | **No Content** | Resource deleted successfully |
| `400` | **Bad Request** | Invalid request data or parameters |
| `401` | **Unauthorized** | Authentication required |
| `403` | **Forbidden** | Insufficient permissions |
| `404` | **Not Found** | Resource not found |
| `422` | **Unprocessable Entity** | Validation errors |
| `429` | **Too Many Requests** | Rate limit exceeded |
| `500` | **Internal Server Error** | Server error |

### Validation Error Response
```json
{
  "error": true,
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "ensure this value has at most 100 characters",
      "type": "value_error.any_str.max_length",
      "input": "This title is way too long and exceeds the maximum allowed character limit..."
    },
    {
      "field": "email",
      "message": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Authentication Error Response
```json
{
  "error": true,
  "message": "Authentication required",
  "type": "AuthenticationError"
}
```

### Permission Error Response
```json
{
  "error": true,
  "message": "Insufficient permissions to access this resource",
  "type": "PermissionError",
  "required_permission": "post:write"
}
```

### Rate Limit Error Response
```json
{
  "error": true,
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "type": "RateLimitError",
  "retry_after": 60
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
# Database (Required)
DB_STRING=postgresql+psycopg2://user:pass@localhost:5432/frusablog

# Email Configuration (Required)
EMAIL_APP_PASSWORD=your-smtp-password
APP_EMAIL_ADDRESS=your-email@domain.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Application Settings (Optional)
DEBUG=True
PORT=8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Security (Optional - auto-generated if not set)
SECRET_KEY=your-secret-key-here

# File Storage (Optional)
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

### Running the API
```bash
# Development
cd backend
uv sync                    # Install dependencies
python main.py             # Start development server

# Production with Docker
docker-compose up -d       # Start all services
```

### API Versioning
- **Current Version**: `v1` 
- **Base Path**: `/v1/*` for all endpoints
- **Versioning Strategy**: URL path versioning for major changes
- **Backward Compatibility**: Minor updates maintain compatibility within version

### Testing the API
```bash
# Install test dependencies
cd backend
uv add --dev pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
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
