"use client";
import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../sidebar";
import { Button } from "../button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
export interface SidebarLink {
  label: string;
  href: string;
  icon?: ReactNode;
  subLinks?: SidebarLink[];
}

export default function AdminSidebar({ links }: { links?: SidebarLink[] }) {
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <div className="flex flex-col w-full p-2 gap-2">
          <span className="font-semibold cursor-default">Dashboard</span>
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {links?.map((link, i) => {
          if (link.subLinks?.length ?? 0 > 0) {
            return (
              <SidebarGroup key={i}>
                <SidebarGroupLabel className="cursor-default">{link.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {link.subLinks?.map((sublink, index) => {
                      return (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton asChild>
                            <a href={sublink.href}>
                              {sublink.icon}
                              <span>{sublink.label}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          return (
            <SidebarMenu key={i}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={link.href}>
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
