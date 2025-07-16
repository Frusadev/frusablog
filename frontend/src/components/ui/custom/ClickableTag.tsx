"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/api/dto/tag";

interface ClickableTagProps {
  tag: Tag;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
  size?: "sm" | "md";
}

export default function ClickableTag({ 
  tag, 
  variant = "secondary", 
  className,
  size = "md"
}: ClickableTagProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click handlers
    router.push(`/tag/${tag.id}`);
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105",
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "md" && "text-sm px-2 py-1",
        className
      )}
      onClick={handleClick}
      title={`View posts tagged with "${tag.name}"`}
    >
      {tag.name}
    </Badge>
  );
}
