"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPostSeries } from "@/lib/api/requests/post-series";
import { getSeriesPosts } from "@/lib/api/requests/post-series";
import type { Post } from "@/lib/api/dto/post";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import Show from "@/components/wrappers/Show";
import PostsList from "@/components/sections/PostsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PAGE_SIZE = 10;

export default function SeriesDetailPage() {
  const { id } = useParams() as { id: string };

  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ["series", id],
    queryFn: () => getPostSeries(id),
    enabled: !!id,
  });

  const {
    data,
    isFetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["series-posts", id, PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getSeriesPosts(id, pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    enabled: !!id,
  });

  const posts: Post[] = useMemo(() => (data?.pages || []).flat(), [data]);

  const loader = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    });
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const coverUrl = series?.cover ? getResourceUrl(series.cover) : null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
          </Button>
        </Link>
      </div>
      <Show when={!!series && !seriesLoading}>
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-56 h-36 rounded-lg overflow-hidden bg-muted">
              <img
                src={coverUrl || "/nomedia.png"}
                alt={series?.title || "Series cover"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/nomedia.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold line-clamp-2">{series?.title}</h1>
              <p className="text-muted-foreground mt-2 line-clamp-3">
                {series?.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {series?.last_updated ? new Date(series.last_updated).toLocaleString() : new Date(series?.created_at || "").toLocaleString()}
              </p>
            </div>
          </div>
        </header>
      </Show>

      <section>
        <PostsList
          posts={posts}
          isLoading={isLoading && posts.length === 0}
          isFetching={isFetching}
          hasMorePosts={!!hasNextPage}
          currentPage={Math.ceil(posts.length / PAGE_SIZE)}
          onLoadMore={() => fetchNextPage()}
        />
        <div ref={loader} className="h-10" />
      </section>
    </div>
  );
}
