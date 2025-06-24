"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, likePost, translatePost, getPostViews, checkHasLiked } from "@/lib/api/requests/post";
import { getPostComments, createComment, likeComment, deleteComment } from "@/lib/api/requests/comment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/Spinner";
import { ShareButton } from "@/components/ui/share-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThemeSwitch from "@/components/ui/custom/ThemeSwitch";
import Show from "@/components/wrappers/Show";
import { ArrowLeft, Calendar, User, Star, Heart, MessageSquare, Reply, Send, Trash2, Languages, Eye } from "lucide-react";
import { timeAgo, formatNumber } from "@/lib/utils";
import { extractIdFromSlug } from "@/lib/utils/slug";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { useRouter } from "next/navigation";
import { useOptionalCurrentUser } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useViewTracking } from "@/hooks/useUserTracking";
import type { SupportedLanguages, PostTranslationResult, LanguageOption } from "@/lib/api/dto/post";

// Import highlight.js CSS for code syntax highlighting
import "highlight.js/styles/github-dark.css";

interface PostViewClientProps {
  slug: string;
}

export default function PostViewClient({ slug }: PostViewClientProps) {
  const router = useRouter();
  const postId = extractIdFromSlug(slug);
  const queryClient = useQueryClient();

  // State for commenting
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  
  // State for post likes
  const [localLikes, setLocalLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // State for translation
  const [translatedContent, setTranslatedContent] = useState<PostTranslationResult | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("Original");
  const [translationCache, setTranslationCache] = useState<Record<SupportedLanguages, PostTranslationResult>>({} as Record<SupportedLanguages, PostTranslationResult>);

  // Initialize view tracking for this post
  useViewTracking();

  // Get current user (optional - doesn't throw if not authenticated)
  const { data: currentUser } = useOptionalCurrentUser();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  // Fetch comments for this post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments({ postId }),
    enabled: !!postId,
  });

  // Fetch post views
  const { data: views = 0 } = useQuery({
    queryKey: ["post-views", postId],
    queryFn: () => getPostViews(postId),
    enabled: !!postId,
  });

  // Check if current user has liked this post
  const { data: hasLiked = false } = useQuery({
    queryKey: ["post-liked", postId, currentUser?.id],
    queryFn: () => checkHasLiked(postId),
    enabled: !!postId && !!currentUser,
  });

  // Update local likes when post data changes
  useEffect(() => {
    if (post) {
      setLocalLikes(post.likes);
    }
  }, [post]);

  // Update isLiked state when hasLiked data changes
  useEffect(() => {
    setIsLiked(hasLiked);
  }, [hasLiked]);

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: () => likePost(postId),
    onMutate: async () => {
      // Optimistic update
      const previousIsLiked = isLiked;
      const previousLikes = localLikes;
      
      setIsLiked(!previousIsLiked);
      setLocalLikes(prev => previousIsLiked ? prev - 1 : prev + 1);
      
      return { previousIsLiked, previousLikes };
    },
    onSuccess: (data) => {
      setLocalLikes(data.likes);
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-liked", postId, currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["featured-posts"] });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLocalLikes(context.previousLikes);
      }
      toast.error("Failed to like post. Please try again.");
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      toast.success("Comment posted successfully!");
    },
    onError: () => {
      toast.error("Failed to post comment. Please try again.");
    },
  });

  // Translation mutation
  const translatePostMutation = useMutation({
    mutationFn: ({ language }: { language: SupportedLanguages }) => 
      translatePost(postId, language),
    onSuccess: (data, variables) => {
      // Cache the translation
      setTranslationCache(prev => ({
        ...prev,
        [variables.language]: data
      }));
      setTranslatedContent(data);
      setShowTranslation(true);
      toast.success("Post translated successfully!");
    },
    onError: (error) => {
      console.error("Translation error:", error);
      
      // Handle specific error cases
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        toast.error("Translation request was cancelled. Please try again.");
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to translate post. Please try again.");
      }
    },
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: likeComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => {
      toast.error("Failed to like comment.");
    },
  });

  // Delete comment mutation  
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete comment.");
    },
  });

  const handleCreateComment = () => {
    if (!currentUser) {
      toast.error("Please log in to comment");
      router.push("/login");
      return;
    }
    
    if (newComment.trim()) {
      createCommentMutation.mutate({
        postId,
        content: newComment.trim(),
        parentId: null,
      });
    }
  };

  const handleReply = (parentId: string) => {
    if (!currentUser) {
      toast.error("Please log in to reply");
      router.push("/login");
      return;
    }
    
    if (replyContent.trim()) {
      createCommentMutation.mutate({
        postId,
        content: replyContent.trim(),
        parentId,
      });
    }
  };

  const handleTranslatePost = (language: LanguageOption) => {
    if (language === "Original") {
      setShowTranslation(false);
      setSelectedLanguage(language);
      return;
    }
    
    // Prevent multiple simultaneous translation requests
    if (translatePostMutation.isPending) {
      toast.warning("Translation in progress. Please wait...");
      return;
    }
    
    setSelectedLanguage(language);
    
    // Check if we already have this translation cached
    if (translationCache[language]) {
      setTranslatedContent(translationCache[language]);
      setShowTranslation(true);
      toast.success("Translation loaded from cache!");
      return;
    }
    
    // Reset previous translation when selecting a new language
    if (selectedLanguage !== language) {
      setTranslatedContent(null);
      setShowTranslation(false);
    }
    
    translatePostMutation.mutate({ language });
  };

  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const handleLikeComment = (commentId: string) => {
    if (!currentUser) {
      toast.error("Please log in to like comments");
      router.push("/login");
      return;
    }
    likeCommentMutation.mutate(commentId);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) {
      return;
    }
    deleteCommentMutation.mutate(commentId);
  };

  const handleLikePost = () => {
    if (!currentUser) {
      toast.error("Please log in to like posts");
      router.push("/login");
      return;
    }
    likePostMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center py-20">
            <Spinner size="large" className="stroke-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Back Button and Theme Switcher */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to articles</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <ThemeSwitch />
        </div>

        {/* Cover Image */}
        <Show when={!!post.cover}>
          <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-8 bg-muted">
            <Image
              src={getResourceUrl(post.cover) || "/nomedia.png"}
              width={1200}
              height={600}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/nomedia.png";
              }}
            />
          </div>
        </Show>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <Show when={!!post.featured}>
              <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            </Show>
            {post.tags?.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs shrink-0">
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {showTranslation && translatedContent && selectedLanguage !== "Original" ? translatedContent.title : post.title}
          </h1>

          <Show when={!!(showTranslation && translatedContent && selectedLanguage !== "Original" ? translatedContent.description : post.description)}>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {showTranslation && translatedContent && selectedLanguage !== "Original" ? translatedContent.description : post.description}
            </p>
          </Show>

          {/* Author and Meta Information */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">
                  {post.author.name || post.author.username}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{timeAgo(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{formatNumber(views)} views</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikePost}
                disabled={likePostMutation.isPending}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Show when={likePostMutation.isPending}>
                  <Spinner size="small" className="w-4 h-4 stroke-current" />
                </Show>
                <Show when={!likePostMutation.isPending}>
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Show>
                <span>{localLikes} likes</span>
              </Button>
              
              {/* Translation Button with Language Selector */}
              <div className="flex items-center gap-2">
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => handleTranslatePost(value as LanguageOption)}
                  disabled={translatePostMutation.isPending}
                >
                  <SelectTrigger className="w-auto min-w-[140px]" size="sm">
                    <div className="flex items-center gap-2">
                      <Show when={translatePostMutation.isPending}>
                        <Spinner size="small" className="w-4 h-4 stroke-current" />
                      </Show>
                      <Show when={!translatePostMutation.isPending}>
                        <Languages className="w-4 h-4" />
                      </Show>
                      <SelectValue placeholder="Language">
                        {translatePostMutation.isPending ? "Translating..." : selectedLanguage}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original">
                      <span className="font-medium">Original</span>
                    </SelectItem>
                    <SelectItem value="English" disabled={translatePostMutation.isPending}>
                      English
                    </SelectItem>
                    <SelectItem value="French" disabled={translatePostMutation.isPending}>
                      Français (French)
                    </SelectItem>
                    <SelectItem value="Spanish" disabled={translatePostMutation.isPending}>
                      Español (Spanish)
                    </SelectItem>
                    <SelectItem value="German" disabled={translatePostMutation.isPending}>
                      Deutsch (German)
                    </SelectItem>
                    <SelectItem value="Chinese" disabled={translatePostMutation.isPending}>
                      中文 (Chinese)
                    </SelectItem>
                    <SelectItem value="Japanese" disabled={translatePostMutation.isPending}>
                      日本語 (Japanese)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ShareButton
                title={post.title}
                description={post.description}
                url={typeof window !== 'undefined' ? window.location.href : ''}
              />
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="mb-8">
          {/* Translation Toggle */}
          <Show when={!!translatedContent && selectedLanguage !== "Original"}>
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    <Show when={showTranslation}>
                      Content shown in {selectedLanguage}
                    </Show>
                    <Show when={!showTranslation}>
                      Translation available in {selectedLanguage}
                    </Show>
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleTranslation}
                >
                  {showTranslation ? "Show Original" : "Show Translation"}
                </Button>
              </div>
            </div>
          </Show>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                  // Custom styling for markdown elements
                  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h2 className="text-2xl font-semibold mt-8 mb-4 first:mt-0" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 first:mt-0" {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
                    <p className="mb-4 leading-7 text-foreground" {...props}>
                      {children}
                    </p>
                  ),
                  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
                    const isInline = !className?.includes('language-');
                    return isInline ? (
                      <code
                        className="bg-muted px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code {...props}>{children}</code>
                    );
                  },
                  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
                    <pre
                      className="bg-muted rounded-lg p-4 overflow-x-auto my-6"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
                    <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
                    <li className="text-foreground" {...props}>
                      {children}
                    </li>
                  ),
                  a: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
                    <a
                      className="text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  img: ({ alt, src }: React.ImgHTMLAttributes<HTMLImageElement>) => (
                    <Image
                      className="rounded-lg my-6 max-w-full h-auto"
                      alt={alt || ""}
                      src={typeof src === 'string' ? src : ""}
                      width={800}
                      height={600}
                    />
                  ),
                  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
                    <hr className="my-8 border-border" {...props} />
                  ),
                  table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
                    <div className="overflow-x-auto my-6">
                      <table
                        className="min-w-full border-collapse border border-border"
                        {...props}
                      >
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
                    <th
                      className="border border-border bg-muted px-4 py-2 text-left font-semibold"
                      {...props}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
                    <td className="border border-border px-4 py-2" {...props}>
                      {children}
                    </td>
                  ),
                }}
              >
                {showTranslation && translatedContent && selectedLanguage !== "Original" ? translatedContent.content : post.content}
              </ReactMarkdown>
            </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Comments ({comments.length})
            </h2>

            {/* New Comment Form */}
            <Show when={!!currentUser}>
              <div className="mb-8">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">
                        {currentUser?.name} (@{currentUser?.username})
                      </p>
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3 min-h-[100px] resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCreateComment}
                          disabled={!newComment.trim() || createCommentMutation.isPending}
                          size="sm"
                        >
                          <Show when={createCommentMutation.isPending}>
                            <Spinner size="small" className="stroke-background mr-2" />
                          </Show>
                          <Show when={!createCommentMutation.isPending}>
                            <Send className="w-4 h-4 mr-2" />
                          </Show>
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            {/* Login prompt for non-authenticated users */}
            <Show when={!currentUser}>
              <div className="mb-8 bg-muted/50 rounded-lg p-6 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Join the conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Log in to share your thoughts and engage with other readers.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href="/login">
                    <Button variant="default" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </Show>

            {/* Comments List */}
            <Show when={commentsLoading}>
              <div className="flex justify-center py-8">
                <Spinner size="large" className="stroke-primary" />
              </div>
            </Show>

            <Show when={!commentsLoading && comments.length === 0}>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your thoughts on this article.
                </p>
              </div>
            </Show>

            <Show when={!commentsLoading && comments.length > 0}>
              <div className="space-y-6">
                {comments
                  .filter((comment) => !comment.parent_id) // Top-level comments only
                  .map((comment) => (
                    <div key={comment.id} className="border border-border rounded-lg p-4">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{comment.author.username} • {timeAgo(comment.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <Show when={currentUser?.id === comment.author.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Show>
                      </div>

                      {/* Comment Content */}
                      <div className="mb-4">
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                          disabled={!currentUser}
                        >
                          <Heart className={`w-4 h-4 ${comment.likes > 0 ? 'fill-current text-red-500' : ''}`} />
                          <span className="text-xs">{comment.likes}</span>
                        </Button>
                        
                        <Show when={!!currentUser}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                            <span className="text-xs">Reply</span>
                          </Button>
                        </Show>
                      </div>

                      {/* Reply Form */}
                      <Show when={replyingTo === comment.id && !!currentUser}>
                        <div className="mt-4 pl-6 border-l-2 border-border">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <Textarea
                              placeholder={`Reply to ${comment.author.name}...`}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="mb-3 min-h-[80px] resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyContent.trim() || createCommentMutation.isPending}
                                size="sm"
                              >
                                <Show when={createCommentMutation.isPending}>
                                  <Spinner size="small" className="stroke-background mr-2" />
                                </Show>
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Show>

                      {/* Replies */}
                      <Show when={comment.children && comment.children.length > 0}>
                        <div className="mt-4 pl-6 border-l-2 border-border space-y-4">
                          {comment.children.map((reply) => (
                            <div key={reply.id} className="bg-muted/30 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{reply.author.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      @{reply.author.username} • {timeAgo(reply.created_at)}
                                    </p>
                                  </div>
                                </div>
                                
                                <Show when={currentUser?.id === reply.author.id}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </Show>
                              </div>
                              
                              <p className="text-sm leading-relaxed mb-2">{reply.content}</p>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeComment(reply.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                                disabled={!currentUser}
                              >
                                <Heart className={`w-3 h-3 ${reply.likes > 0 ? 'fill-current text-red-500' : ''}`} />
                                <span className="text-xs">{reply.likes}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Show>
                    </div>
                  ))}
              </div>
            </Show>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikePost}
                disabled={likePostMutation.isPending}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Show when={likePostMutation.isPending}>
                  <Spinner size="small" className="w-4 h-4 stroke-current" />
                </Show>
                <Show when={!likePostMutation.isPending}>
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Show>
                <span>{localLikes} likes</span>
              </Button>
              <ShareButton
                title={post.title}
                description={post.description}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                variant="outline"
              />
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Browse more articles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
