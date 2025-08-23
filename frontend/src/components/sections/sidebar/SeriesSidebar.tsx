"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllPostSeries } from "@/lib/api/requests/post-series";
import { getResourceUrl } from "@/lib/utils/fileUtils";

function SeriesSidebarItem({ id, title, cover }: { id: string; title: string; cover?: string | null }) {
  const coverUrl = cover ? getResourceUrl(cover) : null;
  return (
    <Link
      href={`/series/${id}`}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
    >
      <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
        <img
          src={coverUrl || "/nomedia.png"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/nomedia.png";
          }}
        />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-sm line-clamp-2">{title}</h4>
      </div>
    </Link>
  );
}

export default function SeriesSidebar() {
  const { data: series = [], isLoading } = useQuery({
    queryKey: ["series", 0, 2],
    queryFn: () => getAllPostSeries(0, 2),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !series || series.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Series</h3>
        <Link href="/series" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {series.slice(0, 2).map((s) => (
          <SeriesSidebarItem key={s.id} id={s.id} title={s.title} cover={s.cover} />
        ))}
      </div>
    </div>
  );
}
