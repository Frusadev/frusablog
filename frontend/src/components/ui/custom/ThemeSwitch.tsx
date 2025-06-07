"use client";
import { useTheme } from "next-themes";
import { Button } from "../button";
import Show from "@/components/wrappers/Show";
import { MoonStar, Sun, Sunrise } from "lucide-react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      className="rounded-full w-10 h-10 absolute top-4 right-4 z-50"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="ghost"
    >
      <Show when={theme === "dark"} else={<Sun />}>
        <MoonStar />
      </Show>
    </Button>
  );
}
