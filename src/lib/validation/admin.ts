import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const euros = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, "Enter an amount like 49 or 49.95")
  .transform((v) => Math.round(Number(v.replace(",", ".")) * 100));

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes.");

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    slug: slugSchema,
    description: z.string().trim().max(4000).default(""),
    details: z
      .string()
      .default("")
      .transform((v) =>
        v
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 20),
      ),
    materials: optionalText(300),
    care: optionalText(300),
    fit: optionalText(300),
    price: euros,
    compareAt: z
      .string()
      .trim()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        const r = euros.safeParse(v);
        if (!r.success) {
          ctx.addIssue({ code: "custom", message: "Enter an amount like 59 or 59.95" });
          return z.NEVER;
        }
        return r.data;
      }),
    categoryId: z.uuid().nullable().catch(null),
    collectionIds: z.array(z.uuid()).default([]),
    status: z.enum(["draft", "active", "archived"]),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
  })
  .refine((p) => p.compareAt === null || p.compareAt > p.price, {
    path: ["compareAt"],
    message: "Compare-at price must be higher than the price.",
  });

export const variantSchema = z.object({
  id: z.uuid().optional(),
  productId: z.uuid(),
  sku: z.string().trim().min(1, "SKU required").max(64).regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
  colorName: z.string().trim().min(1, "Colour required").max(40),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #1A1A1A"),
  size: z.string().trim().min(1, "Size required").max(20),
  sizeSort: z.coerce.number().int().min(0).max(999).default(0),
  priceOverride: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Math.round(Number(v.replace(",", ".")) * 100) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Invalid price"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").max(100000),
  isActive: z.boolean().default(true),
});

export const discountSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,32}$/, "3–32 characters: letters, numbers, - and _"),
    description: optionalText(200),
    kind: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive("Must be more than 0"),
    minSubtotal: z.coerce.number().min(0).default(0),
    maxRedemptions: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number.parseInt(v, 10) : null))
      .refine((v) => v === null || (Number.isInteger(v) && v > 0), "Must be a whole number above 0"),
    startsAt: optionalText(40),
    endsAt: optionalText(40),
  })
  .refine((d) => d.kind !== "percentage" || d.value <= 100, { path: ["value"], message: "Percentage cannot exceed 100" });

export const fulfillmentSchema = z.object({
  orderId: z.uuid(),
  fulfillmentStatus: z.enum(["unfulfilled", "processing", "shipped", "delivered", "cancelled"]),
  trackingCarrier: optionalText(60),
  trackingNumber: optionalText(100),
  notes: optionalText(2000),
});

export const taxonomySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: slugSchema,
  description: optionalText(500),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || /^https:\/\//.test(v), "Use an https:// URL"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});
