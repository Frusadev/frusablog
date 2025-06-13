import type { Metadata } from "next";
import "@/app/globals.css";

const description = `
Stay ahead in the ever-evolving world of technology with tutorials, coding tips, software reviews, dev stories, and deep dives into AI, web dev, open-source, and more.
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
  return (
    <main className="flex w-full h-full justify-center items-center">
      {children}
    </main>
  );
}
