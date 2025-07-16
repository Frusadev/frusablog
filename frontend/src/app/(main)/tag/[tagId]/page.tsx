"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getRelatedPosts } from "@/lib/api/requests/tag";
import { getTags } from "@/lib/api/requests/tag";
import PostCard from "@/components/data/posts/PostCard";
import Navigation from "@/components/layouts/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import { createPostSlug } from "@/lib/utils/slug";
import { useState } from "react";

const POSTS_PER_PAGE = 10;

export default function TagPage() {
  const { tagId } = useParams() as { tagId: string };
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate skip value for pagination
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // Fetch tag information
  const { data: allTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags({ limit: 100 }),
  });

  const currentTag = allTags.find(tag => tag.id === tagId);

  // Fetch related posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["tag-posts", tagId, skip, POSTS_PER_PAGE],
    queryFn: () => getRelatedPosts(tagId, { skip, limit: POSTS_PER_PAGE }),
    enabled: !!tagId,
  });

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMorePosts = posts.length === POSTS_PER_PAGE;

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <TagIcon className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {currentTag?.name || "Tag"}
                </h1>
                <p className="text-muted-foreground">
                  Posts tagged with &quot;{currentTag?.name}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          <Show when={isLoading && currentPage === 1}>
            <div className="flex justify-center py-12">
              <Spinner size="large" className="stroke-primary" />
            </div>
          </Show>

          {/* Error State */}
          <Show when={!!error}>
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <TagIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Error Loading Posts</h3>
                <p className="text-muted-foreground mb-4">
                  Something went wrong while loading posts for this tag.
                </p>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </Show>

          {/* Posts List */}
          <Show when={!isLoading && !error}>
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

            {/* Empty State */}
            {posts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent className="pt-6">
                  <TagIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no posts tagged with &quot;{currentTag?.name}&quot; yet.
                  </p>
                  <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More Button */}
            {hasMorePosts && posts.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  <Show when={isLoading}>
                    <Spinner size="small" className="mr-2" />
                  </Show>
                  Load More
                </Button>
              </div>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}
