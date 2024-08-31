import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideBar from "@/components/SideBar/SideBar";
import { PageRouteProvider } from "@/contexts/PageRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Frusadev blog",
	description: "Our coding blog",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="flex h-screen w-screen">
				<PageRouteProvider>
					<SideBar />
				</PageRouteProvider>
				{children}
			</body>
		</html>
	);
}
