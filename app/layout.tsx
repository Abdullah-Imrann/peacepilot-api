import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import LocalGuard from "@/components/LocalGuard";
import FeedbackWidget from "@/components/FeedbackWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeacePilot | Helping you make sense of what you're going through.",
  description:
    "PeacePilot helps you unpack feelings, get a plan, and track emotional progress with an AI clarity coach.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--cp-bg)] text-[var(--cp-foreground)] transition-colors`}
      >
        <div className="flex min-h-screen flex-col">
          <LocalGuard />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FeedbackWidget />
        </div>
      </body>
    </html>
  );
}