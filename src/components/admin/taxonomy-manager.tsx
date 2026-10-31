"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTaxonomy, saveTaxonomy } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { Panel } from "./ui";

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  image_url?: string | null;
  is_active?: boolean;
  count: number;
};

export function TaxonomyManager({ kind, items }: { kind: "category" | "collection"; items: TaxonomyItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const empty = { name: "", slug: "", description: "", imageUrl: "", sortOrder: String(items.length), isActive: true };
  const [form, setForm] = useState(empty);
  const label = kind === "category" ? "Categories" : "Collections";

  const edit = (item: TaxonomyItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      imageUrl: item.image_url ?? "",
      sortOrder: String(item.sort_order),
      isActive: item.is_active ?? true,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await saveTaxonomy(kind, { ...form, id: editing?.id, slug: form.slug || slugify(form.name) });
      if (!r.ok) return void toast.error(r.message);
      toast(r.message);
      setEditing(null);
      setForm(empty);
      router.refresh();
    });
  };

  const input = "mt-1 h-10 w-full border border-border bg-background px-3 text-sm text-foreground";
  return (
    <Panel title={`${label} (${items.length})`}>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-5 py-3 text-sm">
            <span className="w-6 text-xs tabular-nums text-muted-foreground">{item.sort_order}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {item.name} {item.is_active === false && <span className="text-xs text-muted-foreground">(hidden)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                /{item.slug} · {item.count} products
              </p>
            </div>
            <button type="button" className="p-1.5" onClick={() => edit(item)} aria-label={`Edit ${item.name}`}>
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 text-muted-foreground hover:text-destructive"
              disabled={pending}
              aria-label={`Delete ${item.name}`}
              onClick={() =>
                confirm(`Delete ${item.name}? Products are kept.`) &&
                start(async () => {
                  const r = await deleteTaxonomy(kind, item.id);
                  toast(r.ok ? (r.message ?? "Deleted") : r.message);
                  router.refresh();
                })
              }
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="grid gap-3 border-t border-border p-5 sm:grid-cols-2">
        <p className="eyebrow sm:col-span-2">{editing ? `Edit ${editing.name}` : `New ${kind}`}</p>
        <label className="text-xs text-muted-foreground">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
            className={input}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Slug
          <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={input} />
        </label>
        <label className="text-xs text-muted-foreground sm:col-span-2">
          Description
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={input} />
        </label>
        {kind === "collection" && (
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Cover image URL
            <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" className={input} />
          </label>
        )}
        <label className="text-xs text-muted-foreground">
          Sort order
          <input value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} inputMode="numeric" className={input} />
        </label>
        {kind === "collection" && (
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 accent-foreground" />
            Visible in store
          </label>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" size="sm" className="h-10" disabled={pending}>
            {editing ? "Save" : "Add"}
          </Button>
          {editing && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-10"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}
