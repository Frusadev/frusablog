"use client";

import { useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function useInfiniteScroll({
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseInfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return { lastPostRef };
}
