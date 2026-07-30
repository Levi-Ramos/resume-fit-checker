import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import Link from "next/link";
import { HistorySidebar } from "@/components/history-sidebar";
import { HistorySidebarSkeleton } from "@/components/history-sidebar-skeleton";
import { HistoryDrawerTrigger } from "@/components/history-drawer-trigger";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Fit Checker",
  description: "Grounded, citation-backed resume-to-job-description fit checking with Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <Suspense fallback={<HistorySidebarSkeleton />}>
            <HistorySidebar />
          </Suspense>
          <div className="flex min-h-full min-w-0 flex-1 flex-col">
            <nav className="flex h-14 items-center gap-3 border-b border-border px-3 md:px-6">
              <HistoryDrawerTrigger />
              <Link href="/" className="font-mono text-sm font-medium tracking-tight">
                Resume Fit Checker
              </Link>
              <div className="ml-auto flex items-center gap-4">
                <Show when="signed-in">
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      Sign in to save history
                    </button>
                  </SignInButton>
                </Show>
              </div>
            </nav>
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
