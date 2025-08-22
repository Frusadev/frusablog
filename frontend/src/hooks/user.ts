import { detailedMe } from "@/lib/api/requests/user";
import { useQuery } from "@tanstack/react-query";

export const useDetailedCurrentUser = () => {
  return useQuery({
    queryKey: ["/users/me/detailed"],
    queryFn: detailedMe,
    staleTime: 5 * 60 * 1000,
    retry: false
  });
};
