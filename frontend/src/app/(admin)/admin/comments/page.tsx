"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import { getPostComments, deleteComment } from "@/lib/api/requests/comment";
import { getPosts } from "@/lib/api/requests/post";
import { 
  MessageSquare,
  User,
  Calendar,
  Trash2,
  Eye,
  Heart
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Fetch all posts first
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "all"],
    queryFn: () => getPosts({ skip: 0, limit: 100 }), // Get enough posts
  });

  // Fetch comments for selected post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: () => selectedPostId ? getPostComments({ postId: selectedPostId }) : Promise.resolve([]),
    enabled: !!selectedPostId,
  });

  // Calculate total comments across all posts
  const { data: allCommentsCount = 0 } = useQuery({
    queryKey: ["comments", "count"],
    queryFn: async () => {
      if (posts.length === 0) return 0;
      
      const commentCounts = await Promise.all(
        posts.map(async (post) => {
          try {
            const postComments = await getPostComments({ postId: post.id });
            return postComments.length;
          } catch {
            return 0;
          }
        })
      );
      
      return commentCounts.reduce((sum, count) => sum + count, 0);
    },
    enabled: posts.length > 0,
  });

  // Auto-select first post with comments
  useMemo(() => {
    if (!selectedPostId && posts.length > 0) {
      // Find first post with comments or just select the first post
      setSelectedPostId(posts[0].id);
    }
  }, [posts, selectedPostId]);

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Comment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const selectedPost = posts.find(post => post.id === selectedPostId);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-lg sm:text-xl">Comments Management</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Total: {allCommentsCount}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Discussions
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-4 space-y-4 sm:space-y-6">
        {/* Post Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Select Post to View Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Show when={postsLoading}>
              <div className="flex justify-center py-8">
                <Spinner size="large" className="stroke-primary" />
              </div>
            </Show>

            <Show when={!postsLoading && posts.length === 0}>
              <p className="text-muted-foreground text-center py-8">
                No posts found. Create some posts first to see comments.
              </p>
            </Show>

            <Show when={!postsLoading && posts.length > 0}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPostId === post.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPostId(post.id)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <span className="hidden sm:inline">Click to view comments</span>
                          <span className="sm:hidden">Tap to view</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Show>
          </CardContent>
        </Card>

        {/* Comments for Selected Post */}
        <Show when={!!(selectedPostId && selectedPost)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Comments for: <span className="block sm:inline text-base sm:text-lg font-normal text-muted-foreground mt-1 sm:mt-0">{selectedPost?.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Show when={commentsLoading}>
                <div className="flex justify-center py-8">
                  <Spinner size="large" className="stroke-primary" />
                </div>
              </Show>

              <Show when={!commentsLoading && comments.length === 0}>
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Comments Yet</h3>
                  <p className="text-muted-foreground text-center py-8">
                    This post doesn&apos;t have any comments yet.
                  </p>
                </div>
              </Show>

              <Show when={!commentsLoading && comments.length > 0}>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{comment.author.name}</p>
                              <p className="text-sm text-muted-foreground">
                                @{comment.author.username}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                            <Badge variant="outline" className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start">
                              <Calendar className="w-3 h-3" />
                              {timeAgo(comment.created_at)}
                            </Badge>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  <Trash2 className="w-4 h-4 sm:mr-0" />
                                  <span className="sm:hidden ml-2">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this comment? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    <Show when={deleteCommentMutation.isPending}>
                                      <Spinner size="small" className="stroke-background mr-2" />
                                    </Show>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {comment.likes} likes
                              </Badge>
                              
                              <Show when={comment.children && comment.children.length > 0}>
                                <Badge variant="outline">
                                  {comment.children.length} replies
                                </Badge>
                              </Show>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Link href={`/post/${selectedPostId}`}>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  <Eye className="w-4 h-4 mr-2" />
                                  <span className="hidden sm:inline">View Post</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Show>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  );
}
