# FrusaBlog - Full-Stack Personal Blog Platform

> A modern, production-ready blog platform built with **Next.js 15** (frontend) and **FastAPI** (backend), featuring passwordless authentication, admin dashboard, and comprehensive content management.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🚀 Features

### 🌐 Frontend (Next.js 15)
- **Modern Architecture**: Built with Next.js 15 App Router, TypeScript, and Tailwind CSS v4
- **Responsive Design**: Mobile-first design with beautiful, accessible layouts
- **Admin Dashboard**: Complete content management system with rich text editor
- **Dark/Light Theme**: System preference detection with manual toggle support
- **Search & Discovery**: Full-text search with advanced tag filtering
- **File Management**: Drag-and-drop file upload with image optimization
- **Real-time Updates**: Optimistic UI updates with TanStack Query
- **Authentication**: Passwordless email-based authentication flow

### ⚡ Backend (FastAPI)
- **High Performance**: FastAPI with async/await and Python 3.13+ 
- **Type Safety**: End-to-end type safety with Pydantic v2
- **Email Authentication**: Secure passwordless authentication system
- **Permission System**: Granular role-based access control
- **File Storage**: Secure file upload with validation and streaming
- **Database Migrations**: Alembic for schema versioning and management
- **Rich Logging**: Structured logging with beautiful terminal output
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

### 🛡️ Security & Performance
- **Passwordless Auth**: No password storage or management required
- **Session Security**: HTTP-only cookies with CSRF protection
- **Input Validation**: Comprehensive data validation on frontend and backend
- **File Security**: Type validation, size limits, and permission-based access
- **Performance**: Optimized queries, caching, and code splitting

## 🏗️ Project Architecture

```
frusablog/
├── 📁 backend/                  # FastAPI Backend Application
│   ├── 📁 app/                  # Main application package
│   │   ├── 📁 api/              # API layer with versioning
│   │   │   └── 📁 routes/v1/    # API version 1
│   │   │       ├── controllers/ # FastAPI route handlers
│   │   │       ├── dto/         # Data Transfer Objects (Pydantic models)
│   │   │       └── providers/   # Business logic layer
│   │   ├── 📁 core/             # Core application components
│   │   │   ├── config/          # Configuration management
│   │   │   ├── db/              # Database models & setup
│   │   │   ├── security/        # Authentication & permissions
│   │   │   └── services/        # External services (email, storage)
│   │   └── 📁 utils/            # Utility functions and helpers
│   ├── 📁 migrations/           # Alembic database migrations
│   ├── 📁 fs/storage/           # Local file storage directory
│   ├── 📁 assets/templates/     # Email and other templates
│   ├── 📄 main.py               # Application entry point
│   ├── 📄 pyproject.toml        # Python dependencies & project config
│   ├── 📄 docker-compose.yml    # Development environment setup
│   └── 📄 Dockerfile            # Backend container configuration
│
└── 📁 frontend/                 # Next.js Frontend Application
    ├── 📁 src/                  # Source code directory
    │   ├── 📁 app/              # Next.js App Router
    │   │   ├── (main)/          # Public blog interface
    │   │   ├── (auth)/          # Authentication pages
    │   │   └── (admin)/         # Admin dashboard & management
    │   ├── 📁 components/       # Reusable React components
    │   │   ├── ui/              # shadcn/ui components
    │   │   ├── data/            # Data display components
    │   │   ├── layouts/         # Layout and navigation components
    │   │   └── wrappers/        # HOCs and context providers
    │   ├── 📁 lib/              # Libraries and configurations
    │   │   ├── api/             # API client and TypeScript types
    │   │   ├── config/          # Application configuration
    │   │   └── utils/           # Utility functions and helpers
    │   └── 📁 hooks/            # Custom React hooks
    ├── 📁 public/               # Static assets
    ├── 📄 package.json          # Node.js dependencies
    ├── 📄 next.config.ts        # Next.js configuration
    ├── 📄 tailwind.config.ts    # Tailwind CSS configuration
    └── 📄 Dockerfile            # Frontend container configuration
```

### 🏛️ Architecture Patterns

#### Backend (Layered Architecture)
1. **Controllers** → HTTP request/response handling
2. **Providers** → Business logic and orchestration
3. **Models** → Database entities and relationships
4. **Services** → External integrations (email, storage)

#### Frontend (Component Architecture)
1. **Pages** → App Router pages with layouts
2. **Components** → Reusable UI components
3. **Hooks** → Custom logic and state management
4. **Libraries** → API clients and utilities

## 🛠️ Technology Stack

### 🎨 Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design system
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **State Management**: [TanStack Query](https://tanstack.com/query/) (React Query v5)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Rich Text**: [MDEditor](https://uiwjs.github.io/react-md-editor/) with React Markdown
- **Icons**: [Lucide React](https://lucide.dev/) icon library
- **Theme System**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Package Manager**: [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)

### ⚙️ Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with async/await
- **Language**: [Python 3.13+](https://www.python.org/) with type hints
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLModel](https://sqlmodel.tiangolo.com/) ORM
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) for database versioning
- **Authentication**: Custom email-based passwordless system
- **File Storage**: Local filesystem (extensible to cloud storage)
- **Email Service**: SMTP with [Jinja2](https://jinja.palletsprojects.com/) templates
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) for data validation
- **Package Manager**: [UV](https://github.com/astral-sh/uv) for dependency management
- **Code Quality**: [Ruff](https://github.com/astral-sh/ruff) for linting and formatting

### 🗄️ Database & Infrastructure
- **Database**: PostgreSQL 17 with optimized indexing
- **Migration System**: Alembic with automatic schema generation
- **Development**: Docker Compose for local development
- **Deployment**: Docker containers with multi-stage builds
- **Monitoring**: Health checks and structured logging

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js 18+** and **pnpm** (or bun)
- **Python 3.13+** and **UV** package manager
- **PostgreSQL 17** (or Docker for development)
- **Git** for version control

### 🐳 Quick Start with Docker (Recommended)

The fastest way to get the entire stack running:

```bash
# Clone the repository
git clone https://github.com/frusadev/frusablog.git
cd frusablog

# Start the backend services (API + Database)
cd backend
docker-compose up --build -d

# In a new terminal, start the frontend
cd ../frontend
pnpm install
pnpm dev
```

🌐 **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### ⚙️ Manual Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies with UV**
   ```bash
   uv sync
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Option 1: Use Docker for database only
   docker run --name frusablog-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=frusablog -p 5432:5432 -d postgres:17

   # Option 2: Use local PostgreSQL installation
   createdb frusablog
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the development server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000` 📡

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or with bun
   bun install
   ```

3. **Configure environment**
   ```bash
   # Create .env.local with API connection settings
   cat > .env.local << EOF
   NEXT_PUBLIC_SERVER_URL=http://localhost:8000
   NEXT_PUBLIC_API_VERSION=v1
   EOF
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or with bun
   bun dev
   ```

   The application will be available at `http://localhost:3000` 🌐

## � Documentation

### 📖 Core Documentation
- **[API Documentation](./API.md)** - Complete API reference with examples
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Frontend README](./frontend/README.md)** - Frontend-specific documentation
- **[Backend README](./backend/README.md)** - Backend setup and development
- **[Backend Developer Guide](./backend/BACKEND.md)** - Technical implementation details

### 🔗 Quick Links
- **[API Interactive Docs](http://localhost:8000/docs)** - Swagger UI (when running)
- **[Redoc API Docs](http://localhost:8000/redoc)** - Alternative API documentation
- **[Database Schema](#-database-schema)** - Data models and relationships

---

## 📊 API Overview

### 🔐 Authentication Endpoints
- `POST /v1/auth/email/register` - User registration with email
- `POST /v1/auth/email/login` - Login request (sends magic link email)
- `GET /v1/auth/email/authenticate/{session_id}` - Complete authentication via email link
- `POST /v1/auth/logout` - Logout and clear session

### 📝 Content Management
- `GET /v1/posts` - Get published posts (with pagination)
- `GET /v1/posts/featured` - Get featured posts
- `GET /v1/posts/drafts` - Get draft posts (authenticated)
- `GET /v1/posts/search?q={query}` - Search posts by title/content
- `GET /v1/post/{id}` - Get specific post by ID
- `POST /v1/post` - Create new post (authenticated)
- `PUT /v1/post/{id}` - Update post (authenticated)
- `DELETE /v1/post/{id}` - Delete post (authenticated)

### 💬 Comment System
- `GET /v1/comments/{post_id}` - Get post comments with threading
- `POST /v1/comment` - Create comment (authenticated)
- `PUT /v1/comment/{id}` - Update comment (authenticated)
- `DELETE /v1/comment/{id}` - Delete comment (authenticated)
- `POST /v1/comment/{id}/like` - Like/unlike comment (authenticated)

### 📎 File Management
- `POST /v1/resource` - Upload single file (authenticated)
- `POST /v1/resources` - Upload multiple files (authenticated)
- `GET /v1/resource/{id}` - Download/view file
- `DELETE /v1/resource/{id}` - Delete file (authenticated)

### 👤 User Management
- `GET /v1/users/me` - Get current user profile (authenticated)
- `GET /v1/users/me/can-post` - Check posting permissions (authenticated)
- `PUT /v1/users/me` - Update user profile (authenticated)

## 🗄️ Database Schema

### 👤 Core Models

#### User
```typescript
interface User {
  id: string;              // Unique user identifier
  username: string;        // Unique username
  name: string;           // Display name
  email: string;          // Email address (private)
  created_at: datetime;   // Account creation timestamp
  roles: Role[];          // Assigned roles for permissions
}
```

#### Post
```typescript
interface Post {
  id: UUID;               // Unique post identifier
  title: string;          // Post title (max 100 chars)
  description: string;    // Post description (max 400 chars)
  content: string;        // Markdown content
  cover?: UUID;           // Cover image file resource ID
  likes: number;          // Like count
  published: boolean;     // Publication status
  archived: boolean;      // Archive status
  featured: boolean;      // Featured status for homepage
  created_at: datetime;   // Creation timestamp
  author: User;           // Post author
  tags: Tag[];           // Associated tags
  comments: Comment[];    // Post comments
}
```

#### Comment
```typescript
interface Comment {
  id: UUID;               // Unique comment identifier
  content: string;        // Comment text
  likes: number;          // Like count
  level: number;          // Nesting level (0=top, 1=reply)
  created_at: datetime;   // Creation timestamp
  author: User;           // Comment author
  post: Post;             // Parent post
  parent?: Comment;       // Parent comment (for replies)
  children: Comment[];    // Child comments
}
```

#### Tag
```typescript
interface Tag {
  id: UUID;               // Unique tag identifier
  name: string;           // Tag name (unique)
  posts: Post[];          // Posts with this tag
}
```

### 🔐 Security Models

#### Role & Permission System
```typescript
interface Role {
  id: UUID;
  name: string;           // Role name (e.g., "admin", "user")
  description: string;
  users: User[];          // Users with this role
  permissions: Permission[];
}

interface Permission {
  id: UUID;
  role: Role;             // Associated role
  resource_name: string;  // Resource type (e.g., "post", "file")
  resource_id?: string;   // Specific resource ID (optional)
  action_name: string;    // Action type (e.g., "read", "write", "admin")
}
```

#### Authentication Sessions
```typescript
interface AuthSession {
  id: string;             // Session identifier for email links
  user: User;            // Associated user
  expires_at: datetime;   // Expiration time (1 hour)
  expired: boolean;       // Manual expiration flag
}

interface LoginSession {
  id: string;             // Session identifier for cookies
  user: User;            // Associated user
  expires_at: datetime;   // Expiration time (30 days)
  created_at: datetime;   // Creation timestamp
}
```

### 📎 File Management
```typescript
interface FileResource {
  id: UUID;               // Unique file identifier
  name: string;           // Original filename
  filetype: string;       // MIME type
  protected: boolean;     // Permission-based access
  created_at: datetime;   // Upload timestamp
  owner: User;            // File owner
}
```

## 🎨 Frontend Architecture

### 📱 App Router Structure
- **`(main)`** - Public blog interface
  - `/` - Homepage with featured and recent posts
  - `/posts` - All posts with pagination and filtering
  - `/post/[slug]` - Individual post view with comments
  - `/search` - Search interface with filters
- **`(auth)`** - Authentication flow
  - `/login` - Email-based login request
  - `/register` - User registration
  - `/authenticate/[session_id]` - Magic link authentication
- **`(admin)`** - Admin dashboard (authenticated)
  - `/admin` - Posts management dashboard
  - `/admin/posts/new` - Create new post
  - `/admin/posts/[id]/edit` - Edit existing post
  - `/admin/files` - File management interface

### 🧩 Component Architecture
```typescript
components/
├── ui/              // shadcn/ui components (Button, Input, etc.)
├── data/            // Data display components
│   ├── PostCard     // Post preview component
│   ├── CommentThread // Comment system
│   └── TagList      // Tag display
├── layouts/         // Layout components
│   ├── Navigation   // Site navigation
│   ├── Footer       // Site footer
│   └── Sidebar      // Content sidebar
└── wrappers/        // HOCs and providers
    ├── AuthGuard    // Authentication protection
    ├── ThemeProvider // Theme management
    └── QueryProvider // TanStack Query setup
```

### 🔄 State Management Strategy
- **Server State**: TanStack Query for API data caching
- **Global State**: React Context for user and theme state
- **Form State**: React Hook Form with Zod validation
- **Local State**: useState for component-specific UI state

## 🔒 Security Features

### 🛡️ Authentication & Authorization
- **Passwordless Authentication**: Secure email-based magic link system
- **Session Management**: HTTP-only cookies with CSRF protection
- **Role-Based Access Control**: Granular permission system for resources
- **Permission Inheritance**: Admin role bypasses specific permission checks
- **Session Expiration**: Automatic cleanup of expired auth sessions

### 📁 File Security
- **Upload Validation**: MIME type detection and file size restrictions
- **Protected Resources**: Permission-based file access control
- **Secure Storage**: UUID-based file naming to prevent enumeration
- **Content-Type Validation**: Server-side file type verification
- **Access Logging**: Comprehensive file access tracking

### 🔍 Data Validation & Protection
- **Frontend Validation**: Zod schema validation with TypeScript
- **Backend Validation**: Pydantic model validation with Python
- **SQL Injection Prevention**: Parameterized queries with SQLModel
- **XSS Protection**: HTML sanitization and CSP headers
- **Input Sanitization**: Comprehensive input cleaning and validation
- **Type Safety**: End-to-end type safety across the stack

## 🎯 Key Features Deep Dive

### 📊 Admin Dashboard
- **Content Management**: Create, edit, delete, and organize blog posts
- **Draft System**: Save and manage unpublished content with auto-save
- **Featured Posts**: Highlight important content on homepage
- **Tag Management**: Create and organize content categories
- **File Upload**: Drag-and-drop file management with image preview
- **Analytics**: View post performance and engagement metrics
- **Search & Filter**: Advanced content discovery and organization tools

### ✍️ Rich Text Editor
- **Markdown Support**: Full GitHub-flavored markdown syntax
- **Live Preview**: Real-time split-pane preview mode
- **Syntax Highlighting**: Code block highlighting with multiple languages
- **Image Embedding**: Direct image uploads with automatic optimization
- **Table Support**: Rich table editing and formatting
- **Link Management**: Easy link insertion and validation
- **Auto-Save**: Automatic draft saving to prevent data loss

### 💬 Comment System
- **Nested Threading**: Two-level comment threading for discussions
- **Like System**: User engagement tracking with optimistic updates
- **Real-time Updates**: Live comment updates without page refresh
- **Moderation Tools**: Admin comment management and spam protection
- **User Mentions**: @mention system for user notifications
- **Comment Editing**: Edit and delete capabilities with version history

### 📧 Email System
- **Beautiful Templates**: Responsive HTML email templates with Jinja2
- **Authentication Emails**: Secure magic link emails for login/registration
- **Welcome Series**: Automated welcome email sequence for new users
- **Notification System**: Comment and mention notifications
- **Template Management**: Easy email template customization
- **Delivery Tracking**: Email delivery status and analytics

## � Development Workflow

### 🧪 Code Quality & Testing
```bash
# Frontend quality checks
cd frontend
pnpm lint          # ESLint with TypeScript rules
pnpm format        # Prettier code formatting
pnpm type-check    # TypeScript strict mode checking
pnpm test          # Jest with React Testing Library
pnpm test:e2e      # Playwright end-to-end tests

# Backend quality checks
cd backend
ruff check         # Fast Python linting
ruff format        # Code formatting
pytest             # Comprehensive test suite
pytest --cov=app  # Coverage reporting
mypy app/          # Type checking
```

### 🚀 Deployment Options

#### Production Deployment
- **Frontend**: Optimized for Vercel, Netlify, or Docker deployment
- **Backend**: Docker containerization with multi-stage builds
- **Database**: PostgreSQL with connection pooling and migrations
- **CDN**: Static asset optimization and caching

#### Development Deployment
- **Docker Compose**: Complete local development stack
- **Hot Reload**: Live reload for both frontend and backend
- **Database Seeding**: Sample data for development and testing

## ⚡ Performance Optimizations

### � Frontend Performance
- **Next.js App Router**: Latest routing with automatic code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching Strategy**: TanStack Query with intelligent cache invalidation
- **Lazy Loading**: Component-level lazy loading for better LCP
- **Static Generation**: ISR (Incremental Static Regeneration) for posts
- **Web Vitals**: Optimized Core Web Vitals scores

### ⚙️ Backend Performance
- **Async Architecture**: Full async/await implementation with uvloop
- **Database Optimization**: Efficient SQLModel queries with eager loading
- **Connection Pooling**: PostgreSQL connection pool management
- **Response Streaming**: Efficient file serving with range requests
- **Query Optimization**: Strategic database indexing and query planning
- **Background Tasks**: Non-blocking email and file processing
- **Health Monitoring**: Performance metrics and monitoring endpoints

---

## �🌍 Environment Configuration

### 🔧 Backend Environment Variables
```bash
# Database
DB_STRING=postgresql+psycopg2://user:pass@localhost:5432/frusablog
ALEMBIC_DB_URL=postgresql+psycopg2://user:pass@localhost:5432/frusablog

# Application
DEBUG=True
PORT=8000
STORAGE=fs/storage

# Email (for authentication)
EMAIL_APP_PASSWORD=your-app-password
APP_EMAIL_ADDRESS=your-email@domain.com
EMAIL_TEMPLATES_PATH=assets/templates/email/

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### 🎨 Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_URL=http://localhost:8000/v1

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🚀 Quick Contribution Guide

1. **🍴 Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/frusablog.git
   cd frusablog
   ```

2. **🌿 Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or for bug fixes
   git checkout -b bugfix/issue-description
   ```

3. **💻 Make your changes**
   - Follow the existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

4. **🧪 Run quality checks**
   ```bash
   # Backend checks
   cd backend
   ruff check && ruff format
   pytest
   
   # Frontend checks
   cd ../frontend
   pnpm lint && pnpm type-check
   pnpm test
   ```

5. **📝 Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing new feature"
   # or
   git commit -m "fix: resolve login issue"
   # or
   git commit -m "docs: update API documentation"
   ```

6. **🚀 Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   # Then create a Pull Request on GitHub
   ```

### 📋 Contribution Guidelines

- **Code Style**: Follow existing patterns and use the configured linters
- **Testing**: Add tests for new features and ensure existing tests pass
- **Documentation**: Update relevant documentation for API or feature changes
- **Commit Messages**: Use conventional commits (feat, fix, docs, etc.)
- **Pull Requests**: Provide clear description of changes and link any issues

### 🐛 Bug Reports & Feature Requests

- **Bug Reports**: Use the GitHub issue template with reproduction steps
- **Feature Requests**: Describe the feature and its use case clearly
- **Security Issues**: Report privately via email first

## � Troubleshooting

### 🔧 Common Issues & Solutions

#### Backend Issues
```bash
# Database connection issues
❌ Error: "could not connect to server"
✅ Solution: Ensure PostgreSQL is running and credentials are correct
   docker ps  # Check if database container is running
   docker-compose logs db  # Check database logs

# Migration errors
❌ Error: "Target database is not up to date"
✅ Solution: Run migrations
   alembic upgrade head

# Email configuration issues
❌ Error: "Authentication failed" for SMTP
✅ Solution: Check email app password and SMTP settings
   # For Gmail, use App Password, not regular password
```

#### Docker Issues
```bash
# Port conflicts
❌ Error: "Port already in use"
✅ Solution: Stop conflicting services or change ports
   docker-compose down
   lsof -i :8000  # Check what's using the port

# Volume permission issues
❌ Error: "Permission denied" for file uploads
✅ Solution: Fix volume permissions
   docker-compose down
   sudo chown -R $USER:$USER backend/fs
   docker-compose up
```

### 📞 Getting Help

- **📖 Documentation**: Check the [API.md](./API.md) and component READMEs
- **🐛 Issues**: Search existing issues or create a new one
- **💬 Discussions**: Use GitHub Discussions for questions
- **📧 Email**: Contact [@frusadev](https://github.com/frusadev) for urgent issues

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Useful Links & Resources

### 📚 Documentation & Tutorials
- **[Next.js 15 Documentation](https://nextjs.org/docs)** - Next.js framework documentation
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)** - FastAPI framework guide
- **[shadcn/ui Components](https://ui.shadcn.com/)** - UI component library
- **[TanStack Query](https://tanstack.com/query/latest)** - Data fetching and caching
- **[SQLModel Documentation](https://sqlmodel.tiangolo.com/)** - Database ORM
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework

### �️ Development Tools
- **[UV Documentation](https://github.com/astral-sh/uv)** - Python package manager
- **[Ruff Documentation](https://github.com/astral-sh/ruff)** - Python linter
- **[Alembic Documentation](https://alembic.sqlalchemy.org/)** - Database migrations
- **[pnpm Documentation](https://pnpm.io/)** - Node.js package manager

### 🚀 Deployment & Hosting
- **[Vercel](https://vercel.com/)** - Frontend deployment platform
- **[Railway](https://railway.app/)** - Full-stack deployment
- **[Docker Hub](https://hub.docker.com/)** - Container registry
- **[PostgreSQL Cloud](https://www.postgresql.org/download/)** - Database hosting

---

## �📧 Contact & Support

**👨‍💻 Developer**: Daniel Ametsowou  
**🐙 GitHub**: [@frusadev](https://github.com/frusadev)  
**🔗 Project**: [https://github.com/frusadev/frusablog](https://github.com/frusadev/frusablog)

### 🤝 Community
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/frusadev/frusablog/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/frusadev/frusablog/discussions)
- **📧 Direct Contact**: Open an issue for feature requests or questions

---

<div align="center">

**Built with ❤️ using modern web technologies**

*FrusaBlog - Where ideas come to life* ✨

[![GitHub stars](https://img.shields.io/github/stars/frusadev/frusablog?style=social)](https://github.com/frusadev/frusablog/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/frusadev/frusablog?style=social)](https://github.com/frusadev/frusablog/network/members)

</div>
