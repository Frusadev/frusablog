"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeSwitch from "@/components/ui/custom/ThemeSwitch";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Menu, User, Mail, Github, Linkedin, ExternalLink, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptionalCurrentUser } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/requests/auth";
import { toast } from "sonner";

export default function Navigation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  // Get current user data (optional, doesn't throw on error)
  const { data: currentUser, isError: isNotAuthenticated } = useOptionalCurrentUser();
  
  // User is not authenticated if there's an error OR no current user data
  const isUserNotAuthenticated = isNotAuthenticated || !currentUser;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries and redirect to home
      queryClient.clear();
      router.push("/");
      toast.success("Logged out successfully");
      setLogoutConfirmOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to logout. Please try again.");
      console.error("Logout error:", error);
      setLogoutConfirmOpen(false);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const biography = `I’m Daniel Ametsowou. I was supposed to be an accountant.

Yep. Stable job, clear path, makes the parents proud. The classic checklist. I played along. Sat through classes, memorized frameworks, nodded politely at the “future.” But deep down, I couldn’t care less about reconciling spreadsheets.

At the same time, I had a secondhand laptop and a weird obsession with code. I discovered C++ at 12. It made absolutely no sense, which is exactly why I couldn’t stop. I broke stuff, fixed it, broke it again. Slowly, I started to get it. Not just how computers work, but how I work.

Turns out I’m not built for templates. I’m built to build. I’ve been like that since I was a kid, messing with chemistry kits, wires, electricity, anything I could tinker with.

Now I write Python, TypeScript, and Nim. I mess around with web dev, not for the resume, but because making something from nothing still feels like magic. I also started LOSL-C, a space for people like me. Self-taught, a little unconventional, and not waiting for permission to create.

I’m not here to pivot or tell a sob story. I’m just following what feels real. Right now, that means building, learning out loud, and helping others do the same.

BTW, Growth isn’t linear. Neither is my commit history. 😂`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ametsowou.me
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  About
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About Daniel Ametsowou
                  </DialogTitle>
                  <DialogDescription>
                    Developer, Content Creator, Community Builder
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {biography.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Developer</Badge>
                      <Badge variant="secondary">Content Creator</Badge>
                      <Badge variant="secondary">Community Builder</Badge>
                      <Badge variant="secondary">LOSL-C Founder</Badge>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Get in Touch
                  </DialogTitle>
                  <DialogDescription>
                    Let&apos;s connect and build something amazing together
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <a
                      href="mailto:frusadev@gmail.com"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <Mail className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">frusadev@gmail.com</div>
                      </div>
                      <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground" />
                    </a>

                    <a
                      href="https://linkedin.com/in/frusadev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <div>
                        <div className="font-medium">LinkedIn</div>
                        <div className="text-sm text-muted-foreground">@frusadev</div>
                      </div>
                      <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground" />
                    </a>

                    <a
                      href="https://github.com/Frusadev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <div>
                        <div className="font-medium">GitHub</div>
                        <div className="text-sm text-muted-foreground">@Frusadev</div>
                      </div>
                      <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground" />
                    </a>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Auth Button - Login for unauthenticated, Logout for authenticated */}
            {isUserNotAuthenticated ? (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => router.push("/login")}
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={confirmLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            )}

            <ThemeSwitch />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Auth Button for mobile */}
            {isUserNotAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/login")}
                className="flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Login
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={confirmLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                {logoutMutation.isPending ? "..." : "Logout"}
              </Button>
            )}
            
            <ThemeSwitch />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    Explore more about Daniel and get in touch
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6 px-2">
                  <div className="space-y-2">
                    <h3 className="font-medium">About Daniel</h3>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {biography.split('\n\n')[0]}...
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAboutOpen(true)}
                      className="w-full"
                    >
                      Read Full Story
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Contact</h3>
                    <div className="space-y-2">
                      <a
                        href="mailto:frusadev@gmail.com"
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted"
                      >
                        <Mail className="w-4 h-4" />
                        frusadev@gmail.com
                      </a>
                      <a
                        href="https://linkedin.com/in/frusadev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                      </a>
                      <a
                        href="https://github.com/Frusadev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Profile
                      </a>
                    </div>
                  </div>

                  {/* Auth Button for mobile sheet */}
                  {isUserNotAuthenticated ? (
                    <div className="border-t pt-4">
                      <Button 
                        onClick={() => router.push("/login")}
                        className="w-full flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </Button>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <Button 
                        onClick={confirmLogout}
                        disabled={logoutMutation.isPending}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You&apos;ll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {logoutMutation.isPending ? "Logging out..." : "Yes, Log Out"}
            </Button>
            <Button 
              onClick={() => setLogoutConfirmOpen(false)}
              variant="outline"
              className="w-full"
              disabled={logoutMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
