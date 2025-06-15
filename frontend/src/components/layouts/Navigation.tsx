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
import { Menu, User, Mail, Github, Linkedin, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const biography = `I'm Daniel Ametsowou and this is my story.

I didn't choose accounting. My parents did.
They wanted what any parent wants: stability, opportunity, a clear path. I respected that. I followed it. I studied accounting because I wanted to make them proud and because I believed there was value in understanding the systems that shape the world.

But while I was learning about balance sheets and financial frameworks, something else was pulling at me something louder, deeper, and impossible to ignore.

At 12 years old, I discovered programming. I began with C++, just me, my curiosity, and a secondhand laptop. I didn't know what I was doing but I loved figuring it out. One bug at a time, I taught myself to think like a machine and dream like a maker.

Since then, I've explored Python, web development, Rust, Go always chasing the joy of building things from scratch.

I'm not just a developer. I'm a content creator, a community builder, and a curious soul. I founded LOSL-C, a growing tech collective where people like me self-taught, hungry, and maybe a little different can grow together.

My story is not about choosing between accounting and development. It's about honoring both turning a path I didn't choose into a launching pad for the one I'm creating.

I believe in learning out loud. In building with purpose.
I believe in breaking molds and in helping others break theirs too.
And if there's one thing I've learned, it's this:
You don't have to fit in to make something that stands out.

I'm Daniel and I'm just getting started.`;

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

            <ThemeSwitch />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
