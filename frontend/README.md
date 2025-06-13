# Frontend Documentation

## Overview

The frontend is a modern **Next.js 15** application built with TypeScript and Tailwind CSS, featuring a beautiful admin dashboard, responsive design, and real-time updates.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui + Radix UI
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Rich Text**: MDEditor, React Markdown
- **Icons**: Lucide React
- **Theme**: next-themes
- **Authentication**: Custom guards
- **Package Manager**: pnpm/bun

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (main)/                # Public pages
│   │   ├── page.tsx           # Homepage
│   │   ├── post/[id]/         # Post detail
│   │   └── layout.tsx         # Main layout
│   ├── (auth)/                # Authentication
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration
│   │   ├── authenticate/      # Email verification
│   │   └── layout.tsx         # Auth layout
│   ├── (admin)/               # Admin dashboard
│   │   ├── admin/             # Posts management
│   │   │   ├── page.tsx      # Admin homepage
│   │   │   └── posts/        # Post management
│   │   └── layout.tsx         # Admin layout
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── not-found.tsx          # 404 page
├── components/                 # Reusable components
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── custom/            # Custom UI components
│   ├── data/                  # Data display components
│   │   └── posts/             # Post-related components
│   ├── layouts/               # Layout components
│   │   ├── Navigation.tsx     # Main navigation
│   │   ├── GridView.tsx       # Grid layout
│   │   └── ListView.tsx       # List layout
│   ├── providers/             # Context providers
│   │   ├── QueryProvider.tsx  # React Query
│   │   └── ThemeProvider.tsx  # Theme management
│   └── wrappers/              # Wrapper components
│       ├── Show.tsx           # Conditional rendering
│       ├── Auth.tsx           # Auth guards
│       └── AdminGuard.tsx     # Admin protection
├── lib/                       # Utilities and config
│   ├── api/                   # API client
│   │   ├── dto/               # TypeScript interfaces
│   │   └── requests/          # API functions
│   ├── config/                # Configuration
│   │   └── env.ts             # Environment variables
│   └── utils/                 # Utility functions
└── hooks/                     # Custom React hooks
    └── use-mobile.ts          # Mobile detection
```

## Key Features

### 1. App Router Architecture
Built with Next.js 15 App Router for:
- File-based routing
- Nested layouts
- Server and client components
- Built-in SEO optimization

### 2. Component System
- **shadcn/ui**: Beautiful, accessible components
- **Radix UI**: Unstyled, accessible primitives
- **Custom Components**: Project-specific UI elements
- **Responsive Design**: Mobile-first approach

### 3. State Management
- **TanStack Query**: Server state caching
- **React Context**: Global state (theme, user)
- **Local State**: Component-level state
- **Optimistic Updates**: Instant UI feedback

### 4. Authentication System
- **Email-based**: Passwordless authentication
- **Route Guards**: Protected admin routes
- **Session Management**: Secure cookie handling
- **Permission Checks**: Role-based access

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm/bun

### Installation
```bash
# Install dependencies
pnpm install
# or
bun install
```

### Environment Setup
```bash
# Create environment file
echo "NEXT_PUBLIC_SERVER_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_API_VERSION=v1" >> .env.local
```

### Development
```bash
# Start development server
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Component Architecture

### UI Components (`/components/ui/`)

Base components following shadcn/ui patterns:

```typescript
// Example: Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}
```

### Data Components (`/components/data/`)

Domain-specific components:

```typescript
// PostCard component
interface PostCardProps {
  post: Post
  onClick?: () => void
  showFeaturedToggle?: boolean
  showLikeButton?: boolean
}
```

### Layout Components (`/components/layouts/`)

Structural components:
- **Navigation**: Main navigation with theme toggle
- **GridView**: Responsive grid container
- **ListView**: List container with spacing
- **AdminSidebar**: Admin navigation sidebar

## API Integration

### Type-Safe API Client

```typescript
// API function example
export async function getPosts(skip = 0, limit = 10): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts?skip=${skip}&limit=${limit}`)
  if (!response.ok) throw new Error('Failed to fetch posts')
  return response.json()
}
```

### React Query Integration

```typescript
// Custom hook for posts
export function usePosts(skip = 0, limit = 10) {
  return useQuery({
    queryKey: ['posts', skip, limit],
    queryFn: () => getPosts(skip, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## Admin Dashboard

### Features
- **Post Management**: CRUD operations
- **Draft System**: Save unpublished content
- **File Upload**: Drag-and-drop interface
- **Search & Filter**: Advanced content discovery
- **Tag Management**: Organize content
- **Grid/List Views**: Flexible content display

### Protected Routes
All admin routes are protected by `AdminGuard`:

```typescript
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminSidebar />
        <main>{children}</main>
      </SidebarProvider>
    </AdminGuard>
  )
}
```

## Authentication Flow

### 1. Registration/Login
```typescript
// Registration
await register({ email, username, name })
// User receives email with magic link
```

### 2. Email Verification
```typescript
// Authentication page
const { mutate: authenticate } = useMutation({
  mutationFn: (sessionId: string) => authenticateSession(sessionId),
  onSuccess: () => router.push('/admin'),
})
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production
```bash
NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com
NEXT_PUBLIC_API_VERSION=v1
```

## Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
