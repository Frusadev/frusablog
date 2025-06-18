"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts, getFeaturedPosts } from "@/lib/api/requests/post";
import PostCard from "@/components/data/posts/PostCard";
import Navigation from "@/components/layouts/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/Spinner";
import PostSearchInfinite from "@/components/ui/custom/PostSearchInfinite";
import Show from "@/components/wrappers/Show";
import { Star, TrendingUp, Calendar, User, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { createPostSlug } from "@/lib/utils/slug";
import { useRouter } from "next/navigation";
import { useVisitTracking } from "@/hooks/useUserTracking";
import Image from "next/image";

const POSTS_PER_PAGE = 8;

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

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

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const featuredPosts = featuredQuery.data || [];
  const posts = postsQuery.data || [];
  const hasMorePosts = posts.length === POSTS_PER_PAGE;

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header with Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Welcome to the Blog</h1>
            </div>
            <div className="w-full sm:w-auto">
              <PostSearchInfinite />
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Posts List */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Latest Articles</h2>
              </div>

              <Show when={postsQuery.isLoading && currentPage === 1}>
                <div className="flex justify-center py-12">
                  <Spinner size="large" className="stroke-primary" />
                </div>
              </Show>

              <Show when={!postsQuery.isLoading}>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() =>
                        router.push(
                          `/post/${createPostSlug(post.title, post.id)}`,
                        )
                      }
                      className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                    >
                      <PostCard post={post} orientation="list" />
                    </div>
                  ))}
                </div>
              </Show>

              <Show when={posts.length === 0 && !postsQuery.isLoading}>
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                    <p className="text-muted-foreground">
                      Check back later for amazing content!
                    </p>
                  </CardContent>
                </Card>
              </Show>

              <Show when={hasMorePosts && !postsQuery.isLoading}>
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={postsQuery.isFetching}
                    className="min-w-[120px]"
                  >
                    <Show when={postsQuery.isFetching}>
                      <Spinner size="small" className="mr-2" />
                    </Show>
                    Load More
                  </Button>
                </div>
              </Show>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Featured Posts */}
              <Show when={featuredPosts.length > 0}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      Featured Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featuredPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="group cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/post/${createPostSlug(post.title, post.id)}`,
                          )
                        }
                      >
                        <div className="flex gap-3">
                          <Show when={!!post.cover}>
                            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                              <Image
                                src={
                                  getResourceUrl(post.cover) || "/nomedia.png"
                                }
                                alt={post.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/nomedia.png";
                                }}
                              />
                            </div>
                          </Show>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>
                                {post.author.name || post.author.username}
                              </span>
                              <span>•</span>
                              <span>{timeAgo(post.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {post.tags?.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Show>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Popular Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        [...featuredPosts, ...posts]
                          .flatMap((post) => post.tags || [])
                          .slice(0, 10),
                      ),
                    ).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Blog Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {featuredPosts.length + posts.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Articles
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {featuredPosts.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Featured
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {[...featuredPosts, ...posts].reduce(
                        (sum, post) => sum + post.likes,
                        0,
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Likes
                    </div>
                  </div>
                </CardContent>{" "}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
