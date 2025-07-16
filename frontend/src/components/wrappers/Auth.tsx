"use client";

import { me } from "@/lib/api/requests/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Spinner } from "../ui/Spinner";

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
      router.push(redirect ?? "/login");
    }
  }, [isError, router, redirect]);
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
    retry: false
  });

  useEffect(() => {
    if (isSuccess) {
      router.push(redirect ?? "/");
    }
  }, [isSuccess, router, redirect]);
  if (isError) {
    return children;
  } else {
    return <Spinner />;
  }
}
