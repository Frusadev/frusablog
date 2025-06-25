# FrusaBlog Backend - Developer Guide

> Technical documentation and implementation details for backend developers

This document provides in-depth technical information for developers working on the FrusaBlog backend. For setup and getting started instructions, see the [README.md](./README.md).

## Quick Reference

- **Framework**: FastAPI with Python 3.13+
- **Database**: PostgreSQL with SQLModel ORM
- **Authentication**: Email-based passwordless system
- **Architecture**: Layered (Controllers → Providers → Models)
- **Development**: UV package manager + Docker Compose

## Table of Contents

- [Architecture Deep Dive](#architecture-deep-dive)
- [Database Schema Details](#database-schema-details)
- [Authentication Implementation](#authentication-implementation)
- [Permission System](#permission-system)
- [API Design Patterns](#api-design-patterns)
- [File Management System](#file-management-system)
- [Email System](#email-system)
- [Development Patterns](#development-patterns)
- [Performance Optimization](#performance-optimization)
- [Security Implementation](#security-implementation)
- [Error Handling](#error-handling)
- [Monitoring & Debugging](#monitoring--debugging)

---

## Architecture Deep Dive

### Detailed Project Structure
```
backend/
├── app/                        # Main application package
│   ├── api/                    # API layer
│   │   └── routes/v1/          # API version 1
│   │       ├── controllers/    # Route handlers (FastAPI endpoints)
│   │       ├── dto/            # Data Transfer Objects (Pydantic models)
│   │       └── providers/      # Business logic layer
│   ├── core/                   # Core application logic
│   │   ├── config/             # Configuration management
│   │   ├── db/                 # Database models and setup
│   │   ├── security/           # Authentication & permissions
│   │   └── services/           # External services (email, storage)
│   ├── utils/                  # Utility functions
│   └── app.py                  # FastAPI application factory
├── migrations/                 # Alembic database migrations
├── fs/storage/                 # Local file storage
├── assets/templates/           # Email templates
├── main.py                     # Application entry point
├── pyproject.toml              # Dependencies and project config
├── docker-compose.yml          # Development environment
└── Dockerfile                  # Container configuration
```

### Layered Architecture Pattern

The application follows a strict layered architecture to separate concerns and maintain code organization:

1. **Controllers** (`/controllers/`): FastAPI route handlers
2. **Providers** (`/providers/`): Business logic and data processing
3. **Models** (`/core/db/models.py`): SQLModel database entities
4. **DTOs** (`/dto/`): Pydantic request/response data models
5. **Services** (`/core/services/`): External integrations (email, storage)

#### Data Flow
```
HTTP Request → Controller → Provider → Model/Service → Database/External API
HTTP Response ← Controller ← Provider ← Model/Service ← Database/External API
```

---

## Database Schema Details

### Complete Database Schema

The database uses SQLModel (SQLAlchemy 2.0) with PostgreSQL. Here are the detailed model definitions:

#### User Model
```python
class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(10), primary_key=True)
    email: str
    username: str
    name: str
    # Relationships
    roles: list["Role"] = Relationship(back_populates="users", link_model=RoleUserLink)
    posts: list["Post"] = Relationship(back_populates="author")
    comments: list["Comment"] = Relationship(back_populates="author")
    files: list["FileResource"] = Relationship(back_populates="owner")
```

#### Post Model
```python
class Post(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    content: str  # Markdown content
    cover: UUID | None = None  # File resource UUID
    likes: int = 0
    published: bool = False
    archived: bool = False
    featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: str = Field(foreign_key="user.id")
    # Relationships
    author: User = Relationship(back_populates="posts")
    tags: list[Tag] = Relationship(back_populates="posts", link_model=PostTagLink)
    comments: list["Comment"] = Relationship(back_populates="post")
```

#### Comment Model
```python
class Comment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str
    likes: int = 0
    level: int = 0  # 0 = top-level, 1 = reply
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    parent_id: UUID | None = Field(foreign_key="comment.id", default=None)
    user_id: str = Field(foreign_key="user.id")
    post_id: UUID = Field(foreign_key="post.id")
    # Relationships
    author: User = Relationship(back_populates="comments")
    post: Post = Relationship(back_populates="comments")
    parent: "Comment" = Relationship(back_populates="children")
    children: list["Comment"] = Relationship(back_populates="parent")
```

### Permission and Role Models

#### Role Model
```python
class Role(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True)
    description: str | None = None
    # Relationships
    users: list[User] = Relationship(back_populates="roles", link_model=RoleUserLink)
    permissions: list["Permission"] = Relationship(back_populates="role")
```

#### Permission Model
```python
class Permission(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    resource_name: str  # e.g., "post", "file", "comment"
    resource_id: str | None = None  # Specific resource ID for fine-grained control
    action_name: str  # e.g., "read", "write", "admin"
    role_id: UUID = Field(foreign_key="role.id")
    # Relationships
    role: Role = Relationship(back_populates="permissions")
```

#### FileResource Model
```python
class FileResource(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str  # Original filename
    protected: bool = False  # Public or protected access
    filetype: str  # MIME type
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: str = Field(foreign_key="user.id")
    # Relationships
    owner: User = Relationship(back_populates="files")
```

#### Tag Model
```python
class Tag(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, max_length=50)
    # Relationships
    posts: list[Post] = Relationship(back_populates="tags", link_model=PostTagLink)
```

### Link Tables (Many-to-Many Relationships)

```python
class RoleUserLink(SQLModel, table=True):
    role_id: UUID = Field(foreign_key="role.id", primary_key=True)
    user_id: str = Field(foreign_key="user.id", primary_key=True)

class PostTagLink(SQLModel, table=True):
    post_id: UUID = Field(foreign_key="post.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tag.id", primary_key=True)
```

---

## Authentication Implementation

### Authentication Models

#### AuthSession (Email Authentication)
```python
class AuthSession(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expired: bool = False
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=1)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

#### LoginSession (User Sessions)
```python
class LoginSession(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### Email-Based Authentication Flow Implementation

### Controller Pattern Implementation
Controllers are thin layers that handle HTTP specifics and delegate business logic:

```python
# Complete controller example with error handling
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import Annotated

post_router = APIRouter(prefix="/posts", tags=["posts"])

@post_router.get("", response_model=list[PostDTO])
async def get_posts(
    db_session: DBSessionDependency,
    skip: Annotated[int, Query(ge=0, description="Number of posts to skip")] = 0,
    limit: Annotated[int, Query(ge=1, le=50, description="Number of posts to return")] = 10,
    featured_only: Annotated[bool, Query(description="Filter featured posts only")] = False,
):
    """Get paginated list of published posts"""
    try:
        return await post_provider.get_posts(
            db_session=db_session, 
            skip=skip, 
            limit=limit,
            featured_only=featured_only
        )
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@post_router.post("", response_model=PostDTO, status_code=201)
async def create_post(
    data: PostCreationDTO,
    current_user: CurrentUser,
    db_session: DBSessionDependency,
    background_tasks: BackgroundTasks,
):
    """Create a new blog post"""
    return await post_provider.create_post(
        db_session=db_session,
        current_user=current_user,
        data=data,
        background_tasks=background_tasks,
    )
```

### Provider Pattern Implementation
Providers contain complex business logic and coordinate between multiple services:

```python
# Complete provider with business logic
from sqlmodel import select, desc
from fastapi import HTTPException, BackgroundTasks

class PostProvider:
    @staticmethod
    async def get_posts(
        db_session: Session, 
        skip: int, 
        limit: int, 
        featured_only: bool = False
    ) -> list[PostDTO]:
        """Get posts with business logic applied"""
        query = select(Post).where(
            Post.archived == False, 
            Post.published == True
        )
        
        if featured_only:
            query = query.where(Post.featured == True)
        
        posts = db_session.exec(
            query.offset(skip)
                 .limit(limit)
                 .order_by(desc(Post.created_at))
        ).all()
        
        return [post.to_dto() for post in posts]
    
    @staticmethod
    async def create_post(
        db_session: Session,
        current_user: User,
        data: PostCreationDTO,
        background_tasks: BackgroundTasks,
    ) -> PostDTO:
        """Create post with permission checking and side effects"""
        # Permission check
        PermissionChecker(
            db_session=db_session,
            roles=current_user.roles,
            bypass_role="admin",
            pcheck_models=[
                GlobalPermissionCheckModel(
                    resource_name=POST_RESOURCE, 
                    action_names=[ACTION_READWRITE]
                )
            ],
        ).check()
        
        # Create post
        post = Post(
            title=data.title.strip(),
            description=data.description.strip(),
            content=data.content,
            cover=data.cover,
            published=data.published,
            user_id=current_user.id
        )
        
        # Handle tags
        for tag_data in data.tags:
            tag = db_session.exec(
                select(Tag).where(Tag.name == tag_data.name)
            ).first()
            
            if not tag:
                tag = Tag(name=tag_data.name)
                db_session.add(tag)
            
            post.tags.append(tag)
        
        db_session.add(post)
        db_session.commit()
        db_session.refresh(post)
        
        # Background tasks
        if post.published:
            background_tasks.add_task(
                notify_subscribers, 
                post_id=post.id,
                author_name=current_user.name
            )
        
        return post.to_dto()

post_provider = PostProvider()
```

### DTO Pattern Implementation
DTOs provide type safety and validation for API contracts:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class TagDTO(BaseModel):
    id: UUID | None = None
    name: str = Field(max_length=50, min_length=1)
    
    @validator('name')
    def name_must_be_valid(cls, v):
        if not v.strip():
            raise ValueError('Tag name cannot be empty')
        return v.strip().lower()

class PostCreationDTO(BaseModel):
    title: str = Field(max_length=100, min_length=1)
    description: str = Field(max_length=400, min_length=1)
    cover: UUID | None = None
    content: str = Field(min_length=1)
    tags: list[TagDTO] = []
    published: bool = False
    
    @validator('title', 'description')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()
    
    @validator('tags')
    def tags_must_be_unique(cls, v):
        names = [tag.name.lower() for tag in v]
        if len(names) != len(set(names)):
            raise ValueError('Tag names must be unique')
        return v

class PostDTO(BaseModel):
    id: UUID
    title: str
    description: str
    content: str
    cover: UUID | None
    likes: int
    published: bool
    featured: bool
    created_at: datetime
    author: UserBasicDTO
    tags: list[TagDTO]
    
    class Config:
        from_attributes = True

class PostUpdateDTO(BaseModel):
    title: Optional[str] = Field(None, max_length=100, min_length=1)
    description: Optional[str] = Field(None, max_length=400, min_length=1)
    cover: Optional[UUID] = None
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[list[TagDTO]] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    
    @validator('title', 'description', 'content', pre=True)
    def text_fields_must_not_be_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Field cannot be empty if provided')
        return v.strip() if v else v
```

### Cookie Configuration
```python
# Security settings for authentication cookies
LOGIN_SESSION_COOKIE_NAME = "frusablog_session"

def set_login_cookie(response: Response, session_id: str, expires_at: datetime):
    response.set_cookie(
        key=LOGIN_SESSION_COOKIE_NAME,
        value=session_id,
        expires=expires_at,
        httponly=True,  # Prevent XSS attacks
        secure=True,    # HTTPS only in production
        samesite="lax", # CSRF protection
        path="/",       # Cookie available site-wide
    )
```

### Dependency Injection for Authentication
```python
async def get_current_user(
    db_session: Annotated[Session, Depends(get_db_session)],
    login_session_id: Annotated[str | None, Cookie(alias=LOGIN_SESSION_COOKIE_NAME)] = None
) -> User:
    """Dependency to get current authenticated user"""
    if not login_session_id:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    login_session = db_session.get(LoginSession, login_session_id)
    if not login_session or login_session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Session expired")
    
    return db_session.get(User, login_session.user_id)

# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
```

---

## API Design Patterns

1. **Registration/Login Request**
   ```python
   async def register(db_session: Session, data: RegisterRequestDTO, bt: BackgroundTasks):
       # Create user
       user = User(email=data.email.lower(), username=data.username, name=data.name)
       
       # Create auth session
       auth_session = AuthSession(user_id=user.id)
       
       # Send email with magic link
       bt.add_task(send_registration_email, user, auth_session)
   ```

2. **Email Verification**
   ```python
   async def authenticate(db_session: Session, auth_session_id: str, response: Response):
       # Validate auth session
       auth_session = check_existence(db_session.get(AuthSession, auth_session_id))
       
       # Create login session
       login_session = LoginSession(user_id=auth_session.user_id)
       
       # Set secure cookie
       response.set_cookie(
           key=LOGIN_SESSION_COOKIE_NAME,
           value=login_session.id,
           expires=utc(login_session.expires_at),
       )
   ```

3. **Session Validation**
   ```python
   async def get_current_user(
       db_session: Session,
       login_session_id: str | None = Cookie(alias=LOGIN_SESSION_COOKIE_NAME)
   ) -> User:
       login_session = check_existence(db_session.get(LoginSession, login_session_id))
       return login_session.user
   ```

---

## Permission System Implementation

### Permission Checker Class Implementation

The permission system uses a flexible checker that can validate multiple permission models:

```python
from sqlmodel import select
from fastapi import HTTPException
from starlette.status import HTTP_403_FORBIDDEN

class PermissionChecker:
    def __init__(
        self,
        db_session: Session,
        roles: list[Role],
        pcheck_models: list[PermissionCheckModel],
        bypass_role: str = "admin"
    ):
        self.db_session = db_session
        self.roles = roles
        self.pcheck_models = pcheck_models
        self.bypass_role = bypass_role
    
    def check(self, either: bool = False) -> bool:
        """
        Check permissions based on user roles and permission models.
        
        Args:
            either: If True, user needs ANY of the permissions (OR logic)
                   If False, user needs ALL permissions (AND logic)
        
        Returns:
            bool: True if permission check passes
            
        Raises:
            HTTPException: 403 if permission denied
        """
        # Admin bypass - admins can access everything
        if any(role.name == self.bypass_role for role in self.roles):
            return True
        
        permissions_granted = []
        
        for pcheck_model in self.pcheck_models:
            has_permission = False
            
            for role in self.roles:
                if self._check_role_permission(role, pcheck_model):
                    has_permission = True
                    break
            
            permissions_granted.append(has_permission)
        
        # Apply logic based on either parameter
        if either:
            # OR logic - user needs at least one permission
            if any(permissions_granted):
                return True
        else:
            # AND logic - user needs all permissions
            if all(permissions_granted):
                return True
        
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    def _check_role_permission(self, role: Role, pcheck_model: PermissionCheckModel) -> bool:
        """Check if a specific role has permission for a resource"""
        query = select(Permission).where(
            Permission.role_id == role.id,
            Permission.resource_name == pcheck_model.resource_name,
            Permission.action_name.in_(pcheck_model.action_names)
        )
        
        # Add resource ID filter if specified (for resource-specific permissions)
        if pcheck_model.resource_id:
            query = query.where(Permission.resource_id == pcheck_model.resource_id)
        
        permission = self.db_session.exec(query).first()
        return permission is not None

# Permission check models for different scenarios
class PermissionCheckModel:
    def __init__(self, resource_name: str, action_names: list[str], resource_id: str = None):
        self.resource_name = resource_name
        self.action_names = action_names
        self.resource_id = resource_id

class GlobalPermissionCheckModel(PermissionCheckModel):
    """For checking global permissions (no specific resource ID)"""
    def __init__(self, resource_name: str, action_names: list[str]):
        super().__init__(resource_name, action_names, resource_id=None)

# Resource and action constants
POST_RESOURCE = "post"
FILE_RESOURCE = "file"
COMMENT_RESOURCE = "comment"
USER_RESOURCE = "user"

ACTION_READ = "read"
ACTION_READWRITE = "readwrite"
ACTION_ADMIN = "admin"
```

### Permission Builder Pattern

For creating permissions programmatically:
```python
class PermissionBuilder:
    def __init__(self):
        self.role = None
        self.resource_name = None
        self.resource_id = None
        self.action_name = None
    
    def forRole(self, role: Role) -> "PermissionBuilder":
        self.role = role
        return self
    
    def withResourceName(self, resource_name: str) -> "PermissionBuilder":
        self.resource_name = resource_name
        return self
    
    def withResourceId(self, resource_id: str) -> "PermissionBuilder":
        self.resource_id = resource_id
        return self
    
    def withActionName(self, action_name: str) -> "PermissionBuilder":
        self.action_name = action_name
        return self
    
    def make(self) -> Permission:
        if not all([self.role, self.resource_name, self.action_name]):
            raise ValueError("Role, resource_name, and action_name are required")
        
        return Permission(
            role_id=self.role.id,
            resource_name=self.resource_name,
            resource_id=self.resource_id,
            action_name=self.action_name
        )

# Usage example in providers
async def create_post(db_session: Session, current_user: User, data: PostCreationDTO):
    # Check permissions
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, 
                action_names=[ACTION_READWRITE]
            )
        ],
    ).check()
    
    # Create post
    post = Post(**data.dict(), user_id=current_user.id)
    db_session.add(post)
    db_session.commit()
    
    return post.to_dto()
```

---

## File Management System Implementation

### Storage Service Interface

```python
from abc import ABC, abstractmethod
from fastapi import UploadFile
from uuid import UUID

class StorageService(ABC):
    @abstractmethod
    def write_file(self, file: UploadFile, resource: FileResource) -> None:
        """Write uploaded file to storage"""
        pass
    
    @abstractmethod
    def get_file(self, resource: FileResource) -> bytes:
        """Retrieve file content from storage"""
        pass
    
    @abstractmethod
    def delete_file(self, resource: FileResource) -> None:
        """Delete file from storage"""
        pass

class FileSystemStorage(StorageService):
    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def write_file(self, file: UploadFile, resource: FileResource) -> None:
        file_path = self.storage_path / str(resource.id)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    def get_file(self, resource: FileResource) -> bytes:
        file_path = self.storage_path / str(resource.id)
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return file_path.read_bytes()
    
    def delete_file(self, resource: FileResource) -> None:
        file_path = self.storage_path / str(resource.id)
        
        if file_path.exists():
            file_path.unlink()

# Storage instance (can be swapped for cloud storage)
storage = FileSystemStorage(get_env("STORAGE_PATH", "fs/storage"))
```
### File Upload Implementation

```python
from fastapi import UploadFile, HTTPException
from starlette.status import HTTP_400_BAD_REQUEST
import magic
from pathlib import Path

# File validation constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/markdown',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

async def create_file_resource(
    db_session: Session,
    current_user: User,
    file: UploadFile,
    protected: bool = False,
) -> FileResourceDTO:
    # File size validation
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, 
            detail=f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit"
        )
    
    # Read file content for validation
    content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    # MIME type validation using python-magic
    detected_mime = magic.from_buffer(content, mime=True)
    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=f"File type {detected_mime} not allowed"
        )
    
    # Create database record
    resource = FileResource(
        user_id=current_user.id,
        name=file.filename or "unnamed_file",
        protected=protected,
        filetype=detected_mime,
    )
    
    db_session.add(resource)
    db_session.flush()  # Get ID without committing
    
    try:
        # Save to storage
        storage.write_file(file, resource)
        
        # Create permissions for file owner
        if protected:
            owner_role = Role(
                name=f"file_owner_{resource.id}",
                description=f"Owner of file {resource.name}",
                users=[current_user]
            )
            
            permission = PermissionBuilder() \
                .forRole(owner_role) \
                .withResourceName(FILE_RESOURCE) \
                .withResourceId(str(resource.id)) \
                .withActionName(ACTION_READWRITE) \
                .make()
            
            db_session.add_all([owner_role, permission])
        
        db_session.commit()
        db_session.refresh(resource)
        
        return resource.to_dto()
        
    except Exception as e:
        db_session.rollback()
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
```

### File Serving Implementation

```python
from fastapi import Response
from fastapi.responses import StreamingResponse
from io import BytesIO
import mimetypes

async def get_file_resource(
    db_session: Session, 
    user: User | None, 
    resource_id: UUID
) -> StreamingResponse:
    resource = check_existence(
        db_session.get(FileResource, resource_id),
        detail="File not found"
    )
    
    # Permission check for protected files
    if resource.protected:
        if not user:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Authentication required for protected files"
            )
        
        PermissionChecker(
            roles=user.roles,
            db_session=db_session,
            pcheck_models=[
                PermissionCheckModel(
                    resource_name=FILE_RESOURCE,
                    resource_id=str(resource.id),
                    action_names=[ACTION_READ, ACTION_READWRITE],
                )
            ],
        ).check(either=True)
    
    try:
        # Get file content
        file_content = storage.get_file(resource)
        
        # Determine content type
        content_type = resource.filetype
        if not content_type:
            content_type, _ = mimetypes.guess_type(resource.name)
            content_type = content_type or "application/octet-stream"
        
        # Create response headers
        headers = {
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(resource.name)}",
            "Content-Type": content_type,
            "Content-Length": str(len(file_content)),
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
        }
        
        # Security headers for sensitive files
        if resource.protected:
            headers.update({
                "Cache-Control": "private, no-cache, no-store, must-revalidate",
                "X-Content-Type-Options": "nosniff",
            })
        
        return StreamingResponse(
            content=BytesIO(file_content),
            headers=headers,
            media_type=content_type,
        )
        
    except Exception as e:
        logger.error(f"Error serving file {resource_id}: {e}")
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving file"
        )

# Utility for range requests (partial content)
async def get_file_resource_range(
    db_session: Session,
    user: User | None,
    resource_id: UUID,
    range_header: str | None = None
) -> Response:
    """Handle range requests for large files (video, audio)"""
    resource = check_existence(db_session.get(FileResource, resource_id))
    
    # Permission checks...
    
    file_content = storage.get_file(resource)
    file_size = len(file_content)
    
    if not range_header:
        # Return full file
        return StreamingResponse(BytesIO(file_content))
    
    # Parse range header
    range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
    if not range_match:
        raise HTTPException(status_code=416, detail="Invalid range")
    
    start = int(range_match.group(1))
    end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
    
    if start >= file_size or end >= file_size or start > end:
        raise HTTPException(status_code=416, detail="Range not satisfiable")
    
    content_length = end - start + 1
    partial_content = file_content[start:end + 1]
    
    return Response(
        content=partial_content,
        status_code=206,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
            "Content-Type": resource.filetype,
        }
    )
```

---

## Email System Implementation

### Email Service Configuration

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template, FileSystemLoader, Environment
from pathlib import Path

class EmailService:
    def __init__(
        self,
        smtp_server: str = "smtp.gmail.com",
        smtp_port: int = 587,
        email_address: str = None,
        app_password: str = None,
        templates_path: str = "assets/templates/email"
    ):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.email_address = email_address or get_env("APP_EMAIL_ADDRESS")
        self.app_password = app_password or get_env("EMAIL_APP_PASSWORD")
        
        # Setup Jinja2 environment for templates
        self.templates_path = Path(templates_path)
        if self.templates_path.exists():
            self.env = Environment(loader=FileSystemLoader(self.templates_path))
        else:
            self.env = None
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        html: bool = False
    ) -> bool:
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["From"] = self.email_address
            msg["To"] = to_email
            msg["Subject"] = subject
            
            # Add content
            if html:
                msg.attach(MIMEText(message, "html"))
            else:
                msg.attach(MIMEText(message, "plain"))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_address, self.app_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    def send_templated_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: dict,
        fallback_message: str = ""
    ) -> bool:
        if self.env:
            try:
                template = self.env.get_template(f"{template_name}.html")
                html_content = template.render(**context)
                return self.send_email(to_email, subject, html_content, html=True)
            except Exception as e:
                logger.error(f"Failed to render template {template_name}: {e}")
        
        # Fallback to plain text
        return self.send_email(to_email, subject, fallback_message, html=False)

# Global email service instance
email_service = EmailService()
```

### Authentication Email Templates

```python
async def send_registration_email(user: User, auth_session: AuthSession):
    verification_url = f"{get_env('FRONTEND_URL')}/authenticate/{auth_session.id}"
    
    context = {
        "user": user,
        "verification_url": verification_url,
        "author_name": "Daniel Ametsowou",
        "expires_in_hours": 1,
        "site_name": "FrusaBlog",
    }
    
    success = email_service.send_templated_email(
        to_email=user.email,
        subject="Welcome to FrusaBlog! Verify your email �",
        template_name="registration",
        context=context,
        fallback_message=f"Welcome {user.name}! Click here to verify: {verification_url}"
    )
    
    if not success:
        logger.error(f"Failed to send registration email to {user.email}")

async def send_login_email(user: User, auth_session: AuthSession):
    login_url = f"{get_env('FRONTEND_URL')}/authenticate/{auth_session.id}"
    
    context = {
        "user": user,
        "login_url": login_url,
        "author_name": "Daniel Ametsowou",
        "expires_in_hours": 1,
        "site_name": "FrusaBlog",
        "user_agent": "Unknown",  # Can be extracted from request
    }
    
    success = email_service.send_templated_email(
        to_email=user.email,
        subject="Login Request 🔐",
        template_name="login",
        context=context,
        fallback_message=f"Hi {user.name}! Click here to login: {login_url}"
    )
    
    if not success:
        logger.error(f"Failed to send login email to {user.email}")

# Background task for post notifications
async def notify_subscribers(post_id: UUID, author_name: str):
    """Send notification to subscribers about new posts"""
    # This would integrate with a subscriber system
    # For now, it's a placeholder for future functionality
    logger.info(f"Post {post_id} by {author_name} published - notifying subscribers")
```

---

## Development Patterns

### Database Operations Best Practices

```python
# Connection management with dependency injection
from sqlmodel import Session, create_engine
from contextlib import contextmanager

engine = create_engine(
    DATABASE_URL,
    echo=DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,
    max_overflow=0,
)

def get_db_session():
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

# Type alias for dependency injection
DBSessionDependency = Annotated[Session, Depends(get_db_session)]

# Query optimization patterns
def get_posts_optimized(db_session: Session, include_author: bool = True):
    query = select(Post).where(Post.published == True)
    
    if include_author:
        # Eager loading to avoid N+1 queries
        query = query.options(
            selectinload(Post.author),
            selectinload(Post.tags),
            selectinload(Post.comments).selectinload(Comment.author)
        )
    
    return db_session.exec(query.order_by(desc(Post.created_at))).all()

# Transaction management
@contextmanager
def db_transaction(session: Session):
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise

# Usage in providers
async def complex_operation(db_session: Session, user: User):
    with db_transaction(db_session):
        # Multiple operations in single transaction
        post = Post(title="Test", user_id=user.id)
        db_session.add(post)
        db_session.flush()  # Get ID without committing
        
        # Create related records
        comment = Comment(content="First!", post_id=post.id, user_id=user.id)
        db_session.add(comment)
        
        # Transaction commits automatically if no exceptions
```

### Testing Patterns

```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_db_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

# Test example
def test_create_post(client: TestClient, session: Session):
    # Create test user
    user = User(email="test@example.com", username="testuser", name="Test User")
    session.add(user)
    session.commit()
    
    # Test post creation
    response = client.post(
        "/api/v1/posts",
        json={
            "title": "Test Post",
            "description": "Test Description",
            "content": "Test Content",
            "published": True,
            "tags": []
        },
        cookies={"frusablog_session": "test-session-id"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Post"
```

---

## Performance Optimization

### Database Performance

```python
# Index optimization in models
class Post(SQLModel, table=True):
    # ... other fields ...
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True  # Index for ordering
    )
    published: bool = Field(default=False, index=True)  # Index for filtering
    user_id: str = Field(foreign_key="user.id", index=True)  # Foreign key index
    
    __table_args__ = (
        Index("idx_post_published_created", "published", "created_at"),  # Composite index
    )

# Pagination with cursor-based approach for large datasets
async def get_posts_cursor(
    db_session: Session,
    cursor: datetime | None = None,
    limit: int = 10
) -> list[PostDTO]:
    query = select(Post).where(Post.published == True)
    
    if cursor:
        query = query.where(Post.created_at < cursor)
    
    posts = db_session.exec(
        query.order_by(desc(Post.created_at)).limit(limit)
    ).all()
    
    return [post.to_dto() for post in posts]

# Query result caching
from functools import lru_cache

@lru_cache(maxsize=128, typed=True)
def get_featured_posts_cached(limit: int = 5) -> list[PostDTO]:
    """Cache featured posts for performance"""
    with Session(engine) as session:
        posts = session.exec(
            select(Post)
            .where(Post.featured == True, Post.published == True)
            .order_by(desc(Post.created_at))
            .limit(limit)
        ).all()
        return [post.to_dto() for post in posts]
```

### Async Programming Patterns

```python
import asyncio
from fastapi import BackgroundTasks

# Async database operations
async def async_get_posts(skip: int, limit: int):
    async with AsyncSession(async_engine) as session:
        result = await session.exec(
            select(Post)
            .where(Post.published == True)
            .offset(skip)
            .limit(limit)
            .order_by(desc(Post.created_at))
        )
        return [post.to_dto() for post in result.all()]

# Background task processing
async def process_image_upload(file_id: UUID):
    """Background task for image processing"""
    await asyncio.sleep(0.1)  # Simulate processing
    
    # Image optimization, thumbnail generation, etc.
    logger.info(f"Processed image upload: {file_id}")

@app.post("/files/upload")
async def upload_file(
    file: UploadFile,
    current_user: CurrentUser,
    background_tasks: BackgroundTasks
):
    resource = await create_file_resource(db_session, current_user, file)
    
    # Queue image processing
    if resource.filetype.startswith("image/"):
        background_tasks.add_task(process_image_upload, resource.id)
    
    return resource

# Concurrent operations
async def bulk_process_posts(post_ids: list[UUID]):
    """Process multiple posts concurrently"""
    tasks = [process_single_post(post_id) for post_id in post_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Failed to process post {post_ids[i]}: {result}")
    
    return results
```

---

## Security Implementation

### Input Validation & Sanitization

```python
import bleach
from html import escape

class SecurePostCreationDTO(BaseModel):
    title: str = Field(max_length=100, min_length=1)
    description: str = Field(max_length=400)
    content: str = Field(min_length=1)
    
    @validator('title', 'description')
    def sanitize_text_fields(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        # Escape HTML to prevent XSS
        return escape(v.strip())
    
    @validator('content')
    def sanitize_content(cls, v):
        # Allow safe HTML tags for markdown content
        allowed_tags = [
            'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'code', 'pre'
        ]
        return bleach.clean(v, tags=allowed_tags, strip=True)

# SQL injection prevention (SQLModel handles this automatically)
def safe_search_posts(db_session: Session, search_term: str):
    # SQLModel automatically parameterizes queries
    return db_session.exec(
        select(Post).where(
            Post.title.ilike(f"%{search_term}%")  # Safe - parameterized
        )
    ).all()

# Dangerous - never do this
def unsafe_search(search_term: str):
    # DON'T: String interpolation can lead to SQL injection
    raw_query = f"SELECT * FROM post WHERE title LIKE '%{search_term}%'"
```

### Security Headers & Middleware

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.sessions import SessionMiddleware

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_env("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Trusted hosts (prevent host header injection)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=get_env("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HTTPS enforcement in production
    if not DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Rate limiting implementation
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(request: Request, data: LoginRequestDTO):
    # Rate-limited login endpoint
    pass

@app.post("/auth/register")
@limiter.limit("3/hour")  # 3 registrations per hour
async def register(request: Request, data: RegisterRequestDTO):
    # Rate-limited registration
    pass
```

---

## Error Handling Implementation

### Custom Exception Classes

```python
from fastapi import HTTPException

class FrusaBlogException(Exception):
    """Base exception for application-specific errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ValidationError(FrusaBlogException):
    def __init__(self, message: str):
        super().__init__(message, 400)

class NotFoundError(FrusaBlogException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(f"{resource} not found", 404)

class PermissionError(FrusaBlogException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, 403)

class AuthenticationError(FrusaBlogException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 401)
```
### Global Exception Handlers

```python
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError

@app.exception_handler(FrusaBlogException)
async def frusablog_exception_handler(request: Request, exc: FrusaBlogException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "type": exc.__class__.__name__
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "path": request.url.path
        }
    )

@app.exception_handler(PydanticValidationError)
async def validation_exception_handler(request: Request, exc: PydanticValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation failed",
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    if DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": str(exc),
                "type": exc.__class__.__name__
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "Internal server error"
            }
        )
```

### Utility Functions for Error Handling

```python
from typing import TypeVar, Optional

T = TypeVar('T')

def check_existence(
    obj: Optional[T], 
    detail: str = "Resource not found", 
    status_code: int = 404
) -> T:
    """Ensure object exists or raise HTTP exception"""
    if obj is None:
        raise HTTPException(status_code=status_code, detail=detail)
    return obj

def check_conditions(
    conditions: list[bool], 
    detail: str = "Condition failed",
    status_code: int = 400
):
    """Check multiple conditions and raise if any fail"""
    if not all(conditions):
        raise HTTPException(status_code=status_code, detail=detail)

def check_ownership(user: User, resource_user_id: str):
    """Check if user owns a resource"""
    if user.id != resource_user_id:
        raise PermissionError("You can only modify your own resources")

# Usage examples
async def get_post_by_id(db_session: Session, post_id: UUID) -> Post:
    post = db_session.get(Post, post_id)
    return check_existence(post, f"Post {post_id} not found")

async def update_post(
    db_session: Session, 
    current_user: User, 
    post_id: UUID, 
    data: PostUpdateDTO
) -> PostDTO:
    post = await get_post_by_id(db_session, post_id)
    
    # Check ownership unless admin
    if not any(role.name == "admin" for role in current_user.roles):
        check_ownership(current_user, post.user_id)
    
    # Update post
    for field, value in data.dict(exclude_unset=True).items():
        setattr(post, field, value)
    
    db_session.commit()
    return post.to_dto()
```

---

## Monitoring & Debugging

### Rich Logging Configuration

```python
from rich.console import Console
from rich.logging import RichHandler
from rich.traceback import install
import logging
import sys

# Install rich traceback handler
install(show_locals=DEBUG)

# Configure rich logging
logging.basicConfig(
    level=logging.INFO if not DEBUG else logging.DEBUG,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[
        RichHandler(
            rich_tracebacks=True,
            tracebacks_show_locals=DEBUG,
            console=Console(stderr=True)
        )
    ]
)

# Create logger
logger = logging.getLogger(__name__)

# Custom logging decorator
def log_execution_time(func_name: str = None):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            func_name_to_use = func_name or func.__name__
            
            try:
                result = await func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.info(
                    f"[green]{func_name_to_use}[/green] completed in "
                    f"[yellow]{execution_time:.3f}s[/yellow]"
                )
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(
                    f"[red]{func_name_to_use}[/red] failed after "
                    f"[yellow]{execution_time:.3f}s[/yellow]: {e}"
                )
                raise
        return wrapper
    return decorator

# Usage examples
@log_execution_time("Database Query")
async def expensive_query(db_session: Session):
    # Complex database operation
    pass

# Structured logging for key events
def log_user_action(user: User, action: str, resource: str = None, **context):
    logger.info(
        f"User [bold blue]{user.username}[/bold blue] "
        f"performed [green]{action}[/green]"
        f"{f' on {resource}' if resource else ''}"
    )
    
    # Additional context logging
    for key, value in context.items():
        logger.debug(f"  {key}: {value}")

# Usage in providers
async def create_post(db_session: Session, current_user: User, data: PostCreationDTO):
    log_user_action(
        user=current_user,
        action="create_post",
        resource=f"post:{data.title}",
        published=data.published,
        tag_count=len(data.tags)
    )
    
    # ... rest of implementation
```

### Health Checks & Monitoring

```python
from datetime import datetime, timezone
import psutil
import asyncio

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/detailed")
async def detailed_health_check(db_session: DBSessionDependency):
    """Detailed health check with system metrics"""
    start_time = time.time()
    
    # Test database connection
    try:
        db_session.exec(text("SELECT 1"))
        db_status = "healthy"
        db_latency = time.time() - start_time
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        db_latency = None
    
    # System metrics
    memory_usage = psutil.virtual_memory()
    cpu_usage = psutil.cpu_percent(interval=1)
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "checks": {
            "database": {
                "status": db_status,
                "latency_ms": round(db_latency * 1000, 2) if db_latency else None
            },
            "memory": {
                "usage_percent": memory_usage.percent,
                "available_mb": round(memory_usage.available / 1024 / 1024, 2)
            },
            "cpu": {
                "usage_percent": cpu_usage
            }
        }
    }

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(
        f"[cyan]{request.method}[/cyan] "
        f"[bold]{request.url.path}[/bold] "
        f"from {request.client.host if request.client else 'unknown'}"
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    status_color = "green" if response.status_code < 400 else "red"
    
    logger.info(
        f"[{status_color}]{response.status_code}[/{status_color}] "
        f"in [yellow]{process_time:.3f}s[/yellow]"
    )
    
    # Add response time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Performance monitoring
class PerformanceMetrics:
    def __init__(self):
        self.request_count = 0
        self.total_response_time = 0.0
        self.error_count = 0
    
    def record_request(self, response_time: float, status_code: int):
        self.request_count += 1
        self.total_response_time += response_time
        
        if status_code >= 400:
            self.error_count += 1
    
    @property
    def average_response_time(self) -> float:
        return self.total_response_time / self.request_count if self.request_count > 0 else 0
    
    @property
    def error_rate(self) -> float:
        return self.error_count / self.request_count if self.request_count > 0 else 0

metrics = PerformanceMetrics()

@app.get("/metrics")
async def get_metrics():
    """Application metrics endpoint"""
    return {
        "requests": {
            "total": metrics.request_count,
            "average_response_time": round(metrics.average_response_time, 3),
            "error_rate": round(metrics.error_rate * 100, 2)
        }
    }
```
