import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That fit check doesn&apos;t exist, or isn&apos;t yours to view.
      </p>
      <Button className="mt-2" render={<Link href="/">Back to Resume Fit Checker</Link>} />
    </div>
  );
}
