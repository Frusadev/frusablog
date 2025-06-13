"use client";
import { useTheme } from "next-themes";
import { Button } from "../button";
import Show from "@/components/wrappers/Show";
import { MoonStar, Sun, Sunrise } from "lucide-react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      className="rounded-full w-10 h-10"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="ghost"
      size="sm"
    >
      <Show when={theme === "dark"} else={<Sun className="w-5 h-5" />}>
        <MoonStar className="w-5 h-5" />
      </Show>
    </Button>
  );
}
