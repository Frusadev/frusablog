"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-24 h-24 text-muted-foreground" />
            <AlertTriangle className="w-8 h-8 text-destructive absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back Home
          </Button>
          
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
