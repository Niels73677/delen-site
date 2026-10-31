"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adjustInventory, deleteVariant, saveVariant } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { compareSizes } from "@/lib/catalog/sizes";
import { Panel, Table, Th } from "./ui";

export type AdminVariant = {
  id: string;
  sku: string;
  color_name: string;
  color_hex: string;
  size: string;
  size_sort: number;
  price_override_cents: number | null;
  is_active: boolean;
  stock: number;
};

const PRESETS: Record<string, string[]> = {
  "XS–XL": ["XS", "S", "M", "L", "XL"],
  "28–36": ["28", "30", "32", "34", "36"],
  "One size": ["One Size"],
};

export function VariantManager({ productId, productSlug, variants }: { productId: string; productSlug: string; variants: AdminVariant[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [stock, setStock] = useState<Record<string, number>>({});
  const sorted = [...variants].sort((a, b) => a.color_name.localeCompare(b.color_name) || a.size_sort - b.size_sort || compareSizes(a.size, b.size));

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.message) (r.ok ? toast : toast.error)(r.message);
      if (r.ok) router.refresh();
    });

  return (
    <Panel title={`Variants & inventory (${variants.length})`}>
      <Table>
        <thead>
          <tr>
            <Th>Colour</Th>
            <Th>Size</Th>
            <Th>SKU</Th>
            <Th>Price override</Th>
            <Th>Active</Th>
            <Th className="text-right">Stock</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {sorted.map((v) => {
            const qty = stock[v.id] ?? v.stock;
            return (
              <tr key={v.id} className={v.is_active ? "" : "opacity-50"}>
                <td>
                  <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full border border-foreground/15" style={{ backgroundColor: v.color_hex }} />
                    {v.color_name}
                  </span>
                </td>
                <td>{v.size}</td>
                <td className="font-mono text-xs">{v.sku}</td>
                <td className="text-muted-foreground">{v.price_override_cents != null ? `€${(v.price_override_cents / 100).toFixed(2)}` : "—"}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={v.is_active}
                    aria-label={`Active ${v.sku}`}
                    className="size-4 accent-foreground"
                    onChange={(e) =>
                      run(() =>
                        saveVariant({
                          id: v.id,
                          productId,
                          sku: v.sku,
                          colorName: v.color_name,
                          colorHex: v.color_hex,
                          size: v.size,
                          sizeSort: v.size_sort,
                          priceOverride: v.price_override_cents != null ? String(v.price_override_cents / 100) : "",
                          stock: qty,
                          isActive: e.target.checked,
                        }),
                      )
                    }
                  />
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center border border-border disabled:opacity-30"
                      disabled={pending || qty <= 0}
                      onClick={() =>
                        start(async () => {
                          const r = await adjustInventory(v.id, -1);
                          if (r.ok && "quantity" in r) setStock((s) => ({ ...s, [v.id]: r.quantity! }));
                          else toast.error(r.ok ? "" : r.message);
                        })
                      }
                      aria-label={`Decrease stock ${v.sku}`}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className={`w-10 text-center tabular-nums ${qty === 0 ? "text-destructive" : ""}`}>{qty}</span>
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center border border-border disabled:opacity-30"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const r = await adjustInventory(v.id, 1);
                          if (r.ok && "quantity" in r) setStock((s) => ({ ...s, [v.id]: r.quantity! }));
                          else toast.error(r.ok ? "" : r.message);
                        })
                      }
                      aria-label={`Increase stock ${v.sku}`}
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      type="button"
                      className="ml-1 border border-border px-2 py-1 text-xs disabled:opacity-30"
                      disabled={pending}
                      onClick={() => {
                        const input = prompt(`Restock ${v.sku}: how many units to add?`, "10");
                        const n = Number.parseInt(input ?? "", 10);
                        if (!Number.isInteger(n) || n === 0) return;
                        start(async () => {
                          const r = await adjustInventory(v.id, n);
                          if (r.ok && "quantity" in r) {
                            setStock((s) => ({ ...s, [v.id]: r.quantity! }));
                            toast(`Stock for ${v.sku} is now ${r.quantity}.`);
                          } else toast.error(r.ok ? "" : r.message);
                        });
                      }}
                    >
                      Restock
                    </button>
                  </div>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    disabled={pending}
                    onClick={() => confirm(`Delete variant ${v.sku}?`) && run(() => deleteVariant(v.id))}
                    aria-label={`Delete ${v.sku}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <NewVariants productId={productId} productSlug={productSlug} existing={variants} onDone={() => router.refresh()} />
    </Panel>
  );
}

function NewVariants({
  productId,
  productSlug,
  existing,
  onDone,
}: {
  productId: string;
  productSlug: string;
  existing: AdminVariant[];
  onDone: () => void;
}) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#1A1A1A");
  const [sizes, setSizes] = useState("XS, S, M, L, XL");
  const [initialStock, setInitialStock] = useState("10");
  const [priceOverride, setPriceOverride] = useState("");
  const [busy, setBusy] = useState(false);

  const prefix = productSlug
    .split("-")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!colorName.trim() || list.length === 0) return toast.error("Enter a colour and at least one size.");
    setBusy(true);
    let created = 0;
    for (const [i, size] of list.entries()) {
      if (existing.some((v) => v.color_name === colorName.trim() && v.size === size)) continue;
      const sku = `AT-${prefix}-${colorName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()}-${size.replace(/\s/g, "").slice(0, 3).toUpperCase()}`;
      const r = await saveVariant({
        productId,
        sku,
        colorName: colorName.trim(),
        colorHex,
        size,
        sizeSort: i,
        priceOverride,
        stock: Number.parseInt(initialStock, 10) || 0,
        isActive: true,
      });
      if (!r.ok) {
        toast.error(`${size}: ${r.message}`);
        break;
      }
      created++;
    }
    setBusy(false);
    if (created) {
      toast(`${created} variant${created === 1 ? "" : "s"} added.`);
      setColorName("");
      onDone();
    }
  };

  return (
    <form onSubmit={create} className="grid gap-3 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <p className="eyebrow sm:col-span-2 lg:col-span-6">Add colour & sizes</p>
      <label className="text-xs text-muted-foreground lg:col-span-1">
        Colour name
        <input value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="Bone" className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-foreground" />
      </label>
      <label className="text-xs text-muted-foreground">
        Swatch
        <span className="mt-1 flex h-10 items-center gap-2 border border-border bg-background px-2">
          <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="size-7 cursor-pointer border-0 bg-transparent p-0" aria-label="Swatch colour" />
          <span className="font-mono text-xs text-foreground">{colorHex.toUpperCase()}</span>
        </span>
      </label>
      <label className="text-xs text-muted-foreground lg:col-span-2">
        Sizes (comma separated)
        <input value={sizes} onChange={(e) => setSizes(e.target.value)} className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-foreground" />
        <span className="mt-1 flex gap-2">
          {Object.entries(PRESETS).map(([label, list]) => (
            <button key={label} type="button" className="underline underline-offset-2" onClick={() => setSizes(list.join(", "))}>
              {label}
            </button>
          ))}
        </span>
      </label>
      <label className="text-xs text-muted-foreground">
        Stock each
        <input value={initialStock} onChange={(e) => setInitialStock(e.target.value)} inputMode="numeric" className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-foreground" />
      </label>
      <label className="text-xs text-muted-foreground">
        Price override (€)
        <input value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} inputMode="decimal" placeholder="—" className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-foreground" />
      </label>
      <div className="lg:col-span-6">
        <Button type="submit" size="sm" className="h-10" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Plus />} Add variants
        </Button>
      </div>
    </form>
  );
}
