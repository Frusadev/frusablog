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
import { register as registerFn } from "@/lib/api/requests/auth";
import { X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/Spinner";
import Logo from "@/components/ui/custom/Logo";
import { toast } from "sonner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const useRegister = useMutation({
    mutationKey: ["/auth/register"],
    mutationFn: registerFn,
    onSuccess: () => {
      toast.success(
        "Registration successful! A login email was sent to your inbox.",
      );
    },
    onError: (e) => {
      setError(true);
      setErrorMsg(e.message);
    },
  });

  const register = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    useRegister.mutate({
      username: username,
      email: email,
      name: name,
    });
  };

  return (
    <form className="w-full overflow-scroll py-8" onSubmit={register}>
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
            <CardTitle className="cursor-default">
              Create your account
            </CardTitle>
            <CardDescription>
              Welcome! Please fill in the information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                type="text"
                required
                placeholder="Enter a username (e.g. levi_ackerman)"
                name="username"
                value={username}
                disabled={useRegister.isPending}
                onChange={(e) => {
                  setUsername(e.currentTarget.value);
                  setError(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                type="text"
                required
                name="name"
                placeholder="Your full name (e.g. Levi Ackerman)"
                disabled={useRegister.isPending}
                value={name}
                onChange={(e) => {
                  setName(e.currentTarget.value);
                  setError(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                name="email"
                value={email}
                placeholder="example@email.com"
                disabled={useRegister.isPending}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setError(false);
                }}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-y-4">
              <Button type="submit" disabled={useRegister.isPending}>
                {useRegister.isPending ? (
                  <Spinner className="stroke-background" size={"small"} />
                ) : null}
                Continue
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/login">Already have an account? Sign in</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
