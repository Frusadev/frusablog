import { buttonVariants } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import Show from "@/components/wrappers/Show";
import { useDetailedCurrentUser } from "@/hooks/user";
import { Spinner } from "../Spinner";
import Link from "next/link";
import JoinNewsletterDialog from "./JoinNewsLetterDialog";

export default function JoinNewsletter() {
  const { data: currentUser, isLoading, isError } = useDetailedCurrentUser();
  return (
    <>
      <Show
        when={
          currentUser !== undefined &&
          !currentUser.in_newsletter &&
          !isLoading &&
          !isError
        }
      >
        <Card className="bg-gradient-to-br from-blue-700 to-blue-400 cursor-default">
          <CardHeader>
            <CardTitle className="text-blue-50">Join my newsletter</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-sm text-sky-50">
                Stay updated with the latest posts and news. Join my newsletter
                to receive updates directly in your inbox.
              </p>
            </div>
            <div>
              <JoinNewsletterDialog />
            </div>
          </CardContent>
        </Card>
      </Show>

      <Show when={isLoading}>
        <Spinner />
      </Show>

      <Show when={isError}>
        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-500 cursor-default border-none">
          <CardHeader>
            <CardTitle className="text-yellow-50">Join the community</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-sm text-yellow-100">
                Create an account to interact with the community.
              </p>
            </div>
            <div>
              <Link
                href={"/register"}
                className={`rounded-lg cursor-pointer bg-yellow-300 ${buttonVariants()} hover:bg-yellow-400`}
              >
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </Show>
    </>
  );
}
