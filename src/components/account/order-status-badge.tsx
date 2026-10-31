import { Badge } from "@/components/ui/badge";

export function orderStatusLabel(order: { status: string; payment_status: string; fulfillment_status: string }) {
  if (order.status === "refunded") return { label: "Refunded", variant: "muted" as const };
  if (order.status === "cancelled" || order.status === "expired") return { label: "Cancelled", variant: "muted" as const };
  if (order.status === "pending") return { label: "Awaiting payment", variant: "warning" as const };
  switch (order.fulfillment_status) {
    case "processing":
      return { label: "Processing", variant: "warning" as const };
    case "shipped":
      return { label: "Shipped", variant: "dark" as const };
    case "delivered":
      return { label: "Delivered", variant: "success" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "muted" as const };
    default:
      return { label: "Confirmed", variant: "outline" as const };
  }
}

export function OrderStatusBadge({ order }: { order: { status: string; payment_status: string; fulfillment_status: string } }) {
  const s = orderStatusLabel(order);
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
