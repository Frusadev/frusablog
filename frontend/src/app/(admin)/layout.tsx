import type { Metadata } from "next";
import "@/app/globals.css";
import CanPost from "@/components/wrappers/CanPost";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/ui/custom/AdminSidebar";
import { ChartLine, Newspaper, Pencil, PlusCircle, Timer } from "lucide-react";

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
    <main className="w-full h-full">
      <CanPost redirect="/">
        <SidebarProvider>
          <AdminSidebar
            links={[
              {
                label: "Posts",
                href: "",
                icon: <Pencil />,
                subLinks: [
                  {
                    label: "New post",
                    href: "/admin/posts/new",
                    icon: <PlusCircle />,
                  },
                  {
                    label: "All posts",
                    href: "/admin",
                    icon: <Newspaper />,
                  },
                  {
                    label: "Drafts",
                    href: "/admin/posts/drafts",
                    icon: <Timer />,
                  },
                  {
                    label: "Stats",
                    href: "/admin/posts/stats",
                    icon: <ChartLine />,
                  },
                ],
              },
            ]}
          />
          <div className="w-full h-screen p-4 bg-sidebar">
            <div className="rounded-md border w-full h-full bg-background">
              <SidebarTrigger />
              {children}
            </div>
          </div>
        </SidebarProvider>
      </CanPost>
    </main>
  );
}
