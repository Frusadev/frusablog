import { useMutation } from "@tanstack/react-query";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import { joinNewsletter } from "@/lib/api/requests/user";
import { toast } from "sonner";

export default function JoinNewsletterDialog() {
  const {
    data,
    isPending: subscriptionPending,
    mutate: confirm,
  } = useMutation({
    mutationKey: ["/users/me/subscribe"],
    mutationFn: joinNewsletter,
    onSuccess: () => {
      toast.success(data?.message ?? "Successfully subscribed to the newsletter!");
      window.location.reload()
    },
  });
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="rounded-lg cursor-pointer   ">
          Join Newsletter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to join the newsletter?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-foreground/80">
            By joining the newsletter, you accept to receive direct emails with
            updates, news, and promotional content. You can unsubscribe at any
            time.
          </p>
          <div>
            <Button
              disabled={subscriptionPending}
              onClick={() => confirm()}
              className="cursor-pointer"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
