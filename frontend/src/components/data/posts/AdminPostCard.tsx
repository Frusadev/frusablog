import { Post } from "@/lib/api/dto/post";
import { toggleFeaturedPost } from "@/lib/api/requests/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star } from "lucide-react";
import Show from "@/components/wrappers/Show";
import PostCard, { PostCardProps } from "./PostCard";

export interface AdminPostCardProps extends PostCardProps {
  showFeaturedToggle?: boolean;
}

export default function AdminPostCard({
  post,
  orientation,
  showLikeButton = false,
  showFeaturedToggle = true,
  ...props
}: AdminPostCardProps) {
  const [localFeatured, setLocalFeatured] = useState(post.featured);
  const queryClient = useQueryClient();

  const toggleFeaturedMutation = useMutation({
    mutationFn: (featured: boolean) => toggleFeaturedPost(post.id, featured),
    onMutate: async (featured: boolean) => {
      // Optimistic update
      setLocalFeatured(featured);
    },
    onSuccess: () => {
      // Invalidate and refetch posts to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
    },
    onError: () => {
      // Revert optimistic update
      setLocalFeatured(post.featured);
    },
  });

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    e.stopPropagation();
    const newFeaturedStatus = !localFeatured;
    toggleFeaturedMutation.mutate(newFeaturedStatus);
  };

  // Create updated post object for PostCard with local featured status
  const updatedPost: Post = {
    ...post,
    featured: localFeatured,
  };

  return (
    <div className="relative">
      <PostCard
        post={updatedPost}
        orientation={orientation}
        showLikeButton={showLikeButton}
        {...props}
      />
      
      {/* Featured Toggle Button - positioned in top right corner */}
      <Show when={showFeaturedToggle}>
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant={localFeatured ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFeatured}
            disabled={toggleFeaturedMutation.isPending}
            className={`flex items-center gap-1 transition-all ${
              localFeatured 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-primary/10"
            }`}
            title={localFeatured ? "Remove from featured" : "Add to featured"}
          >
            <Star 
              className={`w-4 h-4 ${
                localFeatured ? "fill-current" : ""
              }`} 
            />
            <Show when={!toggleFeaturedMutation.isPending}>
              <span className="text-xs">
                {localFeatured ? "Featured" : "Feature"}
              </span>
            </Show>
            <Show when={toggleFeaturedMutation.isPending}>
              <span className="text-xs">...</span>
            </Show>
          </Button>
        </div>
      </Show>
    </div>
  );
}
