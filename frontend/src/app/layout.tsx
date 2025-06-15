import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";

const description = `
Stay ahead in the ever-evolving world of technology with tutorials, coding tips, software reviews, dev stories, and deep dives into AI, web dev, open-source, and more.
`;

export const metadata: Metadata = {
  title: "Ametsowou.me",
  description: description,
  icons: "/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <QueryProvider>
        <ThemeProvider attribute={"class"} defaultTheme="system">
          <body className="relative h-screen w-screen">
            {children}
            <Toaster />
          </body>
        </ThemeProvider>
      </QueryProvider>
    </html>
  );
}
