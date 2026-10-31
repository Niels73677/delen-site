import { z } from "zod";
import { commerce } from "@/config/brand";

export const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.uuid(),
        quantity: z.number().int().min(1).max(commerce.maxQuantityPerLine),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(50, "Too many different items in one order."),
  discountCode: z
    .string()
    .trim()
    .max(32)
    .regex(/^[A-Za-z0-9_-]*$/, "Invalid discount code.")
    .optional()
    .transform((v) => (v ? v.toUpperCase() : undefined)),
});

export type CheckoutRequest = {
  items: { variantId: string; quantity: number }[];
  discountCode?: string;
};
