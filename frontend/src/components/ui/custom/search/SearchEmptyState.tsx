"use client";

interface SearchEmptyStateProps {
  query: string;
}

export default function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="p-4 text-center text-muted-foreground">
      No posts found for &ldquo;{query}&rdquo;
    </div>
  );
}
