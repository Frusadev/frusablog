import type { Metadata } from "next";
import "@/app/globals.css";

const description = `
Hi, I’m Daniel Ametsowou — a passionate software builder, self-taught developer, and curious thinker.

Since a young age, I’ve been obsessed with creating things from scratch — not just using technology, but understanding it, breaking it down, and rebuilding it better.

This blog is a testament to the journey of learning without limits.
You’ll find personal stories, deep dives into code, reflections on self-growth, and lessons from building real-world projects — all from the perspective of someone who chose the non-traditional path.
Welcome !
`;

export const metadata: Metadata = {
  title: "Ametsowou.me",
  description: description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
