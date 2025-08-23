"use client";

import FeaturedPostsSidebar from "./sidebar/FeaturedPostsSidebar";
import PopularTagsSidebar from "./sidebar/PopularTagsSidebar";
import BlogStatsSidebar from "./sidebar/BlogStatsSidebar";
import SeriesSidebar from "./sidebar/SeriesSidebar";
import type { Post } from "@/lib/api/dto/post";
import FeedbackForm from "../ui/custom/FeedbackForm";

interface Stats {
  total_articles?: number;
  featured?: number;
  total_likes?: number;
  total_comments?: number;
}

interface SidebarProps {
  featuredPosts: Post[];
  posts: Post[];
  stats?: Stats;
  statsLoading: boolean;
  statsError: boolean;
}

export default function Sidebar({
  featuredPosts,
  posts,
  stats,
  statsLoading,
  statsError,
}: SidebarProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <FeaturedPostsSidebar featuredPosts={featuredPosts} />
  <SeriesSidebar />
      <PopularTagsSidebar featuredPosts={featuredPosts} posts={posts} />
      <BlogStatsSidebar
        stats={stats}
        statsLoading={statsLoading}
        statsError={statsError}
      />

      <FeedbackForm
        heading="Have feedback or suggestions?"
        defaultSubject="Site feedback"
      />
    </div>
  );
}
