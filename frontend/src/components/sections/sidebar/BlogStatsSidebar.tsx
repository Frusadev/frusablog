"use client";

import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import StatItem from "./StatItem";

interface Stats {
  total_articles?: number;
  featured?: number;
  total_likes?: number;
  total_comments?: number;
}

interface BlogStatsSidebarProps {
  stats?: Stats;
  statsLoading: boolean;
  statsError: boolean;
}

export default function BlogStatsSidebar({ 
  stats, 
  statsLoading, 
  statsError 
}: BlogStatsSidebarProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-primary" />
          Blog Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Show when={statsLoading}>
          <div className="flex justify-center py-4">
            <Spinner size="small" className="stroke-primary" />
          </div>
        </Show>
        <Show when={statsError}>
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Unable to load stats</p>
          </div>
        </Show>
        <Show when={!statsLoading && !statsError}>
          <div className="grid grid-cols-2 gap-4">
            <StatItem value={stats?.total_articles || 0} label="Articles" />
            <StatItem value={stats?.featured || 0} label="Featured" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatItem value={stats?.total_likes || 0} label="Total Likes" />
            <StatItem value={stats?.total_comments || 0} label="Comments" />
          </div>
        </Show>
      </CardContent>
    </Card>
  );
}
