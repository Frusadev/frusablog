"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllPostSeries } from "@/lib/api/requests/post-series";
import type { PostSeries } from "@/lib/api/dto/post-series";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import Show from "@/components/wrappers/Show";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

function SeriesCard({ series }: { series: PostSeries }) {
  const coverUrl = series.cover ? getResourceUrl(series.cover) : null;
  return (
    <Link href={`/series/${series.id}`} id={series.id} className="h-full block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
        <div className="relative w-full aspect-[16/9] bg-muted">
          <img
            src={coverUrl || "/nomedia.png"}
            alt={series.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/nomedia.png";
            }}
          />
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">
            {series.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {series.description}
          </p>
          <p className="text-xs text-muted-foreground mt-auto">
            {new Date(series.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SeriesPage() {
  const loader = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isFetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["series", PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getAllPostSeries(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });

  const items: PostSeries[] = (data?.pages || []).flat();

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetching && hasNextPage) {
        fetchNextPage();
      }
    },
    [isFetching, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Series</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {items.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>

      <Show when={isLoading && items.length === 0}>
        <div className="mt-6 text-sm text-muted-foreground">Loading series...</div>
      </Show>

      <div ref={loader} className="h-10" />
    </div>
  );
}
