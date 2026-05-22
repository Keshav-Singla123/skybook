import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toast";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "SkyBook - Flight Management",
  description: "Search, book, and manage flights with real-time seats.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SkyBook",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C1445",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        {children}
        <PWAInstallBanner />
        <Toaster />
      </body>
    </html>
  );
}
