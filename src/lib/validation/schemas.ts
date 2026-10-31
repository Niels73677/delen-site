import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address.")
  .max(254, "That email address is too long.")
  .pipe(z.email("Please enter a valid email address."));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.enum(["footer", "home", "checkout"]).default("footer"),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password."),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces and + ( ) - only.")
    .optional()
    .transform((v) => v || null),
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().transform((v) => v || null),
  fullName: z.string().trim().min(1, "Name is required.").max(120),
  line1: z.string().trim().min(1, "Address is required.").max(200),
  line2: z.string().trim().max(200).optional().transform((v) => v || null),
  city: z.string().trim().min(1, "City is required.").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
  region: z.string().trim().max(100).optional().transform((v) => v || null),
  country: z.string().trim().length(2, "Choose a country.").toUpperCase(),
  phone: z.string().trim().max(40).optional().transform((v) => v || null),
  isDefault: z.boolean().default(false),
});

export type FormState<T extends string = string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<T, string>>;
};

export function fieldErrors<T extends string>(error: z.ZodError): Partial<Record<T, string>> {
  const out: Partial<Record<T, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as T | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
