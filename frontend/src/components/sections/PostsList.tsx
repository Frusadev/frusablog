"use client";

import { Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import PostCard from "@/components/data/posts/PostCard";
import Show from "@/components/wrappers/Show";
import { createPostSlug } from "@/lib/utils/slug";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/api/dto/post";
import { useState } from "react";

interface PostsListProps {
  posts: Post[];
  isLoading: boolean;
  isFetching: boolean;
  hasMorePosts: boolean;
  onLoadMore: () => void;
  currentPage: number;
}

export default function PostsList({ 
  posts, 
  isLoading, 
  isFetching, 
  hasMorePosts, 
  onLoadMore, 
  currentPage 
}: PostsListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // default grid

  return (
    <div className="lg:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Latest Articles</h2>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 backdrop-blur p-1 text-sm">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <ListIcon className="w-4 h-4" />
            <span className="hidden md:inline">List</span>
          </button>
        </div>
      </div>

      <Show when={isLoading && currentPage === 1}>
        <div className="flex justify-center py-12">
          <Spinner size="large" className="stroke-primary" />
        </div>
      </Show>

      <Show when={!isLoading}>
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr"
              : "space-y-6"
          }
        >
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                router.push(
                  `/post/${createPostSlug(post.title, post.id)}`,
                )
              }
              className={`cursor-pointer group ${
                viewMode === "grid" ? "" : "transform transition-transform hover:scale-[1.01]"
              } h-full`}
            >
              <PostCard
                post={post}
                orientation={viewMode === "grid" ? "grid" : "list"}
              />
            </div>
          ))}
        </div>
      </Show>

      <Show when={posts.length === 0 && !isLoading}>
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

      <Show when={hasMorePosts && !isLoading}>
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isFetching}
            className="min-w-[120px]"
          >
            <Show when={isFetching}>
              <Spinner size="small" className="mr-2" />
            </Show>
            Load More
          </Button>
        </div>
      </Show>
    </div>
  );
}
