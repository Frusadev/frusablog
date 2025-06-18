"use client";
import AdminPostCard from "@/components/data/posts/AdminPostCard";
import GridView from "@/components/layouts/GridView";
import ListView from "@/components/layouts/ListView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Show from "@/components/wrappers/Show";
import { getDraftPosts } from "@/lib/api/requests/post";
import { Grid, ListTree, Plus, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";

export default function DraftsPage() {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [postsOrientation, setPostsOrientation] = useState<"grid" | "list">(
    "grid",
  );

  const { data: draftPosts = [], isLoading, error, isFetching } = useQuery({
    queryKey: ["posts", "drafts", skip, limit],
    queryFn: () => getDraftPosts({ skip, limit }),
  });
  
  // Calculate pagination values
  const currentPage = Math.floor(skip / limit) + 1;
  const hasMore = draftPosts.length === limit;
  
  // Handle pagination
  const goToNextPage = () => {
    if (hasMore) {
      setSkip(skip + limit);
    }
  };
  
  const goToPreviousPage = () => {
    if (skip >= limit) {
      setSkip(skip - limit);
    }
  };
  
  const changePageSize = (newLimit: number) => {
    setLimit(newLimit);
    setSkip(0); // Reset to first page when changing page size
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Error Loading Drafts</h2>
        <p className="text-muted-foreground">Failed to load draft posts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-xl">Draft Posts</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">Total: {draftPosts.length}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Unpublished
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/admin/posts/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Draft
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() =>
              setPostsOrientation(postsOrientation === "grid" ? "list" : "grid")
            }
            className="w-full sm:w-10 h-10 rounded-xl flex items-center justify-center"
          >
            {postsOrientation === "grid" ? <Grid /> : <ListTree />}
            <span className="ml-2 sm:hidden">
              {postsOrientation === "grid" ? "Grid View" : "List View"}
            </span>
          </Button>
        </div>
      </div>

      <Show when={isLoading}>
        <div className="flex justify-center py-20">
          <Spinner size="large" className="stroke-primary" />
        </div>
      </Show>

      <Show when={!isLoading && draftPosts.length === 0}>
        <div className="flex flex-col items-center justify-center py-20">
          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Drafts Yet</h3>
          <p className="text-muted-foreground mb-4">Start writing your next blog post!</p>
          <Link href="/admin/posts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </Link>
        </div>
      </Show>

      <Show when={!isLoading && draftPosts.length > 0}>
        <Show when={postsOrientation === "grid"}>
          <GridView className="gap-2 px-2 sm:px-4">
            {draftPosts.map((post) => (
              <Link href={`/admin/posts/${post.id}`} key={post.id}>
                <AdminPostCard
                  orientation={postsOrientation}
                  post={post}
                  showFeaturedToggle={false}
                  showLikeButton={false}
                />
              </Link>
            ))}
          </GridView>
        </Show>
        
        <Show when={postsOrientation === "list"}>
          <ListView gap={2} className="px-2 sm:px-4">
            {draftPosts.map((post) => (
              <Link href={`/admin/posts/${post.id}`} key={post.id}>
                <AdminPostCard
                  orientation={postsOrientation}
                  post={post}
                  showFeaturedToggle={false}
                  showLikeButton={false}
                />
              </Link>
            ))}
          </ListView>
        </Show>
      </Show>

      {/* Pagination */}
      <Show when={!isLoading && draftPosts.length > 0}>
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page Size:</span>
            <select 
              value={limit} 
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="bg-background border border-input rounded-md p-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={goToPreviousPage} 
              disabled={skip === 0 || isFetching}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            
            <span className="px-2 py-1 text-sm">
              Page {currentPage} {isFetching && <Spinner size="small" className="inline ml-1" />}
            </span>
            
            <Button 
              onClick={goToNextPage} 
              disabled={!hasMore || isFetching}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
}
