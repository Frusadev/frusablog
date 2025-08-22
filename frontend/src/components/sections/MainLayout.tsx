"use client";

import FeaturedPostsCarousel from "@/components/sections/FeaturedPostsCarousel";
import FeaturedPostsLoading from "@/components/sections/FeaturedPostsLoading";
import PostsList from "@/components/sections/PostsList";
import Sidebar from "@/components/sections/Sidebar";
import Show from "@/components/wrappers/Show";
import type { Post } from "@/lib/api/dto/post";

interface Stats {
  total_articles?: number;
  featured?: number;
  total_likes?: number;
  total_comments?: number;
}

interface MainLayoutProps {
  posts: Post[];
  featuredPosts: Post[];
  featuredLoading: boolean;
  isLoading: boolean;
  isFetching: boolean;
  hasMorePosts: boolean;
  currentPage: number;
  stats?: Stats;
  statsLoading: boolean;
  statsError: boolean;
  onLoadMore: () => void;
}

export default function MainLayout({
  posts,
  featuredPosts,
  featuredLoading,
  isLoading,
  isFetching,
  hasMorePosts,
  currentPage,
  stats,
  statsLoading,
  statsError,
  onLoadMore,
}: MainLayoutProps) {
  return (
    <>
      {/* Featured Posts Section */}
      <div className="mb-8 lg:mb-12">
        <Show when={featuredLoading}>
          <FeaturedPostsLoading />
        </Show>
        <Show when={!featuredLoading}>
          <FeaturedPostsCarousel featuredPosts={featuredPosts} />
        </Show>
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Posts List */}
        <div className="lg:col-span-8">
          <PostsList
            posts={posts}
            isLoading={isLoading}
            isFetching={isFetching}
            hasMorePosts={hasMorePosts}
            currentPage={currentPage}
            onLoadMore={onLoadMore}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Sidebar
            featuredPosts={featuredPosts}
            posts={posts}
            stats={stats}
            statsLoading={statsLoading}
            statsError={statsError}
          />
        </div>
      </div>
    </>
  );
}
