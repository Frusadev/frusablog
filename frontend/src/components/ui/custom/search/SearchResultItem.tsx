"use client";

import Show from "@/components/wrappers/Show";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import type { Post } from "@/lib/api/dto/post";

interface SearchResultItemProps {
  post: Post;
  onClick: () => void;
  isLast?: boolean;
  lastPostRef?: (node: HTMLDivElement) => void;
}

export default function SearchResultItem({
  post,
  onClick,
  isLast = false,
  lastPostRef,
}: SearchResultItemProps) {
  return (
    <div
      ref={isLast ? lastPostRef : null}
      onClick={onClick}
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
              <span
                key={tag.id}
                className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
