import { cn, formatPrice } from "@/lib/utils";

export function Price({
  cents,
  compareAtCents,
  className,
}: {
  cents: number;
  compareAtCents?: number | null;
  className?: string;
}) {
  const onSale = compareAtCents != null && compareAtCents > cents;
  return (
    <p className={cn("tabular-nums", className)}>
      {onSale && (
        <>
          <span className="sr-only">Sale price</span>
          <s className="mr-2 text-muted-foreground" aria-label={`Original price ${formatPrice(compareAtCents)}`}>
            {formatPrice(compareAtCents)}
          </s>
        </>
      )}
      <span>{formatPrice(cents)}</span>
    </p>
  );
}
