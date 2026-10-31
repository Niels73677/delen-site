"use client";

import { useFormAction } from "@/hooks/use-form-action";
import Link from "next/link";
import { requestPasswordReset, updatePassword } from "@/app/actions/auth";
import type { FormState } from "@/lib/validation/schemas";
import { FormField, FormMessage } from "./form-field";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [state, onSubmit, pending] = useFormAction<FormState>(requestPasswordReset, { status: "idle" });
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormMessage status={state.status} message={state.message} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <SubmitButton pending={pending} size="lg" className="w-full">
        Send reset link
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/account/login" className="text-muted-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, onSubmit, pending] = useFormAction<FormState>(updatePassword, { status: "idle" });
  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <FormMessage status="success" message={state.message} />
        <Link href="/account" className="eyebrow underline underline-offset-4">
          Go to your account
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormMessage status={state.status} message={state.message} />
      <FormField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
        hint="At least 8 characters, including a letter and a number."
      />
      <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirm} />
      <SubmitButton pending={pending} size="lg" className="w-full">
        Update password
      </SubmitButton>
    </form>
  );
}
