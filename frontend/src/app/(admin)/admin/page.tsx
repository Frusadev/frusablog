"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="font-semibold text-xl px-2">Posts</span>
        <div className="w-2/3 max-w-[500px] flex gap-2">
          <Input placeholder="Search posts..." className="rounded-xl" />
          <Button className="rounded-xl cursor-pointer">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
