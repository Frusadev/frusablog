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
import Show from "@/components/wrappers/Show";
import { Post } from "@/lib/api/dto/post";
import { getFileURL } from "@/lib/api/requests/file";
import { likePost } from "@/lib/api/requests/post";
import { timeAgo } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

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
  
  const postCover = useQuery({
    queryKey: ["/resources", post.cover],
    queryFn: ({ queryKey }) => getFileURL(queryKey[1]),
  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id),
    onMutate: async () => {
      // Optimistic update
      setIsLiked(true);
      setLocalLikes(prev => prev + 1);
    },
    onSuccess: (data) => {
      setLocalLikes(data.likes);
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
    },
    onError: () => {
      // Revert optimistic update
      setIsLiked(false);
      setLocalLikes(post.likes);
    },
  });

  const coverContainerRef = useRef<HTMLDivElement>(null);
  const coverWidth = coverContainerRef.current?.clientWidth ?? 300
  return (
    <>
      <Card
        className={`${
          cardOrientation === "grid" ? "w-full sm:w-[300px]" : "w-full"
        } rounded-xl hover:bg-card/80`}
      >
        <Show when={cardOrientation === "list"}>
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="flex-shrink-0">
              <div
                className="rounded-xl w-full sm:w-32 h-48 sm:h-24 overflow-hidden"
                ref={coverContainerRef}
              >
                <Show when={postCover.isLoading}>
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Spinner size={"small"} className="stroke-foreground" />
                  </div>
                </Show>
                <Show when={postCover.data === undefined}>
                  <Image
                    src={"/nomedia.png"}
                    alt="Post Cover"
                    width={128}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </Show>
                <Show when={postCover.data !== undefined}>
                  <Image
                    src={postCover.data ?? "/nomedia.png"}
                    alt="Post Cover"
                    width={128}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </Show>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold cursor-default flex items-center gap-2 line-clamp-2">
                  {post.title || "Untitled Post"}
                  <Show when={!!post.featured}>
                    <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </Badge>
                  </Show>
                </h3>
              </div>
              <p className="text-sm text-muted-foreground cursor-default line-clamp-2 mb-3">
                {post.description || "No description available."}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {timeAgo(post.created_at)}
                </div>
                <Show when={showLikeButton}>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        likeMutation.mutate();
                      }}
                      disabled={likeMutation.isPending || isLiked}
                      className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm">{localLikes}</span>
                    </Button>
                  </div>
                </Show>
              </div>
              <Show when={!!(post.tags && post.tags.length > 0)}>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Show>
            </div>
          </div>
        </Show>
        
        <Show when={cardOrientation === "grid"}>
          <CardHeader>
            <div
              className="rounded-xl w-full h-[100px] overflow-hidden"
              ref={coverContainerRef}
            >
              <Show when={postCover.isLoading}>
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner size={"small"} className="stroke-foreground" />
                </div>
              </Show>
              <Show when={postCover.data === undefined}>
                <Image
                  src={"/nomedia.png"}
                  alt="Post Cover"
                  width={coverWidth}
                  height={100}
                  className="max-w-none max-h-none object-fill"
                />
              </Show>
              <Show when={postCover.data !== undefined}>
                <Image
                  src={postCover.data ?? "/nomedia.png"}
                  alt="Post Cover"
                  width={coverWidth}
                  height={100}
                  className="max-w-none max-h-none object-fill"
                />
              </Show>
            </div>
            <CardTitle className="text-lg font-semibold cursor-default flex items-center gap-2">
              {post.title || "Untitled Post"}
              <Show when={!!post.featured}>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </Badge>
              </Show>
            </CardTitle>
            <CardDescription className="cursor-default">
              {post.description || "No description available."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {timeAgo(post.created_at)}
              </div>
              <Show when={showLikeButton}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending || isLiked}
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm">{localLikes}</span>
                  </Button>
                </div>
              </Show>
            </div>
            <Show when={!!(post.tags && post.tags.length > 0)}>
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Show>
          </CardContent>
        </Show>

        <Show when={!cardOrientation}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold cursor-default flex items-center gap-2">
              {post.title || "Untitled Post"}
              <Show when={!!post.featured}>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </Badge>
              </Show>
            </CardTitle>
            <CardDescription className="cursor-default">
              {post.description || "No description available."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {timeAgo(post.created_at)}
              </div>
              <Show when={showLikeButton}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending || isLiked}
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm">{localLikes}</span>
                  </Button>
                </div>
              </Show>
            </div>
            <Show when={!!(post.tags && post.tags.length > 0)}>
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Show>
          </CardContent>
        </Show>
      </Card>
    </>
  );
}
