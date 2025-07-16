import type { Metadata } from "next";
import "@/app/globals.css";
import AdminGuard from "@/components/wrappers/AdminGuard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/ui/custom/AdminSidebar";
import {
  ChartLine,
  Newspaper,
  PlusCircle,
  Timer,
  Archive,
  Tags,
  MessageSquare,
  Users,
  UserX,
  Mail,
  BarChart3,
  FileText,
} from "lucide-react";
import { Toaster } from "sonner";

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
      <AdminGuard>
        <SidebarProvider>
          <AdminSidebar
            sections={[
              // Content Management Section
              {
                title: "Content",
                links: [
                  {
                    label: "Posts",
                    href: "",
                    icon: <FileText />,
                    subLinks: [
                      {
                        label: "All Posts",
                        href: "/admin",
                        icon: <Newspaper />,
                      },
                      {
                        label: "New Post",
                        href: "/admin/posts/new",
                        icon: <PlusCircle />,
                      },
                      {
                        label: "Drafts",
                        href: "/admin/posts/drafts",
                        icon: <Timer />,
                      },
                      {
                        label: "Archived",
                        href: "/admin/posts/archived",
                        icon: <Archive />,
                      },
                      {
                        label: "Tags",
                        href: "/admin/tags",
                        icon: <Tags />,
                      },
                      {
                        label: "Comments",
                        href: "/admin/comments",
                        icon: <MessageSquare />,
                      },
                    ],
                  },
                ],
              },

              // User Management Section
              {
                title: "Users",
                links: [
                  {
                    label: "User Management",
                    href: "",
                    icon: <Users />,
                    subLinks: [
                      {
                        label: "All Users",
                        href: "/admin/users",
                        icon: <Users />,
                      },
                      {
                        label: "Banned Users",
                        href: "/admin/users/banned",
                        icon: <UserX />,
                      },
                      {
                        label: "Send Message",
                        href: "/admin/users/message",
                        icon: <Mail />,
                      },
                    ],
                  },
                ],
              },

              // Analytics Section
              {
                title: "Analytics",
                links: [
                  {
                    label: "Reports",
                    href: "",
                    icon: <ChartLine />,
                    subLinks: [
                      {
                        label: "Traffic",
                        href: "/admin/posts/stats",
                        icon: <BarChart3 />,
                      },
                    ],
                  },
                ],
              },
            ]}
          />
          <div className="w-full min-h-screen p-2 sm:p-4 bg-sidebar">
            <div className="rounded-md border w-full min-h-full bg-background p-3">
              <div className="block sm:hidden p-2 border-b">
                <SidebarTrigger />
              </div>
              <div className="hidden sm:block">
                <SidebarTrigger />
              </div>
              {children}
            </div>
          </div>
        </SidebarProvider>
      </AdminGuard>
      <Toaster />
    </main>
  );
}
