"use client";

import { useFormAction } from "@/hooks/use-form-action";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateFulfillment } from "@/app/actions/admin";
import { FormField, FormMessage } from "@/components/account/form-field";
import { SubmitButton } from "@/components/account/submit-button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/validation/schemas";

export function FulfillmentForm({
  orderId,
  fulfillmentStatus,
  trackingCarrier,
  trackingNumber,
  notes,
  disabled,
}: {
  orderId: string;
  fulfillmentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  disabled: boolean;
}) {
  const router = useRouter();
  const [state, onSubmit, pending] = useFormAction<FormState>(updateFulfillment, { status: "idle" });
  useEffect(() => {
    if (state.status === "success") {
      toast(state.message);
      router.refresh();
    }
  }, [state, router]);
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <FormMessage status={state.status === "error" ? "error" : "idle"} message={state.message} />
      <div>
        <Label htmlFor="fulfillmentStatus">Fulfilment status</Label>
        <NativeSelect id="fulfillmentStatus" name="fulfillmentStatus" defaultValue={fulfillmentStatus} disabled={disabled}>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </NativeSelect>
      </div>
      <FormField label="Carrier" name="trackingCarrier" placeholder="PostNL, DHL, UPS…" defaultValue={trackingCarrier ?? ""} disabled={disabled} />
      <FormField label="Tracking number" name="trackingNumber" defaultValue={trackingNumber ?? ""} disabled={disabled} />
      <div>
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={notes ?? ""} />
      </div>
      <SubmitButton pending={pending} disabled={disabled}>Update order</SubmitButton>
      {disabled && <p className="text-xs text-muted-foreground">Fulfilment can be updated once the order is paid.</p>}
    </form>
  );
}
