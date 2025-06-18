"use client";
import AdminPostCard from "@/components/data/posts/AdminPostCard";
import GridView from "@/components/layouts/GridView";
import ListView from "@/components/layouts/ListView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminPostSearch from "@/components/ui/custom/AdminPostSearch";
import Show from "@/components/wrappers/Show";
import { Post } from "@/lib/api/dto/post";
import { Star, Grid, ListTree } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const [queriedPosts, setQueriedPosts] = useState<Post[]>([]);
  const [loadingQueriedPosts, setLoadingQueriedPosts] = useState(false);
  const [isSuccessQueryingPosts, setIsSuccessQueryingPosts] = useState(false);
  const [isErrorQueryingPosts, setIsErrorQueryingPosts] = useState(false);
  const [skip] = useState(0);
  const [limit] = useState(10);
  const [postsOrientation, setPostsOrientation] = useState<"grid" | "list">(
    "grid",
  );
  useEffect(() => {
    if (loadingQueriedPosts) {
      setIsSuccessQueryingPosts(false);
      setIsErrorQueryingPosts(false);
    }
    if (isSuccessQueryingPosts) {
      setLoadingQueriedPosts(false);
    }
    if (isErrorQueryingPosts) {
      toast.error("Error loading posts. Please try again later.");
    }
  }, [loadingQueriedPosts, isSuccessQueryingPosts, isErrorQueryingPosts]);
  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="font-semibold text-xl px-2">Posts</span>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">Total: {queriedPosts.length}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured: {queriedPosts.filter((post) => post.featured).length}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-[300px] lg:w-[400px]">
            <AdminPostSearch
              setPosts={setQueriedPosts}
              setLoading={setLoadingQueriedPosts}
              setIsError={setIsErrorQueryingPosts}
              setIsSuccess={setIsSuccessQueryingPosts}
              skip={skip}
              limit={limit}
            />
          </div>
          <Button
            variant={"outline"}
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

      <Show when={postsOrientation === "grid"}>
        <GridView className="gap-2 px-2 sm:px-4">
          {queriedPosts.map((post) => {
            return (
              <Link href={`/admin/posts/${post.id}`} key={post.id}>
                <AdminPostCard
                  orientation={postsOrientation}
                  post={post}
                  key={post.id}
                  showFeaturedToggle={true}
                  showLikeButton={false}
                />
              </Link>
            );
          })}
        </GridView>
      </Show>
      <Show when={postsOrientation === "list"}>
        <ListView gap={2} className="px-2 sm:px-4">
          {queriedPosts.map((post) => {
            return (
              <Link href={`/admin/posts/${post.id}`} key={post.id}>
                <AdminPostCard
                  orientation={postsOrientation}
                  post={post}
                  key={post.id}
                  showFeaturedToggle={true}
                  showLikeButton={false}
                />
              </Link>
            );
          })}
        </ListView>
      </Show>
    </div>
  );
}
