import { commerce } from "@/config/brand";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string;
  size: string;
  imageUrl: string | null;
  /** Display price only. The server re-prices every line at checkout. */
  unitPriceCents: number;
  quantity: number;
  /** Last known stock for this variant, used to cap quantity in the UI. */
  maxQuantity: number;
};

export function lineLimit(line: Pick<CartLine, "maxQuantity">): number {
  return Math.max(0, Math.min(line.maxQuantity, commerce.maxQuantityPerLine));
}

/** Adds `quantity` of an item, clamped to stock. Returns how many were actually added. */
export function addLine(lines: CartLine[], item: Omit<CartLine, "quantity">, quantity: number) {
  const existing = lines.find((l) => l.variantId === item.variantId);
  const limit = lineLimit(item);
  const current = existing?.quantity ?? 0;
  const added = Math.max(0, Math.min(Math.floor(quantity), limit - current));
  if (added === 0) return { lines, added: 0 };
  const next = existing
    ? lines.map((l) => (l.variantId === item.variantId ? { ...l, ...item, quantity: current + added } : l))
    : [...lines, { ...item, quantity: added }];
  return { lines: next, added };
}

export function setLineQuantity(lines: CartLine[], variantId: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((l) => l.variantId !== variantId);
  return lines.map((l) =>
    l.variantId === variantId ? { ...l, quantity: Math.min(Math.floor(quantity), Math.max(1, lineLimit(l))) } : l,
  );
}

/** Merge two carts (e.g. guest + saved account cart): quantities take the max per variant. */
export function mergeLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of [...a, ...b]) {
    const prev = map.get(line.variantId);
    map.set(line.variantId, prev ? { ...line, quantity: Math.max(prev.quantity, line.quantity) } : line);
  }
  return [...map.values()].map((l) => ({ ...l, quantity: Math.min(l.quantity, Math.max(1, lineLimit(l))) }));
}

export type LineRefresh = {
  variantId: string;
  unitPriceCents: number;
  stock: number;
  available: boolean;
};

/**
 * Applies fresh server data to the cart. Unavailable lines are removed and
 * quantities above stock are reduced. Returns human-readable change notes.
 */
export function reconcileLines(lines: CartLine[], fresh: LineRefresh[]) {
  const byId = new Map(fresh.map((f) => [f.variantId, f]));
  const notes: string[] = [];
  const next: CartLine[] = [];
  for (const line of lines) {
    const f = byId.get(line.variantId);
    if (!f || !f.available || f.stock <= 0) {
      notes.push(`${line.name} (${line.colorName}, ${line.size}) is no longer available and was removed.`);
      continue;
    }
    let quantity = line.quantity;
    if (quantity > f.stock) {
      quantity = f.stock;
      notes.push(`Only ${f.stock} of ${line.name} (${line.size}) left — quantity updated.`);
    }
    if (f.unitPriceCents !== line.unitPriceCents) {
      notes.push(`The price of ${line.name} has been updated.`);
    }
    next.push({ ...line, quantity, unitPriceCents: f.unitPriceCents, maxQuantity: f.stock });
  }
  return { lines: next, notes };
}
