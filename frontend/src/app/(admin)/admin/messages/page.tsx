"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserMessages, getUserMessage } from "@/lib/api/requests/user";
import type { UserMessageDTO } from "@/lib/api/dto/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminMessagesPage() {
  const [selected, setSelected] = useState<UserMessageDTO | null>(null);

  const messagesQuery = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => getUserMessages({ skip: 0, limit: 50, all: false }),
    staleTime: 30_000,
  });

  const openMessage = async (msg: UserMessageDTO) => {
    try {
      // Fetch full message and mark as viewed server-side
      const full = await getUserMessage(msg.id);
      setSelected(full);
      // Invalidate list to update viewed badges
      messagesQuery.refetch();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e?.message ?? "Failed to load message");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="font-semibold text-2xl">User Messages</h1>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">
                Total: {messagesQuery.data?.length ?? 0}
              </Badge>
              <Badge variant="secondary">
                Unread:{" "}
                {(messagesQuery.data || []).filter((m) => !m.viewed).length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {(messagesQuery.data || []).map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium line-clamp-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {msg.subject}
                    </div>
                    {msg.viewed ? (
                      <Badge variant="outline" className="text-xs">
                        Viewed
                      </Badge>
                    ) : (
                      <Badge className="text-xs">New</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {timeAgo(msg.created_at)}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {msg.content}
                  </div>
                </Card>
              </button>
            ))}

            {messagesQuery.isLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {messagesQuery.isError && (
              <div className="text-sm text-destructive">
                Failed to load messages
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {!selected && (
              <div className="h-full min-h-[280px] rounded-lg border border-dashed grid place-items-center text-muted-foreground">
                Select a message to view
              </div>
            )}
            {selected && (
              <Card className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />{" "}
                      {timeAgo(selected.created_at)}
                    </div>
                    <h2 className="mt-1 text-xl font-semibold">
                      {selected.subject}
                    </h2>
                  </div>
                  <Badge
                    variant={selected.viewed ? "outline" : "secondary"}
                    className="self-start"
                  >
                    {selected.viewed ? "Viewed" : "New"}
                  </Badge>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
                  {selected.content}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </Button>
                  <a
                    href={`/admin/users`}
                    className="ml-auto inline-flex items-center gap-2 text-sm underline"
                  >
                    <Eye className="w-4 h-4" /> View users
                  </a>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
