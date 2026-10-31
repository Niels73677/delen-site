"use client";

import { useFormAction } from "@/hooks/use-form-action";
import { updateProfile } from "@/app/actions/account";
import type { FormState } from "@/lib/validation/schemas";
import { FormField, FormMessage } from "./form-field";
import { SubmitButton } from "./submit-button";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(updateProfile, { status: "idle" });
  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <FormMessage status={state.status} message={state.message} />
      </div>
      <FormField label="Full name" name="fullName" defaultValue={fullName} autoComplete="name" error={state.fieldErrors?.fullName} />
      <FormField label="Phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" error={state.fieldErrors?.phone} />
      <FormField label="Email" name="email" type="email" defaultValue={email} disabled hint="Contact us to change your email address." />
      <div className="flex items-end sm:col-span-2">
        <SubmitButton pending={pending}>Save details</SubmitButton>
      </div>
    </form>
  );
}
