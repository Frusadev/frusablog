"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";
import { leaveNewsletter, sendUserMessage } from "@/lib/api/requests/user";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Show from "@/components/wrappers/Show";
import { useCurrentUser } from "@/hooks/useAuth";

const UNSUBSCRIBE_REASONS = [
  "Too many emails",
  "Content is not relevant to me",
  "Poor email design or formatting",
  "I never signed up for this",
  "Technical issues with emails",
  "Found a better alternative",
  "No longer interested in the topic",
  "Other (please specify below)",
];

export default function NewsletterUnsubscribePage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const router = useRouter();

  const {data: user} = useCurrentUser()

  const unsubscribeMutation = useMutation({
    mutationFn: leaveNewsletter,
    onSuccess: () => {
      setStep("success");
      toast.success("Successfully unsubscribed from newsletter");
    },
    onError: (error) => {
      toast.error(`Failed to unsubscribe: ${error.message}`);
    },
  });

  const sendReasonMutation = useMutation({
    mutationFn: ({ subject, content }: { subject: string; content: string }) =>
      sendUserMessage(subject, content),
    onError: (error) => {
      console.error("Failed to send unsubscribe reason:", error);
      // Don't show error to user as this is optional feedback
    },
  });

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeMutation.mutateAsync();
      
      // Send reason if provided
      if (selectedReason) {
        const reason = selectedReason === "Other (please specify below)" 
          ? customReason 
          : selectedReason;
        
        if (reason.trim()) {
          await sendReasonMutation.mutateAsync({
            subject: `User ${user?.name} has left the newsletter`,
            content: `Reason for unsubscribing: ${reason}`,
          });
        }
      }
    } catch {
      // Error already handled by mutation
    }
  };

  const isLoading = unsubscribeMutation.isPending || sendReasonMutation.isPending;

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Successfully Unsubscribed</h1>
            <p className="text-muted-foreground mb-6">
              You have been removed from our newsletter. We&apos;re sorry to see you go!
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Unsubscribe from Newsletter</CardTitle>
          <p className="text-muted-foreground">
            We&apos;re sorry to see you go. Help us improve by telling us why you&apos;re unsubscribing.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">
              What&apos;s your main reason for unsubscribing? (Optional)
            </Label>
            <div className="space-y-3">
              {UNSUBSCRIBE_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={reason}
                    name="unsubscribe-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor={reason} className="text-sm cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Show when={selectedReason === "Other (please specify below)"}>
            <div>
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Please specify your reason:
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tell us more about why you&apos;re unsubscribing..."
                className="mt-2"
                rows={3}
              />
            </div>
          </Show>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Show when={isLoading}>
                <Spinner size="small" className="mr-2" />
              </Show>
              Unsubscribe
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your feedback helps us improve our newsletter for other subscribers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
