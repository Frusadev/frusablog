import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string): string {
  if (!date) return "Unknown date";
  
  const parsedDate = new Date(date);
  
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }
  
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
