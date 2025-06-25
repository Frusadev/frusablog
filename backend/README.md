# FrusaBlog Backend

> FastAPI backend for the FrusaBlog platform with email authentication, role-based permissions, and comprehensive content management

## 🚀 Overview

This is the backend API for **FrusaBlog** - a modern blog platform built with FastAPI and Python 3.13+. It provides a robust foundation for content management, user authentication, file handling, and email services with a focus on security, performance, and developer experience.

**🌐 API Base URL:** [localhost:8000](http://localhost:8000)

---

## � Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [Authentication System](#-authentication-system)
- [API Documentation](#-api-documentation)
- [Development Workflow](#-development-workflow)
- [Docker Development](#-docker-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🛠 Tech Stack

### Core Framework
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[Python 3.13+](https://www.python.org/)** - Latest Python with enhanced performance
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server with uvloop for high performance

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[SQLModel](https://sqlmodel.tiangolo.com/)** - Type-safe ORM built on SQLAlchemy 2.0
- **[Alembic](https://alembic.sqlalchemy.org/)** - Database migration management
- **[asyncpg](https://github.com/MagicStack/asyncpg)** - High-performance async PostgreSQL driver

### Authentication & Security
- **Custom Email Auth** - Passwordless authentication system
- **Role-Based Permissions** - Granular access control

### Development & Quality
- **[UV](https://github.com/astral-sh/uv)** - Ultra-fast Python package manager
- **[Ruff](https://github.com/astral-sh/ruff)** - Blazing fast linter and formatter
- **[Rich](https://github.com/Textualize/rich)** - Beautiful terminal formatting
- **[Pydantic v2](https://docs.pydantic.dev/)** - Data validation and serialization

### Infrastructure
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Jinja2](https://jinja.palletsprojects.com/)** - Template engine for emails
- **[SMTP](https://docs.python.org/3/library/smtplib.html)** - Email delivery system

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Passwordless Authentication** - Email-based magic link system
- **Session Management** - Secure cookie-based sessions
- **Role-Based Access Control** - Flexible permission system
- **Email Verification** - Secure user registration flow

### 📝 Content Management
- **Blog Posts** - Full CRUD with rich markdown support
- **Draft System** - Save and manage unpublished content
- **Comments System** - Nested comments with moderation
- **Tag Management** - Content categorization and filtering
- **Featured Posts** - Highlight important content

### 📁 File Management
- **Secure Upload** - Type and size validation
- **Permission-Based Access** - Public and protected files
- **Streaming Downloads** - Efficient file serving
- **UUID Naming** - Secure file identification

### 📊 Analytics & Tracking
- **View Tracking** - Monitor post engagement
- **User Analytics** - Track user behavior
- **Performance Metrics** - System monitoring
- **Visit Statistics** - Detailed analytics data

### 🚀 Performance & Scalability
- **Async/Await** - Full asynchronous request handling
- **Connection Pooling** - Efficient database connections
- **Rate Limiting** - API abuse prevention
- **Optimized Queries** - Efficient database operations

---

## 🏗 Architecture

### Project Structure
```
backend/
├── app/                        # Main application package
│   ├── api/                    # API layer
│   │   └── routes/v1/          # API version 1
│   │       ├── controllers/    # FastAPI route handlers
│   │       │   ├── auth.py    # Authentication endpoints
│   │       │   ├── post.py    # Blog post endpoints
│   │       │   ├── comment.py # Comment management
│   │       │   ├── user.py    # User management
│   │       │   ├── file.py    # File upload/download
│   │       │   ├── tag.py     # Tag management
│   │       │   └── stats.py   # Analytics endpoints
│   │       ├── dto/           # Data Transfer Objects (Pydantic models)
│   │       │   ├── auth.py    # Authentication DTOs
│   │       │   ├── post.py    # Post DTOs
│   │       │   ├── comment.py # Comment DTOs
│   │       │   ├── user.py    # User DTOs
│   │       │   ├── file.py    # File DTOs
│   │       │   └── base.py    # Base DTO classes
│   │       └── providers/     # Business logic layer
│   │           ├── auth.py    # Authentication logic
│   │           ├── post.py    # Post management logic
│   │           ├── comment.py # Comment handling
│   │           ├── user.py    # User operations
│   │           ├── file.py    # File management
│   │           ├── tag.py     # Tag operations
│   │           └── stats.py   # Analytics logic
│   ├── core/                  # Core application logic
│   │   ├── config/            # Configuration management
│   │   │   └── env.py        # Environment variables
│   │   ├── db/               # Database layer
│   │   │   ├── models.py     # SQLModel database models
│   │   │   ├── setup.py      # Database connection setup
│   │   │   ├── utils.py      # Database utilities
│   │   │   └── builders/     # Query builders and helpers
│   │   ├── security/         # Security & permissions
│   │   │   ├── checkers.py   # Permission checking logic
│   │   │   └── permissions.py # Permission models
│   │   ├── services/         # External services
│   │   │   ├── email.py      # SMTP email service
│   │   │   ├── templating.py # Jinja2 template rendering
│   │   │   └── storage.py    # File storage service
│   │   └── logging/          # Logging configuration
│   │       └── log.py        # Rich logging setup
│   ├── utils/                # Utility functions
│   │   ├── crypto.py         # Cryptographic helpers
│   │   └── date.py           # Date/time utilities
│   └── app.py                # FastAPI application factory
├── migrations/               # Alembic database migrations
│   ├── env.py               # Alembic environment setup
│   ├── script.py.mako       # Migration template
│   └── versions/            # Migration files
├── fs/storage/              # Local file storage directory
├── assets/                  # Static assets
│   └── templates/           # Email templates
│       └── email/           # HTML email templates
├── main.py                  # Application entry point
├── pyproject.toml           # Project dependencies and configuration
├── alembic.ini             # Alembic configuration
├── ruff.toml               # Code formatting configuration
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Development environment
└── .env.example           # Environment variables template
```

### Layered Architecture

1. **Controllers** (`/api/routes/v1/controllers/`) - FastAPI route handlers
   - Handle HTTP requests and responses
   - Input validation and serialization
   - Authentication and authorization checks

2. **Providers** (`/api/routes/v1/providers/`) - Business logic layer
   - Core business operations
   - Database interactions
   - Data transformation and validation

3. **Models** (`/core/db/models.py`) - Database entities
   - SQLModel table definitions
   - Relationships and constraints
   - Data validation rules

4. **DTOs** (`/api/routes/v1/dto/`) - Data Transfer Objects
   - Request/response schemas
   - Pydantic validation models
   - API contract definitions

5. **Services** (`/core/services/`) - External integrations
   - Email delivery
   - File storage
   - Template rendering

### API Versioning
- **v1** - Current stable API version
- **RESTful Design** - Consistent resource-based URLs
- **JSON API** - Standardized request/response format

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.13+** - Latest Python version
- **PostgreSQL 15+** - Database server
- **UV** - Python package manager (recommended)
- **Docker** - For containerized development (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frusablog/backend
   ```

2. **Install dependencies**
   ```bash
   # Using UV (recommended)
   uv sync
   
   # Or using pip
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Database Configuration
   DB_STRING=postgresql+psycopg2://user:password@localhost:5432/frusablog
   ALEMBIC_DB_URL=postgresql+psycopg2://user:password@localhost:5432/frusablog
   
   # Application Settings
   DEBUG=True
   PORT=8000
   STORAGE=fs/storage
   
   # Email Configuration
   EMAIL_APP_PASSWORD=your-smtp-app-password
   APP_EMAIL_ADDRESS=noreply@yourdomain.com
   EMAIL_TEMPLATES_PATH=assets/templates/email/
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:8000
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb frusablog
   
   # Run migrations
   alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   # Using UV
   uv run python main.py
   
   # Or directly
   python main.py
   ```

6. **Access the API**
   - **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### Available Commands

```bash
# Development server
python main.py

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1

# Code formatting and linting
ruff format .
ruff check .
ruff check --fix .

# Type checking
mypy app/

# Run tests
pytest
pytest --cov=app
```

## 📊 Database Schema

### Core Models

#### User Model
```python
class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(10), primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
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

---

## 🔐 Authentication System

### Email-Based Authentication Flow

The backend implements a passwordless authentication system using email magic links:

1. **Registration/Login Request**
   ```python
   # User submits email for registration/login
   POST /v1/auth/register
   {
     "email": "user@example.com",
     "username": "johndoe",
     "name": "John Doe"
   }
   ```

2. **Magic Link Generation**
   ```python
   # Backend creates auth session and sends email
   auth_session = AuthSession(user_id=user.id)
   db_session.add(auth_session)
   
   # Send email with magic link
   login_url = f"{FRONTEND_URL}/authenticate/{auth_session.id}"
   send_templated_email(user.email, "Login Request", "login", {
       "user": user,
       "login_url": login_url
   })
   ```

3. **Email Verification**
   ```python
   # User clicks magic link, frontend calls:
   POST /v1/auth/authenticate/{auth_session_id}
   
   # Backend validates and creates login session
   login_session = LoginSession(user_id=auth_session.user_id)
   response.set_cookie("login_session_id", login_session.id, httponly=True)
   ```

4. **Session Validation**
   ```python
   # For protected endpoints, extract user from session
   @router.get("/protected")
   async def protected_endpoint(current_user: User = Depends(get_current_user)):
       return {"user": current_user.to_dto()}
   ```

### Permission System

Role-based access control with granular permissions:

```python
# Check user permissions
PermissionChecker(
    db_session=db_session,
    roles=current_user.roles,
    pcheck_models=[
        GlobalPermissionCheckModel(
            resource_name="posts",
            action_names=["read", "write"]
        )
    ]
).check()
```

---

## 📚 API Documentation

### API Endpoints Overview

#### Authentication (`/v1/auth/email`)
- `POST /register` - User registration
- `POST /login` - User login (sends magic link)
- `POST /authenticate/{session_id}` - Verify magic link
- `GET /me` - Get current user info

#### Posts (`/v1/posts/`)
- `GET /posts` - List published posts
- `POST /posts` - Create new post
- `GET /posts/{id}` - Get specific post
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `GET /posts/featured` - Get featured posts
- `GET /posts/drafts` - Get draft posts

#### Comments (`/v1/comments/`)
- `GET /posts/{post_id}/comments` - Get post comments
- `POST /posts/{post_id}/comments` - Create comment
- `PUT /comments/{id}` - Update comment
- `DELETE /comments/{id}` - Delete comment
- `POST /comments/{id}/like` - Like/unlike comment

#### File Management (`/v1/resources/`)
- `POST /files` - Upload file
- `GET /files/{id}` - Download file
- `GET /files` - List user files
- `DELETE /files/{id}` - Delete file

#### Analytics (`/v1/stats/`)
- `GET /stats/public` - Public statistics
- `GET /stats/admin` - Admin analytics
- `POST /stats/visit` - Track page visit

### Request/Response Examples

#### Create Post
```bash
curl -X POST "http://localhost:8000/v1/posts" \
  -H "Content-Type: application/json" \
  -H "Cookie: login_session_id=xyz" \
  -d '{
    "title": "My Blog Post",
    "description": "A great post about technology",
    "content": "# Hello World\n\nThis is my post content.",
    "published": true,
    "tags": [{"name": "technology"}]
  }'
```

#### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "My Blog Post",
  "description": "A great post about technology",
  "content": "# Hello World\n\nThis is my post content.",
  "published": true,
  "created_at": "2025-01-01T12:00:00Z",
  "author": {
    "id": "user123",
    "username": "johndoe",
    "name": "John Doe"
  },
  "tags": [{"id": 1, "name": "technology"}]
}
```

---

## 🔄 Development Workflow

### Code Quality Tools

```bash
# Format code with Ruff
ruff format .

# Check for issues
ruff check .

# Fix auto-fixable issues
ruff check --fix .

# Type checking (if using mypy)
mypy app/
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history --verbose
```

### Environment Configuration

The application uses environment variables for configuration:

```bash
# Database
DB_STRING=postgresql+psycopg2://user:pass@localhost:5432/frusablog
ALEMBIC_DB_URL=postgresql+psycopg2://user:pass@localhost:5432/frusablog

# Application
DEBUG=True
PORT=8000
STORAGE=fs/storage

# Email (Gmail example)
EMAIL_APP_PASSWORD=your-gmail-app-password
APP_EMAIL_ADDRESS=your-email@gmail.com
EMAIL_TEMPLATES_PATH=assets/templates/email/

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

---

## 🐳 Docker Development

### Docker Compose Setup

The project includes a complete Docker Compose configuration:

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
      - ./assets:/home/runner/app/assets
```

### Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Run migrations in container
docker-compose exec api alembic upgrade head

# Access database
docker-compose exec db psql -U postgres -d frusablog

# Rebuild and restart
docker-compose up --build
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

---

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Build the production image**
   ```bash
   docker build -t frusablog-backend .
   ```

2. **Run with environment variables**
   ```bash
   docker run -d \
     --name frusablog-api \
     -p 8000:8000 \
     -e DB_STRING="postgresql+psycopg2://user:pass@host:5432/db" \
     -e EMAIL_APP_PASSWORD="your-email-password" \
     -e APP_EMAIL_ADDRESS="noreply@yourdomain.com" \
     -e FRONTEND_URL="https://yourdomain.com" \
     -v $(pwd)/fs:/home/runner/app/fs \
     frusablog-backend
   ```

3. **Using Docker Compose**
   ```bash
   # Production compose file
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

For traditional server deployment:

```bash
# Install dependencies
uv sync --no-dev

# Set production environment variables
export DEBUG=False
export DB_STRING="your-production-db-url"

# Run migrations
alembic upgrade head

uv run main.py
```

### Environment Variables for Production

```env
# Security
DEBUG=False
SECRET_KEY=your-secret-key

# Database
DB_STRING=postgresql+psycopg2://user:pass@host:5432/frusablog

# Email (production SMTP)
EMAIL_APP_PASSWORD=production-email-password
APP_EMAIL_ADDRESS=noreply@yourdomain.com

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Storage
STORAGE=/app/storage
```

---

## 🤝 Contributing

### Getting Started
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Run** tests and linting
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines
- **Follow** the existing code style (use `ruff format`)
- **Add** type hints for all functions
- **Write** tests for new features
- **Update** documentation for API changes
- **Use** descriptive commit messages
- **Keep** functions small and focused

### Code Standards
- **Type Safety**: Use type hints throughout
- **Error Handling**: Proper exception handling and logging
- **Security**: Validate all inputs, use permissions appropriately
- **Performance**: Consider database query optimization
- **Documentation**: Document complex business logic

### Pull Request Process
1. **Update** API documentation for new endpoints
2. **Add** tests for new functionality
3. **Ensure** all existing tests pass
4. **Follow** the existing code structure
5. **Include** migration files if database changes are made

---

## 📚 Learn More

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community
- [FastAPI GitHub](https://github.com/tiangolo/fastapi)
- [SQLModel GitHub](https://github.com/tiangolo/sqlmodel)
- [Pydantic GitHub](https://github.com/pydantic/pydantic)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 📧 Contact

**Daniel Ametsowou** - [@frusadev](https://github.com/frusadev)

Project Link: [https://github.com/frusadev/frusablog](https://github.com/frusadev/frusablog)

---

*Built with ❤️ using modern Python technologies*
   ```bash
   git clone https://github.com/Frusadev/fastapi-template.git
   cd fastapi-template
   ```

2. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Install dependencies**
   ```bash
   # Using UV (recommended)
   uv sync
   
   # Or using pip
   pip install -e .
   ```

4. **Set up database**
   ```bash
   # Initialize Alembic (if needed)
   alembic init migrations
   
   # Create migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   alembic upgrade head
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Docker Development

1. **Using Docker Compose**
   ```bash
   # Start all services (app + PostgreSQL)
   docker-compose up --build
   
   # Run in background
   docker-compose up -d --build
   ```

2. **Using Docker only**
   ```bash
   # Build image
   docker build -t fastapi-template .
   
   # Run container
   docker run -p 8000:8000 --env-file .env fastapi-template
   ```

## ⚙️ Configuration

### Environment Variables

Configure your application using the `.env` file:

```bash
# Database Configuration
DB_STRING="postgresql+psycopg2://username:password@db:5432/yourdb"
ALEMBIC_DB_URL="postgresql+psycopg2://username:password@db:5432/yourdb"

# Application Configuration
DEBUG=True
PORT=8000

# Email Configuration
EMAIL_APP_PASSWORD="your-app-password"
APP_EMAIL_ADDRESS="your-email@domain.com"
EMAIL_TEMPLATES_PATH="assets/templates/email/"
```

### Database Configuration

The template supports multiple database backends through SQLModel:

- **PostgreSQL** (recommended for production)
- **SQLite** (for development/testing)

Update the `DB_STRING` in your `.env` file according to your database choice.

## 📊 Database Operations

### Creating Models

Define your database models in `app/core/db/models.py`:

```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    is_active: bool = Field(default=True)
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback to previous migration
alembic downgrade -1

# View migration history
alembic history
```

## 📧 Email Service

The template includes a comprehensive email service with template support:

### Basic Email

```python
from app.core.services.email import send_email

send_email(
    email="user@example.com",
    subject="Welcome!",
    message="Welcome to our service!",
    html=False
)
```

### Templated Email

```python
from app.core.services.email import send_templated_email

send_templated_email(
    email="user@example.com",
    subject="Welcome!",
    template_name="welcome",
    context={"name": "John Doe", "app_name": "MyApp"},
    fallback_message="Welcome to our service!"
)
```

### Email Templates

Create HTML templates in your configured templates directory:

```html
<!-- assets/templates/email/welcome.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ app_name }}</title>
</head>
<body>
    <h1>Welcome, {{ name }}!</h1>
    <p>Thank you for joining {{ app_name }}.</p>
</body>
</html>
```

## 🔍 Logging

The template includes a rich logging system with colored console output and file logging:

```python
from app.core.logging.log import log_info, log_warning, log_error, log_success

log_info("Application started")
log_warning("This is a warning")
log_error("An error occurred")
log_success("Operation completed successfully")
```

## 🛡️ Security

The template includes a security framework structure for implementing authentication and authorization:

- Security framework structure in `app/core/security/`
- Cryptographic utilities in `app/utils/crypto.py` for ID and OTP generation
- CORS middleware configured for local development

### Cryptographic Utilities

The template includes secure utilities for generating IDs and one-time passwords:

```python
from app.utils.crypto import gen_id, gen_otp

# Generate secure URL-safe ID
user_id = gen_id(32)  # Returns 32-character URL-safe string

# Generate numeric OTP
otp_code = gen_otp(6)  # Returns 6-digit numeric string
```

## 🚀 API Development

### Creating Routes

1. **Create controllers** in `app/api/routes/v1/controllers/`
2. **Define DTOs** in `app/api/routes/v1/dto/`
3. **Set up providers** in `app/api/routes/v1/providers/`

Example controller:

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db.setup import create_db_session

router = APIRouter()

@router.get("/users")
async def get_users(session: Session = Depends(create_db_session)):
    # Your logic here
    return {"users": []}
```

### Register Routes

Add your routes to the main application in `app/app.py`:

```python
from app.api.routes.v1.controllers.users import router as users_router

app.include_router(users_router, prefix="/v1", tags=["users"])
```

## 🧪 Testing

The template is ready for testing with pytest:

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 🔧 Development Tools

### Code Formatting and Linting

The project uses Ruff for code formatting and linting:

```bash
# Format code
ruff format

# Check for linting issues
ruff check

# Fix auto-fixable issues
ruff check --fix
```

### UV Package Manager

The template is optimized for UV, a fast Python package manager:

```bash
# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Update dependencies
uv sync --upgrade
```

## 📦 Dependencies

### Core Dependencies

- **FastAPI[standard]**: Web framework with all standard features
- **SQLModel**: Database ORM with type safety
- **Alembic**: Database migration tool
- **AsyncPG**: Async PostgreSQL driver
- **Psycopg2-binary**: PostgreSQL adapter
- **Uvloop**: High-performance event loop
- **Rich**: Rich console output
- **SlowAPI**: Rate limiting
- **Passlib[bcrypt]**: Password hashing
- **Piccolo**: Additional database tools
- **WebSockets**: WebSocket support
- **Python-dotenv**: Environment variable loading
- **Jinja2**: Template engine (for email templates)

## 🐳 Docker

### Multi-stage Dockerfile

The template includes an optimized multi-stage Dockerfile:

- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Minimal runtime image

### Docker Compose

Includes PostgreSQL database service with volume persistence.

## 📝 Environment Configuration

The `env.py` module provides type-safe environment variable access:

```python
from app.core.config.env import get_env

# Get environment variable with default
db_url = get_env("DB_STRING", "sqlite:///./test.db")

# Type-safe environment keys
debug = get_env("DEBUG", "False") == "True"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This template is provided as-is for educational and development purposes.

## 🔗 Useful Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [UV Documentation](https://docs.astral.sh/uv/)
