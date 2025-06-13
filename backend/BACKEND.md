# Backend Documentation

## Overview

The backend is a high-performance **FastAPI** application built with Python 3.13+, featuring email authentication, role-based permissions, file management, and a comprehensive blog content management system.

## Tech Stack

- **Framework**: FastAPI with async/await
- **Language**: Python 3.13+
- **Database**: PostgreSQL with SQLModel ORM
- **Migrations**: Alembic
- **Authentication**: Custom email-based system
- **File Storage**: Local filesystem (extensible)
- **Email**: SMTP with Jinja2 templates
- **Validation**: Pydantic v2
- **Package Manager**: UV
- **Containerization**: Docker + Docker Compose

## Architecture

### Project Structure
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

### Layered Architecture

1. **Controllers** (`/controllers/`): FastAPI route handlers
2. **Providers** (`/providers/`): Business logic and data processing
3. **Models** (`/core/db/models.py`): Database entities
4. **DTOs** (`/dto/`): Request/response data models
5. **Services** (`/core/services/`): External integrations

## Core Features

### 1. Email Authentication System
- **Passwordless**: No password storage or management
- **Email Verification**: Secure magic link authentication
- **Session Management**: Cookie-based sessions with expiration
- **Role-Based Access**: Admin and user roles with permissions

### 2. Content Management
- **Posts**: Rich markdown content with metadata
- **Comments**: Nested comment system (2 levels)
- **Tags**: Content categorization
- **Drafts**: Unpublished content management
- **Featured Posts**: Highlighted content system

### 3. File Management
- **Secure Upload**: Type and size validation
- **Permission-Based Access**: Public and protected files
- **UUID Naming**: Secure file identification
- **Streaming Downloads**: Efficient file serving

### 4. Permission System
- **Role-Based**: Users assigned to roles
- **Resource-Level**: Granular permissions per resource
- **Action-Based**: Different permission levels (read, write, admin)
- **Inheritance**: Admin role bypasses all checks

## Database Schema

### Core Models

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

## API Design Patterns

### Controller Pattern
Controllers handle HTTP requests and delegate to providers:

```python
@post_router.get("/posts", response_model=list[PostDTO])
async def get_posts(
    db_session: DBSessionDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=10)] = 10,
):
    return await post_provider.get_posts(
        db_session=db_session, skip=skip, limit=limit
    )
```

### Provider Pattern
Providers contain business logic and database operations:

```python
async def get_posts(db_session: Session, skip: int, limit: int):
    posts = db_session.exec(
        select(Post)
        .where(Post.archived == False, Post.published == True)
        .offset(skip)
        .limit(limit)
        .order_by(desc(Post.created_at))
    ).all()
    return [post.to_dto() for post in posts]
```

### DTO Pattern
Data Transfer Objects define API contracts:

```python
class PostCreationDTO(BaseModel):
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    cover: UUID | None = None
    content: str
    tags: list[TagDTO]
    published: bool
```

## Authentication System

### Email-Based Authentication Flow

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

## Permission System

### Role-Based Access Control

```python
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
        # Check if user has bypass role (admin)
        if any(role.name == self.bypass_role for role in self.roles):
            return True
        
        # Check specific permissions
        for role in self.roles:
            for pcheck_model in self.pcheck_models:
                if self._has_permission(role, pcheck_model):
                    if either:
                        return True
                elif not either:
                    raise HTTPException(status_code=HTTP_403_FORBIDDEN)
        
        return not either
```

### Usage in Providers
```python
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
    # ... rest of logic
```

## File Management System

### Secure File Upload
```python
async def create_file_resource(
    db_session: Session,
    current_user: User,
    file: UploadFile,
    protected: bool = False,
):
    # Validate file
    if file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="File too large")
    
    # Create database record
    resource = FileResource(
        user_id=current_user.id,
        name=file.filename,
        protected=protected,
        filetype=file.content_type,
    )
    
    # Save to filesystem
    storage.write_file(file, resource)
    
    # Create permissions
    rw_role = Role(users=[current_user])
    permission = PermissionBuilder() \
        .forRole(rw_role) \
        .withResourceName(FILE_RESOURCE) \
        .withResourceId(str(resource.id)) \
        .withActionName(ACTION_READWRITE) \
        .make()
    
    db_session.add_all([resource, rw_role, permission])
    db_session.commit()
```

### Secure File Serving
```python
async def get_file_resource(db_session: Session, user: User, resource_id: UUID):
    resource = check_existence(db_session.get(FileResource, resource_id))
    
    # Check permissions for protected files
    if resource.protected:
        PermissionChecker(
            roles=user.roles,
            db_session=db_session,
            pcheck_models=[
                PermissionCheckModel(
                    resource_name=FILE_RESOURCE,
                    resource_id=resource.id,
                    action_names=[ACTION_READ, ACTION_READWRITE],
                )
            ],
        ).check(either=True)
    
    # Stream file
    return StreamingResponse(
        content=BytesIO(storage.get_file(resource)),
        headers={
            "Content-Disposition": f"attachment; filename={resource.name}",
            "Content-Type": resource.filetype,
        },
    )
```

## Email System

### Template-Based Emails
```python
def send_templated_email(
    email: str,
    subject: str,
    template_name: str,
    context: dict,
    fallback_message: str = ""
):
    # Load template
    template_path = f"{EMAIL_TEMPLATES_PATH}/{template_name}.html"
    
    if os.path.exists(template_path):
        template = Template(open(template_path).read())
        html_content = template.render(**context)
    else:
        html_content = fallback_message
    
    # Send email
    send_email(email=email, subject=subject, message=html_content, html=True)
```

### Authentication Emails
```python
async def send_login_email(user: User, auth_session: AuthSession):
    login_url = f"{get_env('FRONTEND_URL')}/authenticate/{auth_session.id}"
    
    send_templated_email(
        email=user.email,
        subject="Login Request 🔐",
        template_name="login",
        context={
            "user": user,
            "login_url": login_url,
            "author_name": "Daniel Ametsowou",
        },
    )
```

## Database Operations

### Migration Management
```bash
# Create migration
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### Database Setup
```python
def setup_db():
    """Initialize database connection and create tables"""
    engine = create_engine(
        DATABASE_URL,
        echo=DEBUG,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    SQLModel.metadata.create_all(engine)
```

### Query Optimization
```python
# Efficient query with relationships
def get_posts_with_author_and_tags(db_session: Session):
    return db_session.exec(
        select(Post)
        .options(
            selectinload(Post.author),
            selectinload(Post.tags),
        )
        .where(Post.published == True)
        .order_by(desc(Post.created_at))
    ).all()
```

## Development Workflow

### Environment Setup
```bash
# Clone repository
git clone https://github.com/frusadev/frusablog.git
cd frusablog/backend

# Install dependencies
uv sync

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start development server
python main.py
```

### Environment Variables
```bash
# Database
DB_STRING=postgresql+psycopg2://user:pass@localhost:5432/frusablog
ALEMBIC_DB_URL=postgresql+psycopg2://user:pass@localhost:5432/frusablog

# Application
DEBUG=True
PORT=8000
STORAGE=fs/storage

# Email Configuration
EMAIL_APP_PASSWORD=your-smtp-app-password
APP_EMAIL_ADDRESS=your-email@domain.com
EMAIL_TEMPLATES_PATH=assets/templates/email/

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### Code Quality
```bash
# Format code
ruff format

# Check linting
ruff check

# Fix auto-fixable issues
ruff check --fix

# Type checking
mypy app/
```

### Testing
```bash
# Run tests
pytest

# With coverage
pytest --cov=app

# Specific test file
pytest tests/test_auth.py -v
```

## Docker Development

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: frusablog
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DB_STRING: postgresql+psycopg2://postgres:password@db:5432/frusablog
    volumes:
      - ./fs:/home/runner/app/fs
```

### Multi-Stage Dockerfile
```dockerfile
# Builder stage
FROM fedora:42 AS builder
RUN dnf install -y python3 python3-pip git gcc g++ && \
    pip3 install uv
USER runner
WORKDIR /home/runner/app
COPY ./pyproject.toml ./uv.lock ./
RUN python3 -m venv .venv && uv sync
COPY . .

# Production stage
FROM fedora:42 AS production
RUN dnf install -y python3 && useradd -m runner
USER runner
WORKDIR /home/runner/app
COPY --from=builder /home/runner/app /home/runner/app
EXPOSE 8000
CMD [".venv/bin/python", "main.py"]
```

## Performance Optimization

### Database Optimization
- **Connection Pooling**: SQLAlchemy connection pool
- **Query Optimization**: Eager loading with `selectinload`
- **Indexing**: Strategic database indexes
- **Pagination**: Limit large result sets

### Async Programming
```python
# Async endpoint
@app.get("/posts")
async def get_posts(db_session: AsyncSession = Depends(get_async_session)):
    result = await db_session.exec(select(Post).where(Post.published == True))
    return [post.to_dto() for post in result.all()]

# Background tasks
@app.post("/send-email")
async def send_email_endpoint(background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email_task, "user@example.com")
    return {"message": "Email queued"}
```

### Caching Strategy
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_featured_posts_cached(skip: int, limit: int) -> list[PostDTO]:
    # Cache frequently accessed data
    pass
```

## Security Best Practices

### Input Validation
```python
class PostCreationDTO(BaseModel):
    title: str = Field(max_length=100, min_length=1)
    description: str = Field(max_length=400)
    content: str = Field(min_length=1)
    
    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
```

### SQL Injection Prevention
```python
# Using SQLModel/SQLAlchemy (automatically parameterized)
posts = db_session.exec(
    select(Post).where(Post.title.ilike(f"%{search_term}%"))
).all()
```

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, data: LoginRequestDTO):
    # Rate-limited endpoint
    pass
```

## Error Handling

### Custom Exception Handler
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )
```

### Utility Functions
```python
def check_existence(obj, detail: str = "Resource not found", status_code: int = 404):
    """Ensure object exists or raise HTTP exception"""
    if obj is None:
        raise HTTPException(status_code=status_code, detail=detail)
    return obj

def check_conditions(conditions: list[bool], detail: str = "Condition failed"):
    """Check multiple conditions"""
    if not all(conditions):
        raise HTTPException(status_code=400, detail=detail)
```

## Monitoring & Logging

### Rich Logging
```python
from rich.console import Console
from rich.logging import RichHandler

# Configure rich logging
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(rich_tracebacks=True)]
)

logger = logging.getLogger(__name__)

# Usage
logger.info("User [bold blue]%s[/bold blue] created post", user.username)
logger.error("Failed to process file: %s", error, exc_info=True)
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }
```

## Deployment

### Production Configuration
```python
# Production settings
DEBUG = False
DATABASE_URL = os.getenv("DATABASE_URL")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# Security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### Container Deployment
```bash
# Build and run
docker build -t frusablog-api .
docker run -p 8000:8000 --env-file .env frusablog-api

# With Docker Compose
docker-compose up --build -d
```

This comprehensive backend documentation covers all aspects of the FastAPI application, from architecture and database design to deployment and security practices.
