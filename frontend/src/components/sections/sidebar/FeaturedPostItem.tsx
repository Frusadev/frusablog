"use client";

import { User } from "lucide-react";
import ClickableTag from "@/components/ui/custom/ClickableTag";
import Show from "@/components/wrappers/Show";
import { timeAgo } from "@/lib/utils";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { createPostSlug } from "@/lib/utils/slug";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Post } from "@/lib/api/dto/post";

interface FeaturedPostItemProps {
  post: Post;
}

export default function FeaturedPostItem({ post }: FeaturedPostItemProps) {
  const router = useRouter();

  return (
    <div
      className="group cursor-pointer"
      onClick={() =>
        router.push(`/post/${createPostSlug(post.title, post.id)}`)
      }
    >
      <div className="flex gap-3">
        <Show when={!!post.cover}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            <Image
              src={getResourceUrl(post.cover) || "/nomedia.png"}
              alt={post.title}
              width={64}
              height={64}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/nomedia.png";
              }}
            />
          </div>
        </Show>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors text-sm">
            {post.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {post.author.name || post.author.username}
            </span>
            <span className="flex-shrink-0">•</span>
            <span className="flex-shrink-0">
              {post.created_at ? timeAgo(post.created_at) : "Unknown date"}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 overflow-hidden">
            <div className="flex gap-1 min-w-0">
              {post.tags?.slice(0, 2).map((tag) => (
                <ClickableTag
                  key={tag.id}
                  tag={tag}
                  variant="secondary"
                  size="sm"
                  className="max-w-[80px] truncate"
                />
              ))}
            </div>
            {(post.tags?.length || 0) > 2 && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                +{(post.tags?.length || 0) - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
