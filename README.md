# FrusaBlog - Full-Stack Personal Blog Platform

A modern, full-stack personal blog platform built with **Next.js 15** (frontend) and **FastAPI** (backend), featuring admin dashboard, email authentication, content management, and more.

## 🚀 Features

### Frontend (Next.js 15)
- **Modern UI/UX**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first design with beautiful layouts
- **Admin Dashboard**: Complete content management system
- **Rich Text Editor**: Markdown support with syntax highlighting
- **Dark/Light Theme**: System preference detection with manual toggle
- **Search & Filtering**: Full-text search with tag filtering
- **Image Management**: File upload and management system
- **Real-time Updates**: Optimistic updates with React Query

### Backend (FastAPI)
- **High Performance**: FastAPI with async/await support
- **Type Safety**: Full TypeScript/Python type safety
- **Email Authentication**: Secure passwordless authentication
- **Role-Based Permissions**: Granular permission system
- **File Management**: Secure file upload and storage
- **Database Migrations**: Alembic for schema versioning
- **Rich Logging**: Structured logging with colored output
- **CORS Support**: Cross-origin resource sharing configured

## 📁 Project Structure

```
frusablog/
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   │   └── routes/v1/
│   │   │       ├── controllers/ # Route handlers
│   │   │       ├── dto/         # Data Transfer Objects
│   │   │       └── providers/   # Business logic
│   │   ├── core/               # Core application logic
│   │   │   ├── config/         # Configuration
│   │   │   ├── db/             # Database models & setup
│   │   │   ├── security/       # Authentication & permissions
│   │   │   └── services/       # Email, storage, etc.
│   │   └── utils/              # Utility functions
│   ├── migrations/             # Alembic migrations
│   ├── fs/storage/             # File storage
│   ├── assets/templates/       # Email templates
│   ├── main.py                 # Application entry point
│   ├── pyproject.toml          # Python dependencies
│   └── docker-compose.yml      # Development setup
│
└── frontend/                   # Next.js Frontend
    ├── src/
    │   ├── app/                # App Router (Next.js 13+)
    │   │   ├── (main)/         # Public pages
    │   │   ├── (auth)/         # Authentication pages
    │   │   └── (admin)/        # Admin dashboard
    │   ├── components/         # Reusable components
    │   │   ├── ui/             # UI components (shadcn/ui)
    │   │   ├── data/           # Data display components
    │   │   ├── layouts/        # Layout components
    │   │   └── wrappers/       # Wrapper components
    │   ├── lib/                # Utilities and configurations
    │   │   ├── api/            # API client and types
    │   │   ├── config/         # App configuration
    │   │   └── utils/          # Utility functions
    │   └── hooks/              # Custom React hooks
    ├── package.json            # Node.js dependencies
    └── next.config.ts          # Next.js configuration
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: MDEditor with React Markdown
- **Icons**: Lucide React
- **Theme**: next-themes
- **Package Manager**: pnpm/bun

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13+
- **Database**: PostgreSQL with SQLModel ORM
- **Migrations**: Alembic
- **Authentication**: Custom email-based auth system
- **File Storage**: Local filesystem (extensible)
- **Email**: SMTP with Jinja2 templates
- **Validation**: Pydantic v2
- **Package Manager**: UV

### Database Schema
- **Users**: Email-based user management
- **Posts**: Blog posts with rich content
- **Comments**: Nested comments system
- **Tags**: Categorization system
- **Files**: Secure file management
- **Permissions**: Role-based access control

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and **pnpm/bun**
- **Python 3.13+** and **UV**
- **PostgreSQL** (for production) or **SQLite** (for development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   uv sync
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Run migrations
   alembic upgrade head
   ```

5. **Start the server**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   bun install
   ```

3. **Configure environment**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_SERVER_URL=http://localhost:8000" > .env.local
   echo "NEXT_PUBLIC_API_VERSION=v1" >> .env.local
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   bun dev
   ```

The application will be available at `http://localhost:3000`

### Docker Development

Start both services with Docker Compose:

```bash
cd backend
docker-compose up --build
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /v1/auth/email/register` - User registration
- `POST /v1/auth/email/login` - Login request (sends email)
- `GET /v1/auth/email/authenticate/{session_id}` - Complete authentication

### Post Management
- `GET /v1/posts` - Get published posts
- `GET /v1/posts/featured` - Get featured posts
- `GET /v1/posts/drafts` - Get draft posts (authenticated)
- `GET /v1/posts/search?query=` - Search posts
- `POST /v1/post` - Create new post (authenticated)
- `PUT /v1/post` - Update post (authenticated)
- `DELETE /v1/post/{id}` - Delete post (authenticated)

### Comment System
- `GET /v1/comments/{post_id}` - Get post comments
- `POST /v1/comment` - Create comment (authenticated)
- `PUT /v1/comment` - Update comment (authenticated)
- `DELETE /v1/comment/{id}` - Delete comment (authenticated)

### File Management
- `POST /v1/resource` - Upload single file
- `POST /v1/resources` - Upload multiple files
- `GET /v1/resources/{id}` - Download file

### User Management
- `GET /v1/users/me` - Get current user info
- `GET /v1/users/me/can-post` - Check posting permissions

## 🎨 Frontend Architecture

### App Router Structure
- **(main)**: Public blog interface
  - `/` - Homepage with post listings
  - `/post/[id]` - Individual post view
- **(auth)**: Authentication flow
  - `/login` - Login page
  - `/register` - Registration page
  - `/authenticate/[session_id]` - Email authentication
- **(admin)**: Admin dashboard
  - `/admin` - Posts management
  - `/admin/posts/new` - Create new post
  - `/admin/posts/[id]` - Edit post

### Component Organization
- **UI Components**: Reusable shadcn/ui components
- **Data Components**: Post cards, comment threads, etc.
- **Layout Components**: Navigation, sidebars, containers
- **Wrapper Components**: Authentication guards, theme providers

### State Management
- **TanStack Query**: Server state and caching
- **React Context**: Theme and user state
- **Local State**: Form state and UI interactions

## 🔒 Security Features

### Authentication
- **Passwordless**: Email-based authentication system
- **Session Management**: Secure cookie-based sessions
- **Role-Based Access**: Granular permission system

### File Security
- **Upload Validation**: File type and size restrictions
- **Protected Resources**: Permission-based file access
- **Secure Storage**: Local filesystem with UUID naming

### Data Validation
- **Frontend**: Zod schema validation
- **Backend**: Pydantic model validation
- **Type Safety**: End-to-end TypeScript/Python types

## 🎯 Key Features Deep Dive

### Admin Dashboard
- **Post Management**: Create, edit, delete, and organize posts
- **Draft System**: Save and manage unpublished content
- **Featured Posts**: Highlight important content
- **Tag Management**: Create and organize content categories
- **File Upload**: Drag-and-drop file management
- **Search & Filter**: Advanced content discovery

### Rich Text Editor
- **Markdown Support**: Full markdown syntax
- **Live Preview**: Real-time preview mode
- **Syntax Highlighting**: Code block highlighting
- **Image Embedding**: Direct image uploads
- **Table Support**: GitHub-flavored markdown tables

### Comment System
- **Nested Comments**: Two-level comment threading
- **Like System**: User engagement tracking
- **Real-time Updates**: Optimistic UI updates
- **Moderation**: Admin comment management

### Email System
- **Welcome Emails**: Beautiful HTML email templates
- **Login Links**: Secure authentication emails
- **Unsubscribe**: User preference management
- **Template Engine**: Jinja2-powered email templates

## 🔧 Development Workflow

### Code Quality
- **Frontend**: ESLint, Prettier, TypeScript strict mode
- **Backend**: Ruff formatting and linting
- **Git Hooks**: Pre-commit code quality checks

### Testing
- **Frontend**: Jest with React Testing Library
- **Backend**: Pytest with async support
- **E2E**: Playwright for end-to-end testing

### Deployment
- **Frontend**: Vercel deployment ready
- **Backend**: Docker containerization
- **Database**: PostgreSQL with migrations
- **CDN**: Static asset optimization

## 📈 Performance Optimizations

### Frontend
- **App Router**: Next.js 15 app directory
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: TanStack Query with optimistic updates
- **Bundle Analysis**: Built-in bundle analyzer

### Backend
- **Async/Await**: Full async API endpoints
- **Database Optimization**: SQLModel with efficient queries
- **Connection Pooling**: PostgreSQL connection management
- **Response Caching**: Strategic endpoint caching
- **File Streaming**: Efficient file serving

## 🌍 Environment Configuration

### Backend Environment Variables
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

### Frontend Environment Variables
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_SERVER_PORT=8000
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   # Backend
   cd backend
   ruff check
   ruff format
   pytest
   
   # Frontend
   cd frontend
   pnpm lint
   pnpm type-check
   pnpm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📝 API Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  name: string;
  email?: string; // Only visible to self
}
```

### Post
```typescript
interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  cover?: string; // File resource UUID
  likes: number;
  published: boolean;
  archived: boolean;
  featured: boolean;
  created_at: string;
  author: User;
  tags: Tag[];
}
```

### Comment
```typescript
interface Comment {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  author: User;
  children: Comment[];
  parent?: string;
  level: number;
}
```

### Tag
```typescript
interface Tag {
  id: string;
  name: string;
}
```

## 🐛 Common Issues & Solutions

### Backend Issues
- **Database Connection**: Ensure PostgreSQL is running and credentials are correct
- **Migration Errors**: Run `alembic upgrade head` after pulling changes
- **Email Issues**: Configure SMTP settings in environment variables

### Frontend Issues
- **API Connection**: Verify `NEXT_PUBLIC_SERVER_URL` points to backend
- **Build Errors**: Clear `.next` directory and rebuild
- **Type Errors**: Run `pnpm type-check` to identify TypeScript issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

**Daniel Ametsowou** - [@frusadev](https://github.com/frusadev)

Project Link: [https://github.com/frusadev/frusablog](https://github.com/frusadev/frusablog)

---

*Built with ❤️ using modern web technologies*
