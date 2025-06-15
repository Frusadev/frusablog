"use client"
import { canPost } from "@/lib/api/requests/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function CanPost({children, redirect}: {children?: ReactNode, redirect?: string}) {

  const router = useRouter();
  const { isSuccess, isError } = useQuery({
    queryKey: ["/users/me/can-post"],
    queryFn: canPost,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.push(redirect ?? "/auth/login");
    }
  }, [isError, router, redirect]);
  if (isSuccess) {
    return children;
  } else {
    return null;
  }
}
