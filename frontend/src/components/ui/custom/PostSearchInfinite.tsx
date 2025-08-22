"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchPosts } from "@/lib/api/requests/post";
import { useRouter } from "next/navigation";
import { createPostSlug } from "@/lib/utils/slug";
import Show from "@/components/wrappers/Show";
import SearchInput from "./search/SearchInput";
import SearchResults from "./search/SearchResults";
import { useDebounce } from "./search/useDebounce";
import { useInfiniteScroll } from "./search/useInfiniteScroll";
import { useClickOutside } from "./search/useClickOutside";
import type { Post } from "@/lib/api/dto/post";

const SEARCH_POSTS_PER_PAGE = 10;

export default function PostSearchInfinite() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  const searchRef = useClickOutside({
    onClickOutside: () => setIsOpen(false),
  });

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

  const posts: Post[] = data?.pages.flatMap((page) => page) || [];

  const { lastPostRef } = useInfiniteScroll({
    isLoading,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  const handlePostClick = (postId: string, title: string) => {
    setIsOpen(false);
    router.push(`/post/${createPostSlug(title, postId)}`);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={searchRef} className="relative w-full md:w-96 lg:w-[32rem] xl:w-[36rem]">
      <SearchInput
        query={query}
        onQueryChange={handleQueryChange}
        onFocus={handleFocus}
        onClear={handleClear}
      />

      <Show when={isOpen && debouncedQuery.length > 0}>
        <SearchResults
          posts={posts}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage || false}
          debouncedQuery={debouncedQuery}
          lastPostRef={lastPostRef}
          onPostClick={handlePostClick}
        />
      </Show>
    </div>
  );
}
