"use client";
import AdminPostCard from "@/components/data/posts/AdminPostCard";
import { Badge } from "@/components/ui/badge";
import AdminPostSearch from "@/components/ui/custom/AdminPostSearch";
import { Post } from "@/lib/api/dto/post";
import { Star } from "lucide-react";
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
    <div className="flex flex-col min-h-full">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          {/* Title and Stats Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="font-semibold text-2xl">Posts</h1>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Total: {queriedPosts.length}</Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured: {queriedPosts.filter((post) => post.featured).length}
              </Badge>
            </div>
          </div>
          
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 max-w-md">
              <AdminPostSearch
                setPosts={setQueriedPosts}
                setLoading={setLoadingQueriedPosts}
                setIsError={setIsErrorQueryingPosts}
                setIsSuccess={setIsSuccessQueryingPosts}
                skip={skip}
                limit={limit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-none space-y-4">
          {queriedPosts.map((post) => {
            return (
              <Link href={`/admin/posts/${post.id}`} key={post.id} className="block">
                <AdminPostCard
                  orientation="list"
                  post={post}
                  key={post.id}
                  showFeaturedToggle={true}
                  showLikeButton={false}
                />
              </Link>
            );
          })}
        </div>
        
        {/* Empty State */}
        {queriedPosts.length === 0 && !loadingQueriedPosts && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground text-lg mb-2">No posts found</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or create a new post to get started.
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {loadingQueriedPosts && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
