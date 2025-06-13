"use client";

import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/lib/api/requests/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import { ArrowLeft, Calendar, User, Star, Heart, Share2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

// Import highlight.js CSS for code syntax highlighting
import "highlight.js/styles/github-dark.css";

export default function PostView() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

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
              The post you're looking for doesn't exist or has been removed.
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
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to articles
          </Button>
        </div>

        {/* Cover Image */}
        <Show when={!!post.cover}>
          <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-8 bg-muted">
            <img
              src={getResourceUrl(post.cover) || "/nomedia.png"}
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
          <div className="flex items-center gap-2 mb-4">
            <Show when={!!post.featured}>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
            </Show>
            {post.tags?.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <Show when={!!post.description}>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {post.description}
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
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{post.likes} likes</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.description,
                      url: window.location.href,
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="mb-8">
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                  // Custom styling for markdown elements
                  h1: ({ children, ...props }: any) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }: any) => (
                    <h2 className="text-2xl font-semibold mt-8 mb-4 first:mt-0" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }: any) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 first:mt-0" {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }: any) => (
                    <p className="mb-4 leading-7 text-foreground" {...props}>
                      {children}
                    </p>
                  ),
                  blockquote: ({ children, ...props }: any) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className, ...props }: any) => {
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
                  pre: ({ children, ...props }: any) => (
                    <pre
                      className="bg-muted rounded-lg p-4 overflow-x-auto my-6"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  ul: ({ children, ...props }: any) => (
                    <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: any) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }: any) => (
                    <li className="text-foreground" {...props}>
                      {children}
                    </li>
                  ),
                  a: ({ children, ...props }: any) => (
                    <a
                      className="text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  img: ({ alt, ...props }: any) => (
                    <img
                      className="rounded-lg my-6 max-w-full h-auto"
                      alt={alt}
                      {...props}
                    />
                  ),
                  hr: ({ ...props }: any) => (
                    <hr className="my-8 border-border" {...props} />
                  ),
                  table: ({ children, ...props }: any) => (
                    <div className="overflow-x-auto my-6">
                      <table
                        className="min-w-full border-collapse border border-border"
                        {...props}
                      >
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children, ...props }: any) => (
                    <th
                      className="border border-border bg-muted px-4 py-2 text-left font-semibold"
                      {...props}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }: any) => (
                    <td className="border border-border px-4 py-2" {...props}>
                      {children}
                    </td>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{post.likes} likes</span>
              </Button>
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
