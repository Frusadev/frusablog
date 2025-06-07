"use client";

import { me } from "@/lib/api/requests/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
export function Authenticated({
  children,
  redirect,
}: { children?: ReactNode; redirect?: string }) {
  const router = useRouter();
  const { isSuccess, isError } = useQuery({
    queryKey: ["/users/me"],
    queryFn: me,
  });

  useEffect(() => {
    if (isError) {
      router.push(redirect ?? "/auth/login");
    }
  }, [isError]);
  if (isSuccess) {
    return children;
  } else {
    return null;
  }
}

export function Unauthenticated({
  children,
  redirect,
}: { children?: ReactNode; redirect?: string }) {
  const router = useRouter();
  const { isSuccess, isError } = useQuery({
    queryKey: ["/me"],
    queryFn: me,
  });

  useEffect(() => {
    if (isSuccess) {
      router.push(redirect ?? "/login");
    }
  }, [isSuccess]);
  if (isError) {
    return children;
  } else {
    return null;
  }
}
