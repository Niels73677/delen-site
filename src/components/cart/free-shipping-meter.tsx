import { commerce } from "@/config/brand";
import { formatPrice } from "@/lib/utils";

export function FreeShippingMeter({ remainingCents }: { remainingCents: number }) {
  const progress = Math.min(1, 1 - remainingCents / commerce.freeShippingThresholdCents);
  return (
    <div>
      <p className="text-[13px]">
        {remainingCents > 0 ? (
          <>
            You are <span className="font-medium">{formatPrice(remainingCents)}</span> away from complimentary shipping.
          </>
        ) : (
          "Your order ships complimentary."
        )}
      </p>
      <div className="mt-3 h-px w-full bg-border" aria-hidden>
        <div
          className="h-px bg-foreground transition-[width] duration-700 ease-[var(--ease-editorial)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
