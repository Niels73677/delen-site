import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page grid gap-8 pb-20 pt-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7 lg:grid lg:grid-cols-[72px_1fr] lg:gap-4">
        <div className="hidden flex-col gap-3 lg:flex">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
        <Skeleton className="aspect-[4/5] w-full" />
      </div>
      <div className="space-y-4 lg:col-span-4 lg:col-start-9">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-8 h-11 w-48" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
