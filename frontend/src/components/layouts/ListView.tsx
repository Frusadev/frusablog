import { ReactNode } from "react";

type GapValues = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number;

export default function ListView({
  children,
  gap,
  className = "",
}: {
  children: ReactNode;
  gap: GapValues;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-${gap > 10 ? `[${gap}px]` : gap}
          w-full ${className}`}
    >
      {children}
    </div>
  );
}
