# FrusaBlog Frontend

> Modern blog platform frontend built with Next.js 15, TypeScript, and shadcn/ui

## 🚀 Overview

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Admin Dashboard](#-admin-dashboard)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [Components Guide](#-components-guide)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🛠 Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 19](https://react.dev/)** - UI library with latest features

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### State Management & Data Fetching
- **[TanStack Query](https://tanstack.com/query/latest)** - Powerful data synchronization
- **[TanStack Table](https://tanstack.com/table/latest)** - Headless table utilities

### Rich Text & Content
- **[MDEditor](https://uiwjs.github.io/react-md-editor/)** - Markdown editor
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown renderer
- **[rehype-highlight](https://github.com/rehypejs/rehype-highlight)** - Syntax highlighting

### Developer Experience
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting (via shadcn/ui config)
- **[Turbopack](https://turbo.build/pack)** - Ultra-fast bundler (dev mode)

### Additional Libraries
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[clsx](https://github.com/lukeed/clsx)** - Conditional CSS classes
- **[sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[ky](https://github.com/sindresorhus/ky)** - HTTP client
- **[zod](https://zod.dev/)** - Runtime type validation
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality

---

## ✨ Features

### 🌍 Public Interface
- **Modern Homepage** - Clean, responsive design with featured posts
- **Post Reading** - Rich markdown rendering with syntax highlighting
- **Search & Discovery** - Real-time search with infinite scroll
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - System preference detection with manual toggle
- **Social Sharing** - Easy post sharing functionality
- **SEO Optimized** - Meta tags, Open Graph, structured data

### 🔐 Admin Dashboard
- **Content Management** - Full CRUD operations for posts
- **Rich Text Editor** - Markdown editor with live preview
- **Draft System** - Save and manage unpublished content
- **Media Management** - File upload with drag-and-drop
- **Tag Management** - Organize content with tags
- **User Management** - User permissions and content access
- **Analytics Dashboard** - Track views, engagement, and performance
- **Comments Moderation** - Manage user comments and interactions

### 🎨 UI/UX Features
- **Grid/List Views** - Flexible content display options
- **Infinite Scroll** - Smooth content loading
- **Optimistic Updates** - Instant UI feedback
- **Loading States** - Beautiful skeleton loaders
- **Error Boundaries** - Graceful error handling
- **Accessibility** - WCAG compliant components

---

## 🏗 Project Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Public blog interface
│   │   │   ├── page.tsx      # Homepage with posts listing
│   │   │   ├── post/[slug]/  # Individual post pages
│   │   │   └── layout.tsx    # Main layout with navigation
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   ├── authenticate/ # Email verification
│   │   │   └── layout.tsx    # Auth layout
│   │   ├── (admin)/          # Admin dashboard
│   │   │   ├── admin/        # Main admin pages
│   │   │   │   ├── page.tsx              # Dashboard home
│   │   │   │   ├── posts/               # Post management
│   │   │   │   │   ├── new/            # Create new post
│   │   │   │   │   ├── [postId]/       # Edit existing post
│   │   │   │   │   ├── drafts/         # Draft posts
│   │   │   │   │   ├── archived/       # Archived posts
│   │   │   │   │   └── stats/          # Post analytics
│   │   │   │   ├── tags/               # Tag management
│   │   │   │   ├── comments/           # Comment moderation
│   │   │   │   ├── users/              # User management
│   │   │   │   └── files/              # File management
│   │   │   ├── layout.tsx    # Admin layout with sidebar
│   │   │   └── not-found.tsx # Admin 404 page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── not-found.tsx     # Global 404 page
│   ├── components/           # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx   # Button variants
│   │   │   ├── card.tsx     # Card layouts
│   │   │   ├── input.tsx    # Form inputs
│   │   │   ├── sidebar.tsx  # Sidebar navigation
│   │   │   ├── table.tsx    # Data tables
│   │   │   └── custom/      # Custom UI components
│   │   │       ├── AdminSidebar.tsx     # Admin navigation
│   │   │       ├── PostSearchInfinite.tsx # Search interface
│   │   │       ├── AdminPostSearch.tsx  # Admin search
│   │   │       ├── ThemeSwitch.tsx      # Theme toggle
│   │   │       └── Logo.tsx             # App logo
│   │   ├── data/            # Data display components
│   │   │   └── posts/       # Post-related components
│   │   │       ├── PostCard.tsx         # Post card display
│   │   │       └── AdminPostCard.tsx    # Admin post card
│   │   ├── layouts/         # Layout components
│   │   │   ├── Navigation.tsx   # Main navigation
│   │   │   ├── GridView.tsx     # Grid layout container
│   │   │   └── ListView.tsx     # List layout container
│   │   ├── providers/       # Context providers
│   │   │   ├── QueryProvider.tsx    # TanStack Query
│   │   │   └── ThemeProvider.tsx    # Theme management
│   │   └── wrappers/        # Wrapper components
│   │       ├── Show.tsx         # Conditional rendering
│   │       └── AdminGuard.tsx   # Admin route protection
│   ├── lib/                 # Utilities and configuration
│   │   ├── api/            # API client and types
│   │   │   ├── dto/        # TypeScript interfaces
│   │   │   ├── requests/   # API functions
│   │   │   ├── types/      # Type definitions
│   │   │   ├── utils/      # API utilities
│   │   │   ├── utils.ts    # General API utils
│   │   │   └── websocket/  # WebSocket handling
│   │   ├── config/         # App configuration
│   │   │   └── env.ts      # Environment variables
│   │   └── utils/          # Utility functions
│   │       ├── utils.ts    # General utilities
│   │       ├── crypto.ts   # Cryptographic utilities
│   │       ├── date.ts     # Date formatting
│   │       ├── fileUtils.ts # File handling
│   │       └── slug.ts     # URL slug generation
│   └── hooks/              # Custom React hooks
│       ├── use-mobile.ts       # Mobile device detection
│       ├── useAuth.ts          # Authentication state
│       └── useUserTracking.ts  # User analytics
├── public/                 # Static assets
│   ├── logo.png           # App logo
│   ├── nomedia.png        # Placeholder image
│   └── ads.txt            # Ads configuration
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── components.json        # shadcn/ui configuration
└── tsconfig.json         # TypeScript configuration
```

### Route Groups
- **(main)** - Public-facing blog interface
- **(auth)** - Authentication and registration flows
- **(admin)** - Protected admin dashboard

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17 or later
- **pnpm**, **npm**, or **bun** (pnpm recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frusablog/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Backend API URL
   NEXT_PUBLIC_SERVER_URL=http://localhost:8000
   NEXT_PUBLIC_API_VERSION=v1
   NEXT_PUBLIC_SERVER_PORT=8000
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```json
{
  "dev": "next dev --turbopack",      // Development server with Turbopack
  "build": "next build",              // Production build
  "start": "next start",              // Start production server
  "lint": "next lint",                // Run ESLint
  "lint-fix": "next lint --fix"       // Fix ESLint issues
}
```

---

## 🎛 Admin Dashboard

### 📝 Content Management
- **All Posts** (`/admin`) - Overview of all published posts
- **New Post** (`/admin/posts/new`) - Create new blog posts
- **Edit Post** (`/admin/posts/[id]`) - Edit existing posts
- **Drafts** (`/admin/posts/drafts`) - Manage unpublished content
- **Archived** (`/admin/posts/archived`) - View archived posts
- **Post Stats** (`/admin/posts/stats`) - Analytics and performance metrics

### 🏷 Organization
- **Tags** (`/admin/tags`) - Manage content tags and categories
- **Comments** (`/admin/comments`) - Moderate user comments

### 👥 User Management
- **All Users** (`/admin/users`) - View and manage users
- **Banned Users** (`/admin/users/banned`) - Handle banned accounts
- **Send Messages** (`/admin/users/message`) - Communicate with users

### 📊 Analytics
- **Traffic Stats** - Monitor page views and engagement
- **Reports** - Generate performance reports

### Key Features:
- **Drag & Drop** file uploads
- **Markdown Editor** with live preview
- **Tag Management** with auto-suggestions
- **Search & Filter** across all content
- **Grid/List Views** for flexible display
- **Real-time Updates** with optimistic UI

---

## 🔌 API Integration

### HTTP Client
The app uses **ky** for HTTP requests with automatic error handling and type safety.

```typescript
// Example API function
export async function getPosts(params?: GetPostsParams): Promise<Post[]> {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  return await api.get(`posts?${searchParams}`).json<Post[]>();
}
```

### TanStack Query Integration
Server state is managed with TanStack Query for caching, background updates, and optimistic mutations.

```typescript
// Custom hook for posts
export function usePosts(params?: GetPostsParams) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
```

### API Structure
- **`/lib/api/requests/`** - API endpoint functions
- **`/lib/api/dto/`** - TypeScript interfaces
- **`/lib/api/types/`** - Type definitions
- **`/lib/api/utils/`** - API utilities

---

## 🔐 Authentication

### Passwordless Authentication
The app uses email-based passwordless authentication:

1. **Registration/Login** - User enters email
2. **Magic Link** - Backend sends email with session link
3. **Verification** - User clicks link to authenticate
4. **Session** - Token stored in HTTP-only cookies

### Route Protection
Protected routes are wrapped with guards:

```typescript
// Admin route protection
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminSidebar />
        <main>{children}</main>
      </SidebarProvider>
    </AdminGuard>
  );
}
```

### Auth Hooks
```typescript
// Get current user (authenticated routes)
const { user, isLoading } = useCurrentUser();

// Optional user (public routes)
const { user } = useOptionalCurrentUser();
```

---

## 🧩 Components Guide

### UI Components (`/components/ui/`)
Based on **shadcn/ui** with customizations:

- **Base Components**: Button, Input, Card, Dialog, etc.
- **Complex Components**: Sidebar, Table, Chart, etc.
- **Custom Components**: Logo, ThemeSwitch, SearchInfinite, etc.

### Data Components (`/components/data/`)
Domain-specific components for displaying data:

- **PostCard** - Display post information
- **AdminPostCard** - Admin version with actions

### Layout Components (`/components/layouts/`)
Structural layout components:

- **Navigation** - Main site navigation
- **GridView** - Responsive grid container
- **ListView** - List container with spacing

### Wrapper Components (`/components/wrappers/`)
Utility wrapper components:

- **Show** - Conditional rendering
- **AdminGuard** - Route protection

### Usage Examples

```typescript
// Conditional rendering
<Show when={user?.isAdmin}>
  <AdminPanel />
</Show>

// Post display
<PostCard 
  post={post} 
  onClick={() => navigate(`/post/${post.slug}`)}
  showActions={isAdmin} 
/>

// Grid layout
<GridView>
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</GridView>
```

---

## 🔄 Development Workflow

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **Conventional Commits** (recommended)

### Component Development
1. **UI Components** - Start with shadcn/ui base
2. **Type Safety** - Define proper TypeScript interfaces
3. **Accessibility** - Ensure WCAG compliance
4. **Responsive** - Mobile-first design

### State Management
- **Server State** - TanStack Query for API data
- **Client State** - React useState/useReducer
- **Global State** - React Context for theme, user

### Performance
- **Code Splitting** - Automatic with Next.js App Router
- **Image Optimization** - Next.js Image component
- **Caching** - TanStack Query with proper cache keys
- **Bundle Analysis** - Built-in Next.js analyzer

---

## 🚀 Deployment

### Docker (Recommended)
The easiest way to deploy the frontend is using Docker with the provided configuration.

1. **Build the Docker image**
   ```bash
   # From the project root
   docker build -f frontend/Dockerfile -t frusablog-frontend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com \
     -e NEXT_PUBLIC_API_VERSION=v1 \
     frusablog-frontend
   ```

3. **Using Docker Compose**
   ```bash
   # From the project root
   docker-compose up frontend
   ```

### Manual Deployment
For manual deployment on a server:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com
NEXT_PUBLIC_API_VERSION=v1
```

### Vercel (Alternative)
If you prefer Vercel for deployment:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   Configure in Vercel dashboard or via CLI.

---

## 🤝 Contributing

### Getting Started
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines
- **Follow** existing code patterns
- **Add** TypeScript types for new features
- **Test** on mobile and desktop
- **Document** complex functionality
- **Follow** accessibility best practices

### Component Guidelines
- **Reusable** - Make components generic when possible
- **Props Interface** - Define clear TypeScript interfaces
- **Default Props** - Provide sensible defaults
- **Documentation** - Add JSDoc comments for complex components

### Pull Request Process
1. **Update** documentation for new features
2. **Ensure** the lint and build works
3. **Follow** the existing code style
4. **Add** screenshots for UI changes

---

## 📚 Learn More

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [shadcn/ui GitHub](https://github.com/shadcn/ui)
- [TanStack Query GitHub](https://github.com/TanStack/query)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 📧 Contact

**Daniel Ametsowou** - [@frusadev](https://github.com/Frusadev)

Project Link: [https://github.com/frusadev/frusablog](https://github.com/Frusadev/frusablog)

---

*Built with ❤️ using modern web technologies*