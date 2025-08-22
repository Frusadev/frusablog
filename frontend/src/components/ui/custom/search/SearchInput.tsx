"use client";

import { Search, X } from "lucide-react";
import { Input } from "../../input";
import { Button } from "../../button";
import Show from "@/components/wrappers/Show";

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onClear: () => void;
}

export default function SearchInput({
  query,
  onQueryChange,
  onFocus,
  onClear,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        className="pl-10 pr-10 py-6 rounded-xl"
      />
      <Show when={query.length > 0}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
        >
          <X className="w-3 h-3" />
        </Button>
      </Show>
    </div>
  );
}
