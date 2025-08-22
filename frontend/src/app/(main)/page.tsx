"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts, getFeaturedPosts } from "@/lib/api/requests/post";
import { getPublicStats } from "@/lib/api/requests/stats";
import Navigation from "@/components/layouts/Navigation";
import PostSearchInfinite from "@/components/ui/custom/PostSearchInfinite";
import MainLayout from "@/components/sections/MainLayout";
import { useVisitTracking } from "@/hooks/useUserTracking";

const POSTS_PER_PAGE = 8;

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize visit tracking for the main page
  useVisitTracking();

  // Calculate skip value for pagination
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // Fetch featured posts
  const featuredQuery = useQuery({
    queryKey: ["featured-posts"],
    queryFn: getFeaturedPosts,
  });

  // Fetch regular posts with pagination
  const postsQuery = useQuery({
    queryKey: ["posts", skip, POSTS_PER_PAGE],
    queryFn: () => getPosts({ skip, limit: POSTS_PER_PAGE }),
  });

  // Fetch public stats
  const statsQuery = useQuery({
    queryKey: ["public-stats"],
    queryFn: getPublicStats,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const featuredPosts = featuredQuery.data || [];
  const posts = postsQuery.data || [];
  const stats = statsQuery.data;
  const hasMorePosts = posts.length === POSTS_PER_PAGE;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient decorative gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-purple-500/10 via-fuchsia-400/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-emerald-400/10 via-teal-300/10 to-transparent blur-3xl" />
      </div>

      <Navigation />

      {/* Hero / Search Section */}
      <header className="relative">
        <div className="container max-w-7xl mx-auto px-4 pt-12 md:pt-16 pb-6 md:pb-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Ideas, Insights & Building in Public
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Deep dives, experiments and learnings around software, products
                and the craft of shipping. Explore the latest or search anything
                below.
              </p>
            </div>
            <div className="w-full max-w-2xl flex justify-center">
              <PostSearchInfinite />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 pb-16 max-w-7xl">
          <MainLayout
            posts={posts}
            featuredPosts={featuredPosts}
            featuredLoading={featuredQuery.isLoading}
            isLoading={postsQuery.isLoading && currentPage === 1}
            isFetching={postsQuery.isFetching}
            hasMorePosts={hasMorePosts}
            currentPage={currentPage}
            stats={stats}
            statsLoading={statsQuery.isLoading}
            statsError={statsQuery.isError}
            onLoadMore={handleLoadMore}
          />

          {/* Feedback Section */}
          <section className="mt-16">
          </section>
        </div>
      </main>
    </div>
  );
}
