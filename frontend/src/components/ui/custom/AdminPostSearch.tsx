"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "../input";
import { useEffect, useState } from "react";
import { searchAllPosts } from "@/lib/api/requests/post";
import type { Post } from "@/lib/api/dto/post";

export default function AdminPostSearch({
  setPosts,
  setLoading,
  setIsSuccess,
  setIsError,
  skip,
  limit,
}: {
  setPosts: (posts: Post[]) => void;
  skip?: number;
  limit?: number;
  setLoading: (loading: boolean) => void;
  setIsSuccess: (success: boolean) => void;
  setIsError: (error: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const searchQuery = useQuery({
    queryKey: [
      "/posts/search/all",
      { query: query, skip: skip ?? 0, limit: limit ?? 10 },
    ],
    queryFn: ({ queryKey }) => {
      const params = queryKey[1] as {
        query: string;
        skip: number;
        limit: number;
      };
      return searchAllPosts(params);
    },
  });
  useEffect(() => {
    setLoading(searchQuery.isLoading);
  }, [searchQuery.isLoading, setLoading]);
  useEffect(() => {
    setIsSuccess(searchQuery.isSuccess);
    setPosts(searchQuery.data ?? []);
  }, [searchQuery.isSuccess, searchQuery.data, setIsSuccess, setPosts]);
  useEffect(() => {
    setIsError(searchQuery.isError);
  }, [searchQuery.isError, setIsError]);

  return (
    <div className="w-2/3 max-w-[500px] flex gap-2">
      <Input
        placeholder="Search all posts..."
        className="rounded-xl"
        onChange={(e) => {
          setQuery(e.target.value);
          queryClient.invalidateQueries({
            queryKey: [
              "/posts/search/all",
              { query: query, skip: skip ?? 0, limit: limit ?? 10 },
            ],
          });
        }}
      />
    </div>
  );
}
