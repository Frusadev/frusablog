"use client";

import SearchResultItem from "./SearchResultItem";
import SearchLoading from "./SearchLoading";
import SearchEmptyState from "./SearchEmptyState";
import SearchError from "./SearchError";
import Show from "@/components/wrappers/Show";
import type { Post } from "@/lib/api/dto/post";

interface SearchResultsProps {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  debouncedQuery: string;
  lastPostRef: (node: HTMLDivElement) => void;
  onPostClick: (postId: string, title: string) => void;
}

export default function SearchResults({
  posts,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  debouncedQuery,
  lastPostRef,
  onPostClick,
}: SearchResultsProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      <Show when={isLoading}>
        <SearchLoading />
      </Show>

      <Show when={isError}>
        <SearchError />
      </Show>

      <Show
        when={
          !isLoading &&
          !isError &&
          posts.length === 0 &&
          debouncedQuery.length > 0
        }
      >
        <SearchEmptyState query={debouncedQuery} />
      </Show>

      <Show when={posts.length > 0}>
        <div className="p-2">
          {posts.map((post, index) => (
            <SearchResultItem
              key={post.id}
              post={post}
              isLast={index === posts.length - 1}
              lastPostRef={lastPostRef}
              onClick={() => onPostClick(post.id, post.title)}
            />
          ))}

          <Show when={isFetchingNextPage}>
            <div className="flex justify-center py-4">
              <SearchLoading />
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
  );
}
