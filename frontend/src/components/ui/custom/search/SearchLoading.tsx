"use client";

import { Spinner } from "../../Spinner";

interface SearchLoadingProps {
  size?: "small" | "large";
}

export default function SearchLoading({ size = "small" }: SearchLoadingProps) {
  return (
    <div className="flex justify-center py-8">
      <Spinner size={size} />
    </div>
  );
}
