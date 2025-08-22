import { Card } from "@/components/ui/card";

export default function FeaturedPostsLoading() {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="h-10 bg-muted rounded-lg mb-4 max-w-md mx-auto animate-pulse"></div>
        <div className="h-6 bg-muted rounded-lg max-w-2xl mx-auto animate-pulse"></div>
      </div>
      <Card className="overflow-hidden border-2 border-border/50 min-h-[400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
          <div className="bg-muted animate-pulse"></div>
          <div className="p-8 space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-10 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
