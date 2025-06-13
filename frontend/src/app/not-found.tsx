"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-6 py-12 text-center">
        <div className="flex justify-center mb-6">
          <Search className="w-24 h-24 text-muted-foreground" />
        </div>
        
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Back Home
          </Button>
          
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-medium mb-2">Popular Pages</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Browse Articles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
