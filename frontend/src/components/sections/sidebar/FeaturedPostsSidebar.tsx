"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Show from "@/components/wrappers/Show";
import FeaturedPostItem from "./FeaturedPostItem";
import type { Post } from "@/lib/api/dto/post";
import JoinNewsletter from "@/components/ui/custom/JoinNewsletter";

interface FeaturedPostsSidebarProps {
  featuredPosts: Post[];
}

export default function FeaturedPostsSidebar({
  featuredPosts,
}: FeaturedPostsSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <Show when={featuredPosts.length > 0}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              Featured Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredPosts.slice(0, 3).map((post) => (
              <FeaturedPostItem key={post.id} post={post} />
            ))}
          </CardContent>
        </Card>
      </Show>
      <JoinNewsletter />
    </div>
  );
}
