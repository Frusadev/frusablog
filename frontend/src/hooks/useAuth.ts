import { useQuery } from "@tanstack/react-query";
import { me } from "@/lib/api/requests/user";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["/users/me"],
    queryFn: me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOptionalCurrentUser() {
  return useQuery({
    queryKey: ["/users/me"],
    queryFn: me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: false, // Don't throw on authentication errors
  });
}
