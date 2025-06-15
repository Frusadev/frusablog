"use client";

import { canPost } from "@/lib/api/requests/user";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminGuard({ children }: { children?: ReactNode }) {
  const { isSuccess, isError, isLoading } = useQuery({
    queryKey: ["/users/me/can-post"],
    queryFn: canPost,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      // Trigger the not-found page for unauthorized access
      notFound();
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="large" className="stroke-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return <>{children}</>;
  }

  // This will be handled by the useEffect above, but just in case
  return null;
}
