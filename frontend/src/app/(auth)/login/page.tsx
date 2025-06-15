"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login as loginFn } from "@/lib/api/requests/auth";
import { X, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/Spinner";
import Logo from "@/components/ui/custom/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const useLogin = useMutation({
    mutationKey: ["/auth/login"],
    mutationFn: loginFn,
    onSuccess: () => {
      setSuccess(true);
      setError(false);
    },
    onError: (e) => {
      setError(true);
      setErrorMsg(e.message);
      setSuccess(false);
    },
  });

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    useLogin.mutate({
      email: email,
    });
  };

  return (
    <form className="w-full overflow-scroll py-8" onSubmit={login}>
      <div className="grid w-full grow items-center px-4 sm:justify-center gap-y-4">
        <Card className="w-full sm:w-96">
          <CardHeader className="cursor-default">
            <Logo />
            {error ? (
              <Alert
                variant={"destructive"}
                className="py-4 border-destructive/30 bg-destructive/10"
              >
                <X className="h-4 w-4" />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            ) : null}
            {success ? (
              <Alert
                variant={"default"}
                className="py-4 border-green-300 bg-green-50"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Check your email for a login link. We&apos;ve sent you a secure link to access your account.
                </AlertDescription>
              </Alert>
            ) : null}
            <CardTitle className="cursor-default">Welcome back</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a secure login link.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                name="email"
                value={email}
                placeholder="example@email.com"
                disabled={useLogin.isPending}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setError(false);
                  setSuccess(false);
                }}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-y-4">
              <Button type="submit" disabled={useLogin.isPending || success}>
                {useLogin.isPending ? (
                  <Spinner className="stroke-background" size={"small"} />
                ) : null}
                {success ? "Email Sent!" : "Send Login Link"}
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/register">
                  Don&apos;t have an account? Sign up
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}