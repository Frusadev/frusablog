"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { sendUserMessage } from "@/lib/api/requests/user";
import { useOptionalCurrentUser } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

interface FeedbackFormProps {
  defaultSubject?: string;
  heading?: string;
  compact?: boolean;
}

export default function FeedbackForm({
  defaultSubject,
  heading = "Send Feedback",
  compact = false,
}: FeedbackFormProps) {
  const router = useRouter();
  const { data: user } = useOptionalCurrentUser();
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [content, setContent] = useState("");

  const sendMutation = useMutation({
    mutationFn: ({ subject, content }: { subject: string; content: string }) =>
      sendUserMessage(subject, content),
    onSuccess: () => {
      toast.success("Thanks! Your feedback was sent.");
      setContent("");
      if (!defaultSubject) setSubject("");
    },
    onError: (e) => {
      toast.error(e?.message ?? "Failed to send feedback");
    },
  });

  const onSubmit = () => {
    if (!user) {
      toast.error("Please log in to send feedback");
      router.push("/login");
      return;
    }
    if (!subject.trim() || !content.trim()) {
      toast.warning("Please fill in subject and message");
      return;
    }
    sendMutation.mutate({ subject: subject.trim(), content: content.trim() });
  };

  const form = (
    <div className={`space-y-3 ${compact ? "" : "max-w-2xl"}`}>
      <Input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        disabled={sendMutation.isPending}
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your message..."
        rows={compact ? 3 : 5}
        disabled={sendMutation.isPending}
      />
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={
            sendMutation.isPending || !subject.trim() || !content.trim()
          }
        >
          {sendMutation.isPending ? (
            <Spinner size="small" className="mr-2" />
          ) : null}
          Send
        </Button>
      </div>
    </div>
  );

  if (compact) {
    return form;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{heading}</CardTitle>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
