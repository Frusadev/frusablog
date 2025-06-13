"use client";
import AdminPostCard from "@/components/data/posts/AdminPostCard";
import GridView from "@/components/layouts/GridView";
import ListView from "@/components/layouts/ListView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PostSearch from "@/components/ui/custom/PostSearch";
import { Input } from "@/components/ui/input";
import Show from "@/components/wrappers/Show";
import { Post } from "@/lib/api/dto/post";
import { Star, Grid, List, ListIcon, ListTree } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminPage() {
  const [queriedPosts, setQueriedPosts] = useState<Post[]>([]);
  const [loadingQueriedPosts, setLoadingQueriedPosts] = useState(false);
  const [isSuccessQueryingPosts, setIsSuccessQueryingPosts] = useState(false);
  const [isErrorQueryingPosts, setIsErrorQueryingPosts] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [postsOrientation, setPostsOrientation] = useState<"grid" | "list">(
    "grid",
  );
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-xl px-2">Posts</span>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">Total: {queriedPosts.length}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured: {queriedPosts.filter(post => post.featured).length}
            </Badge>
          </div>
        </div>
        <div className="w-2/3 max-w-[500px] flex gap-2">
          <PostSearch
            setPosts={setQueriedPosts}
            setLoading={setLoadingQueriedPosts}
            setIsError={setIsErrorQueryingPosts}
            setIsSuccess={setIsSuccessQueryingPosts}
            skip={skip}
            limit={limit}
          />
        </div>
        <div>
          <Button
            variant={"outline"}
            onClick={() =>
              setPostsOrientation(postsOrientation === "grid" ? "list" : "grid")
            }
            className="w-10 h-10 rounded-xl"
          >
            {postsOrientation === "grid" ? <Grid /> : <ListTree />}
          </Button>
        </div>
      </div>

      <Show when={postsOrientation === "grid"}>
        <GridView className="gap-2 px-2">
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
        <ListView gap={2} className="px-2">
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
