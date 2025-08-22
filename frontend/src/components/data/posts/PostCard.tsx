import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/Spinner";
import ClickableTag from "@/components/ui/custom/ClickableTag";
import Show from "@/components/wrappers/Show";
import { Post } from "@/lib/api/dto/post";
import { getFileURL } from "@/lib/api/requests/file";
import { likePost, checkHasLiked } from "@/lib/api/requests/post";
import { timeAgo } from "@/lib/utils";
import { useOptionalCurrentUser } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { SERVER_URL } from "@/lib/config/env";

export interface PostCardProps {
  orientation?: "grid" | "list";
  post: Post;
  showLikeButton?: boolean;
}
export default function PostCard({
  orientation: cardOrientation,
  post,
  showLikeButton = true,
}: PostCardProps) {
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  // Get current user (optional - doesn't throw if not authenticated)
  const { data: currentUser } = useOptionalCurrentUser();

  const hasCover = !!post.cover;
  const postCover = useQuery({
    queryKey: ["/resources", post.cover],
    queryFn: ({ queryKey }) => getFileURL(queryKey[1]),
    enabled: hasCover,
  });

  // Check if current user has liked this post
  const { data: hasLiked = false } = useQuery({
    queryKey: ["post-liked", post.id, currentUser?.id],
    queryFn: () => checkHasLiked(post.id),
    enabled: !!currentUser && showLikeButton,
  });

  // Update local likes when post data changes
  useEffect(() => {
    setLocalLikes(post.likes);
  }, [post.likes]);

  // Update isLiked state when hasLiked data changes
  useEffect(() => {
    setIsLiked(hasLiked);
  }, [hasLiked]);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id),
    onMutate: async () => {
      // Optimistic update
      const previousIsLiked = isLiked;
      const previousLikes = localLikes;

      setIsLiked(!previousIsLiked);
      setLocalLikes((prev) => (previousIsLiked ? prev - 1 : prev + 1));

      return { previousIsLiked, previousLikes };
    },
    onSuccess: (data) => {
      setLocalLikes(data.likes);
      // Invalidate and refetch queries
      queryClient.invalidateQueries({
        queryKey: ["post-liked", post.id, currentUser?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLocalLikes(context.previousLikes);
      }
    },
  });

  const coverContainerRef = useRef<HTMLDivElement>(null);
  const coverWidth = coverContainerRef.current?.clientWidth ?? 300;
  return (
    <>
      {/* Gradient border wrapper for modern look */}
      <div className="relative group w-full h-full">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Card
          className="relative h-full flex flex-col rounded-2xl overflow-hidden border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
        
        >
          {/* Subtle shine on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-24 -left-24 h-48 w-48 rotate-45 bg-gradient-to-br from-primary/20 via-primary/0 to-transparent blur-2xl" />
          </div>
        <Show when={cardOrientation === "list"}>
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <Show when={hasCover}>
        <div className="flex-shrink-0 w-full sm:w-40 relative group/cover">
                <div
          className="rounded-xl w-full h-36 sm:h-28 overflow-hidden ring-1 ring-border/50 bg-muted/40"
                  ref={coverContainerRef}
                >
                  <Image
                    src={`${SERVER_URL}/v1/resources/${post.cover}`}
                    alt="Post Cover"
                    width={160}
                    height={128}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
                  />
                </div>
                <Show when={!!post.featured}>
                  <Badge className="absolute top-2 left-2 backdrop-blur bg-primary/90 text-primary-foreground flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </Badge>
                </Show>
              </div>
            </Show>
            <div className="flex-1 min-w-0 flex flex-col">
              <h3 className="text-xl font-semibold cursor-default flex items-center gap-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title || "Untitled Post"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground cursor-default line-clamp-2">
                {post.description || "No description available."}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {timeAgo(post.created_at)}
                </span>
                <Show when={showLikeButton}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      likeMutation.mutate();
                    }}
                    disabled={likeMutation.isPending}
                    className={`relative flex items-center gap-1 transition-colors hover:bg-transparent ${
                      isLiked
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isLiked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm font-medium tabular-nums">
                      {localLikes}
                    </span>
                  </Button>
                </Show>
              </div>
              <Show when={!!(post.tags && post.tags.length > 0)}>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <ClickableTag
                      key={tag.id}
                      tag={tag}
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10"
                    />
                  ))}
                </div>
              </Show>
            </div>
          </div>
        </Show>

        <Show when={cardOrientation === "grid"}>
      <CardHeader className={`p-0 ${!hasCover ? "pt-3" : ""}`}>
            <Show when={hasCover}>
              <div
        className="relative w-full h-32 overflow-hidden"
                ref={coverContainerRef}
              >
                <Show when={postCover.isLoading}>
                  <div className="w-full h-full flex items-center justify-center bg-muted/40">
                    <Spinner size={"small"} className="stroke-foreground" />
                  </div>
                </Show>
                <Show when={postCover.data !== undefined}>
                  <Image
                    src={postCover.data ?? "/nomedia.png"}
                    alt="Post Cover"
                    width={coverWidth}
                    height={128}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Show>
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                <Show when={!!post.featured}>
                  <Badge className="absolute top-2 left-2 backdrop-blur bg-primary/90 text-primary-foreground flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </Badge>
                </Show>
              </div>
            </Show>
            <div className="p-4 pt-3 space-y-1.5">
              <CardTitle className="text-lg font-semibold cursor-default flex items-center gap-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title || "Untitled Post"}
              </CardTitle>
              <CardDescription className="cursor-default line-clamp-2">
                {post.description || "No description available."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4 flex flex-1 flex-col gap-2">
            <Show when={!!(post.tags && post.tags.length > 0)}>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <ClickableTag
                    key={tag.id}
                    tag={tag}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10"
                  />
                ))}
              </div>
            </Show>
            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              <span>{timeAgo(post.created_at)}</span>
              <Show when={showLikeButton}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeMutation.mutate();
                  }}
                  disabled={likeMutation.isPending}
                  className={`relative flex items-center gap-1 transition-colors hover:bg-transparent ${
                    isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isLiked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-medium tabular-nums">{localLikes}</span>
                </Button>
              </Show>
            </div>
          </CardContent>
        </Show>

        <Show when={!cardOrientation}>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold cursor-default flex items-center gap-2 leading-snug group-hover:text-primary transition-colors">
              {post.title || "Untitled Post"}
              <Show when={!!post.featured}>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </Badge>
              </Show>
            </CardTitle>
            <CardDescription className="cursor-default line-clamp-3">
              {post.description || "No description available."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{timeAgo(post.created_at)}</span>
              <Show when={showLikeButton}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeMutation.mutate();
                  }}
                  disabled={likeMutation.isPending}
                  className={`relative flex items-center gap-1 transition-colors hover:bg-transparent ${
                    isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isLiked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-medium tabular-nums">
                    {localLikes}
                  </span>
                </Button>
              </Show>
            </div>
            <Show when={!!(post.tags && post.tags.length > 0)}>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <ClickableTag
                    key={tag.id}
                    tag={tag}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10"
                  />
                ))}
              </div>
            </Show>
          </CardContent>
        </Show>
        </Card>
      </div>
    </>
  );
}
