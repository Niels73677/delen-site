"use client";

import { useFormAction } from "@/hooks/use-form-action";
import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/app/actions/account";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { shippingCountries } from "@/config/countries";
import type { Tables } from "@/lib/supabase/types";
import type { FormState } from "@/lib/validation/schemas";
import { AddressBlock } from "./address-block";
import { FormField, FormMessage } from "./form-field";
import { SubmitButton } from "./submit-button";

type Address = Tables<"addresses">;

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="flex flex-col border border-border p-6">
            <div className="mb-4 flex items-center gap-2">
              <p className="eyebrow">{a.label ?? "Address"}</p>
              {a.is_default && <Badge variant="dark">Default</Badge>}
            </div>
            <AddressBlock address={a} />
            <div className="mt-6 flex flex-wrap gap-4 text-[13px]">
              <button type="button" className="underline underline-offset-4" onClick={() => setEditing(a)}>
                Edit
              </button>
              {!a.is_default && (
                <button
                  type="button"
                  disabled={pending}
                  className="underline underline-offset-4"
                  onClick={() => start(async () => void (await setDefaultAddress(a.id)))}
                >
                  Make default
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                className="text-muted-foreground underline underline-offset-4 hover:text-destructive"
                onClick={() =>
                  start(async () => {
                    if (!confirm("Delete this address?")) return;
                    const r = await deleteAddress(a.id);
                    toast(r.ok ? "Address deleted." : "Could not delete the address.");
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <Plus className="size-5" strokeWidth={1.5} /> Add a new address
        </button>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>{editing === "new" ? "New address" : "Edit address"}</DialogTitle>
          <DialogDescription>Saved addresses make checkout faster.</DialogDescription>
          {editing !== null && (
            <AddressForm key={editing === "new" ? "new" : editing.id} address={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddressForm({ address, onDone }: { address: Address | null; onDone: () => void }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(saveAddress, { status: "idle" });
  const e = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.status === "success") {
      toast(state.message);
      onDone();
    }
  }, [state, onDone]);
  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2" noValidate>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="sm:col-span-2">
        <FormMessage status={state.status} message={state.status === "error" ? state.message : undefined} />
      </div>
      <FormField label="Label (optional)" name="label" placeholder="Home, Studio…" defaultValue={address?.label ?? ""} error={e.label} />
      <FormField label="Full name" name="fullName" autoComplete="name" defaultValue={address?.full_name ?? ""} error={e.fullName} />
      <div className="sm:col-span-2">
        <FormField label="Address" name="line1" autoComplete="address-line1" defaultValue={address?.line1 ?? ""} error={e.line1} />
      </div>
      <div className="sm:col-span-2">
        <FormField label="Apartment, suite (optional)" name="line2" autoComplete="address-line2" defaultValue={address?.line2 ?? ""} />
      </div>
      <FormField label="Postal code" name="postalCode" autoComplete="postal-code" defaultValue={address?.postal_code ?? ""} error={e.postalCode} />
      <FormField label="City" name="city" autoComplete="address-level2" defaultValue={address?.city ?? ""} error={e.city} />
      <FormField label="Region (optional)" name="region" autoComplete="address-level1" defaultValue={address?.region ?? ""} />
      <div>
        <Label htmlFor="country">Country</Label>
        <NativeSelect id="country" name="country" defaultValue={address?.country ?? "NL"} autoComplete="country">
          {shippingCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <FormField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" defaultValue={address?.phone ?? ""} />
      <label className="flex items-center gap-3 self-end pb-3 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={address?.is_default ?? false} className="size-4 accent-foreground" />
        Set as default address
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <SubmitButton pending={pending}>Save address</SubmitButton>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
