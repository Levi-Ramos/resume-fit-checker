import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import Link from "next/link";
import { HistorySidebar } from "@/components/history-sidebar";
import { HistorySidebarShell } from "@/components/history-sidebar-shell";
import { HistorySidebarSkeleton } from "@/components/history-sidebar-skeleton";
import { HistoryDrawerTrigger } from "@/components/history-drawer-trigger";
import { ErrorBoundary } from "@/components/error-boundary";
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
          <a
            href="#main-content"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-primary focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Skip to fit-check form
          </a>
          <div className="order-last flex min-h-full min-w-0 flex-1 flex-col">
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
                    <button className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                      Sign in to save history
                    </button>
                  </SignInButton>
                </Show>
              </div>
            </nav>
            <main id="main-content" className="flex min-h-0 flex-1 flex-col">
              {children}
            </main>
          </div>
          <ErrorBoundary
            fallback={
              <HistorySidebarShell>
                <p className="px-2 py-4 text-sm text-destructive">
                  Couldn&apos;t load history right now.
                </p>
              </HistorySidebarShell>
            }
          >
            <Suspense fallback={<HistorySidebarSkeleton />}>
              <HistorySidebar />
            </Suspense>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
}
