"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClickableTag from "@/components/ui/custom/ClickableTag";
import type { Post } from "@/lib/api/dto/post";

interface PopularTagsSidebarProps {
  featuredPosts: Post[];
  posts: Post[];
}

export default function PopularTagsSidebar({ featuredPosts, posts }: PopularTagsSidebarProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Popular Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {Array.from(
            new Set(
              [...featuredPosts, ...posts]
                .flatMap((post) => post.tags || [])
                .slice(0, 15),
            ),
          ).map((tag) => (
            <ClickableTag
              key={tag.id}
              tag={tag}
              variant="outline"
              size="sm"
              className="max-w-[120px] truncate"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
