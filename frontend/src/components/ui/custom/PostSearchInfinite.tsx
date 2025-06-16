"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "../input";
import { searchPosts } from "@/lib/api/requests/post";
import { Search, X } from "lucide-react";
import { Button } from "../button";
import { Spinner } from "../Spinner";
import Show from "@/components/wrappers/Show";
import { useRouter } from "next/navigation";
import { createPostSlug } from "@/lib/utils/slug";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import type { Post } from "@/lib/api/dto/post";

const SEARCH_POSTS_PER_PAGE = 10;

export default function PostSearchInfinite() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<Post[], Error>({
    queryKey: ["search-posts", debouncedQuery],
    queryFn: ({ pageParam = 0 }) =>
      searchPosts({
        query: debouncedQuery,
        skip: pageParam as number,
        limit: SEARCH_POSTS_PER_PAGE,
      }),
    getNextPageParam: (lastPage: Post[], allPages: Post[][]) => {
      if (lastPage.length < SEARCH_POSTS_PER_PAGE) return undefined;
      return allPages.length * SEARCH_POSTS_PER_PAGE;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialPageParam: 0,
  });

  const posts: Post[] = data?.pages.flatMap(page => page) || [];

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  const handlePostClick = (postId: string, title: string) => {
    setIsOpen(false);
    router.push(`/post/${createPostSlug(title, postId)}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 rounded-full"
        />
        <Show when={query.length > 0}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </Show>
      </div>

      <Show when={isOpen && debouncedQuery.length > 0}>
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <Show when={isLoading}>
            <div className="flex justify-center py-8">
              <Spinner size="small" />
            </div>
          </Show>

          <Show when={isError}>
            <div className="p-4 text-center text-muted-foreground">
              Error searching posts. Please try again.
            </div>
          </Show>

          <Show when={!isLoading && !isError && posts.length === 0 && debouncedQuery.length > 0}>
            <div className="p-4 text-center text-muted-foreground">
              No posts found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          </Show>

          <Show when={posts.length > 0}>
            <div className="p-2">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                  onClick={() => handlePostClick(post.id, post.title)}
                  className="cursor-pointer p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="flex gap-3">
                    <Show when={!!post.cover}>
                      <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1 text-sm">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={tag.id} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Show when={isFetchingNextPage}>
                <div className="flex justify-center py-4">
                  <Spinner size="small" />
                </div>
              </Show>

              <Show when={!hasNextPage && posts.length > 0}>
                <div className="text-center py-2 text-xs text-muted-foreground">
                  No more results
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
