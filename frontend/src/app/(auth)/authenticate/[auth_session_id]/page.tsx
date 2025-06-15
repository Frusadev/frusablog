"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, X, Loader2, ShieldCheck } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "@/components/ui/custom/Logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authenticate } from "@/lib/api/requests/auth";

export default function AuthenticatePage() {
  const params = useParams();
  const router = useRouter();
  const authSessionId = params.auth_session_id as string;
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticateMutation = useMutation({
    mutationFn: authenticate,
    onSuccess: () => {
      setShowSuccessDialog(true);
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/admin");
      }, 3000);
    },
    onError: (err: Error) => {
      setError(err.message || "Authentication failed. Please try again.");
    },
  });

  useEffect(() => {
    if (authSessionId) {
      authenticateMutation.mutate(authSessionId);
    }
  }, [authSessionId, authenticateMutation]);

  const isLoading = authenticateMutation.isPending;
  const isSuccess = authenticateMutation.isSuccess;

  return (
    <>
      <div className="w-full overflow-scroll py-8">
        <div className="grid w-full grow items-center px-4 sm:justify-center gap-y-4">
          <Card className="w-full sm:w-96">
            <CardHeader className="cursor-default">
              <Logo />
              
              {error && (
                <Alert
                  variant="destructive"
                  className="py-4 border-destructive/30 bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                  <AlertTitle>Authentication Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <CardTitle className="cursor-default flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Authenticating...
              </CardTitle>
              
              <CardDescription>
                {isLoading 
                  ? "Please wait while we verify your login link."
                  : error 
                    ? "The login link may have expired or is invalid."
                    : "Redirecting you to your dashboard..."
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-y-4">
              <div className="flex items-center justify-center py-6">
                {isLoading && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground">
                      Verifying your identity...
                    </p>
                  </div>
                )}
                
                {isSuccess && (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      Successfully authenticated!
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Redirecting to dashboard in 3 seconds...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center gap-3">
                    <X className="h-8 w-8 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      Authentication failed
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            {error && (
              <CardFooter>
                <div className="grid w-full gap-y-2">
                  <Button asChild>
                    <Link href="/login">
                      Request New Login Link
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Sheet open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <SheetContent side="top" className="sm:max-w-md mx-auto">
          <SheetHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <SheetTitle className="text-xl font-semibold text-green-800 dark:text-green-200">
              Welcome back! 🎉
            </SheetTitle>
            <SheetDescription className="text-center text-muted-foreground">
              You have been successfully logged in to your account. 
              You&apos;re being redirected to your dashboard.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 flex flex-col gap-3">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Secure login verified</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Your session is now active and secure.
              </p>
            </div>
            
            <Button 
              onClick={() => router.push("/admin")} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
            >
              Stay on this page
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
