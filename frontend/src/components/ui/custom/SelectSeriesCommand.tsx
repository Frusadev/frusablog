"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { getAllPostSeries } from "@/lib/api/requests/post-series";
import type { PostSeries } from "@/lib/api/dto/post-series";
import { ChevronDown, X } from "lucide-react";

const PAGE_SIZE = 20;

export default function SelectSeriesCommand({
  value,
  onChange,
  buttonClassName,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["series", PAGE_SIZE],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getAllPostSeries(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });

  const items: PostSeries[] = useMemo(() => (data?.pages || []).flat(), [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) =>
      [s.title, s.description || ""].some((t) => t.toLowerCase().includes(q))
    );
  }, [items, query]);

  const selectedLabel = useMemo(() => {
    const found = items.find((s) => s.id === value);
    return found?.title || "No series";
  }, [items, value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className={buttonClassName}
          onClick={() => setOpen(true)}
        >
          <span className="truncate max-w-[240px]">{selectedLabel}</span>
          <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            title="Clear series"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} title="Select Series" showCloseButton>
        <CommandInput
          placeholder="Search series..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No series found.</CommandEmpty>
          <CommandGroup heading="Series">
            {filtered.map((s) => (
              <CommandItem
                key={s.id}
                onSelect={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{s.title}</span>
                  {s.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">{s.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
            {hasNextPage && (
              <CommandItem
                disabled={isFetching}
                onSelect={() => {
                  if (hasNextPage) fetchNextPage();
                }}
              >
                {isFetching ? "Loading more..." : "Load more"}
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
