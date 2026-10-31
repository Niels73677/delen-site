import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="eyebrow text-muted-foreground">Error 404</p>
      <h1 className="text-display mt-6 font-semibold uppercase">Not found.</h1>
      <p className="mt-8 max-w-md text-muted-foreground">
        The page you are looking for has moved, sold out for good, or never existed. Let&apos;s get you back to something worth wearing.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/shop">Shop all</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
