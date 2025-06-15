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
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-xl">Comments Management</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">Total: {allCommentsCount}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Discussions
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Post Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Post to View Comments</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Click to view comments
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
              <CardTitle>
                Comments for: {selectedPost?.title}
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
                        <div className="flex items-start justify-between">
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
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {timeAgo(comment.created_at)}
                            </Badge>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
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
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
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
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Post
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
