"use client";

import { useFormAction } from "@/hooks/use-form-action";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation/schemas";
import { FormField, FormMessage } from "./form-field";
import { SubmitButton } from "./submit-button";

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(signIn, {
    status: linkError ? "error" : "idle",
    message: linkError ? "That link is invalid or has expired. Please try again." : undefined,
  });
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage status={state.status} message={state.message} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className="flex justify-end">
        <Link href="/account/forgot-password" className="text-[13px] text-muted-foreground underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
      </div>
      <SubmitButton pending={pending} size="lg" className="w-full">
        Sign in
      </SubmitButton>
      <p className="pt-4 text-center text-sm text-muted-foreground">
        New to ATELIER?{" "}
        <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
