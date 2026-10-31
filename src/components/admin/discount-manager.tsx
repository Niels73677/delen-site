"use client";

import { useFormAction } from "@/hooks/use-form-action";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createDiscount, deleteDiscount, toggleDiscount } from "@/app/actions/admin";
import { FormField, FormMessage } from "@/components/account/form-field";
import { SubmitButton } from "@/components/account/submit-button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";
import type { FormState } from "@/lib/validation/schemas";
import { formatDate, formatPrice } from "@/lib/utils";
import { EmptyRow, Panel, Table, Th } from "./ui";

export function DiscountManager({ discounts }: { discounts: Tables<"discount_codes">[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, onSubmit, submitting] = useFormAction<FormState>(createDiscount, { status: "idle" });
  const [kind, setKind] = useState("percentage");
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      toast(state.message);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  const now = Date.now();
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title="Discount codes" className="xl:col-span-2">
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Value</Th>
              <Th>Minimum</Th>
              <Th>Used</Th>
              <Th>Validity</Th>
              <Th>Active</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {discounts.length ? (
              discounts.map((d) => {
                const expired = d.ends_at && new Date(d.ends_at).getTime() < now;
                return (
                  <tr key={d.id}>
                    <td>
                      <p className="font-mono font-medium">{d.code}</p>
                      {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                    </td>
                    <td>{d.kind === "percentage" ? `${d.value}%` : formatPrice(d.value)}</td>
                    <td className="text-muted-foreground">{d.min_subtotal_cents ? formatPrice(d.min_subtotal_cents) : "—"}</td>
                    <td className="tabular-nums">
                      {d.redemption_count}
                      {d.max_redemptions ? ` / ${d.max_redemptions}` : ""}
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {expired ? (
                        <Badge variant="muted">Expired</Badge>
                      ) : d.starts_at || d.ends_at ? (
                        `${d.starts_at ? formatDate(d.starts_at) : "Now"} – ${d.ends_at ? formatDate(d.ends_at) : "∞"}`
                      ) : (
                        "Always"
                      )}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={d.is_active}
                        disabled={pending}
                        aria-label={`Toggle ${d.code}`}
                        className="size-4 accent-foreground"
                        onChange={(ev) =>
                          start(async () => {
                            const r = await toggleDiscount(d.id, ev.target.checked);
                            if (!r.ok) toast.error(r.message);
                            router.refresh();
                          })
                        }
                      />
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${d.code}`}
                        disabled={pending}
                        onClick={() =>
                          confirm(`Delete ${d.code}?`) &&
                          start(async () => {
                            const r = await deleteDiscount(d.id);
                            toast(r.ok ? (r.message ?? "Deleted") : r.message);
                            router.refresh();
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow colSpan={7}>No discount codes yet.</EmptyRow>
            )}
          </tbody>
        </Table>
      </Panel>
      <Panel title="New discount">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
          <FormMessage status={state.status === "error" ? "error" : "idle"} message={state.message} />
          <FormField label="Code" name="code" placeholder="SUMMER20" className="uppercase" error={e.code} />
          <FormField label="Description" name="description" placeholder="Internal note" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="kind">Type</Label>
              <NativeSelect id="kind" name="kind" value={kind} onChange={(ev) => setKind(ev.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </NativeSelect>
            </div>
            <FormField label={kind === "percentage" ? "Percent off" : "Amount off (€)"} name="value" inputMode="decimal" error={e.value} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min. order (€)" name="minSubtotal" inputMode="decimal" defaultValue="0" />
            <FormField label="Usage limit" name="maxRedemptions" inputMode="numeric" placeholder="Unlimited" error={e.maxRedemptions} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Starts" name="startsAt" type="datetime-local" />
            <FormField label="Ends" name="endsAt" type="datetime-local" />
          </div>
          <SubmitButton pending={submitting} className="w-full">Create discount</SubmitButton>
        </form>
      </Panel>
    </div>
  );
}
