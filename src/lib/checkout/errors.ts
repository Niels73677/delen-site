import type { QuoteIssue } from "./quote";

export type CheckoutErrorCode =
  | "INVALID_REQUEST"
  | "STOCK"
  | "DISCOUNT_INVALID"
  | "PRICE_CHANGED"
  | "PAYMENT_PROVIDER"
  | "NOT_CONFIGURED"
  | "INTERNAL";

export class CheckoutError extends Error {
  constructor(
    public readonly code: CheckoutErrorCode,
    message: string,
    public readonly issues: QuoteIssue[] = [],
    public readonly status = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/** Translates errors raised by create_pending_order() into CheckoutErrors. */
export function fromReservationError(message: string): CheckoutError {
  const [code, variantId] = message.split(":");
  switch (code) {
    case "INSUFFICIENT_STOCK":
      return new CheckoutError(
        "STOCK",
        "Some items sold out while you were checking out. Your bag has been updated.",
        variantId ? [{ variantId, code: "INSUFFICIENT_STOCK", available: 0, message: "No longer available in that quantity." }] : [],
        409,
      );
    case "VARIANT_UNAVAILABLE":
    case "VARIANT_NOT_FOUND":
      return new CheckoutError("STOCK", "An item in your bag is no longer available.", [], 409);
    case "DISCOUNT_INVALID":
      return new CheckoutError("DISCOUNT_INVALID", "This discount code can no longer be used.", [], 409);
    case "PRICE_CHANGED":
    case "TOTAL_MISMATCH":
      return new CheckoutError("PRICE_CHANGED", "Prices changed while you were checking out. Please review your bag.", [], 409);
    default:
      return new CheckoutError("INTERNAL", "We could not start checkout. Please try again.", [], 500);
  }
}
