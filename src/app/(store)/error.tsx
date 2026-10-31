"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow text-muted-foreground">Something went wrong</p>
      <h1 className="text-headline mt-5 font-semibold uppercase">We hit a snag.</h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        This page could not be loaded right now. Please try again — if the problem persists, our care team is happy to help.
      </p>
      <div className="mt-10 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {error.digest && <p className="mt-8 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
    </div>
  );
}
