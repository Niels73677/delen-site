"use client";

import { useFormAction } from "@/hooks/use-form-action";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation/schemas";
import { FormField, FormMessage } from "./form-field";
import { SubmitButton } from "./submit-button";

export function RegisterForm({ next }: { next?: string }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(signUp, { status: "idle" });
  if (state.status === "success") return <FormMessage status="success" message={state.message} />;
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage status={state.status} message={state.message} />
      <FormField label="Full name" name="fullName" autoComplete="name" required error={state.fieldErrors?.fullName} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
        hint="At least 8 characters, including a letter and a number."
      />
      <SubmitButton pending={pending} size="lg" className="w-full">
        Create account
      </SubmitButton>
      <p className="text-xs leading-relaxed text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
