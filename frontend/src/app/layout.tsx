import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import { Poppins, Public_Sans } from "next/font/google";
const description = `
Stay ahead in the ever-evolving world of technology with tutorials, coding tips, software reviews, dev stories, and deep dives into AI, web dev, open-source, and more.
`;

export const metadata: Metadata = {
  title: "Ametsowou.me",
  description: description,
  icons: "/logo.jpg",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-public-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" className={`${poppins.variable} ${publicSans.variable}`}>
      <QueryProvider>
        <ThemeProvider attribute={"class"} defaultTheme="system">
          <body className="relative h-screen w-screen font-sans">
            {children}
            <Toaster />
          </body>
        </ThemeProvider>
      </QueryProvider>
    </html>
  );
}
