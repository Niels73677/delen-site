"use client";

import { useFormAction } from "@/hooks/use-form-action";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProduct, deleteProduct } from "@/app/actions/admin";
import { FormField, FormMessage } from "@/components/account/form-field";
import { SubmitButton } from "@/components/account/submit-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { slugify } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";
import type { FormState } from "@/lib/validation/schemas";
import { Panel } from "./ui";

type Product = Tables<"products">;
type Option = { id: string; name: string };

export function ProductForm({
  product,
  categories,
  collections,
  selectedCollections,
}: {
  product: Product | null;
  categories: Option[];
  collections: Option[];
  selectedCollections: string[];
}) {
  const router = useRouter();
  const [state, onSubmit, pending] = useFormAction<FormState & { id?: string }>(saveProduct, { status: "idle" });
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [deleting, startDelete] = useTransition();
  const e = state.fieldErrors ?? {};

  const handled = useRef<typeof state | null>(null);
  useEffect(() => {
    if (state.status === "success" && handled.current !== state) {
      handled.current = state;
      toast(state.message);
      if (!product && state.id) router.push(`/admin/products/${state.id}`);
      else router.refresh();
    }
  }, [state, product, router]);

  const euros = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toFixed(2).replace(/\.00$/, ""));

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-3" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-6 xl:col-span-2">
        <Panel title="Details">
          <div className="grid gap-5 p-5">
            <FormMessage status={state.status === "error" ? "error" : "idle"} message={state.message} />
            <FormField
              label="Name"
              name="name"
              value={name}
              onChange={(ev) => {
                setName(ev.target.value);
                if (!slugTouched) setSlug(slugify(ev.target.value));
              }}
              error={e.name}
              required
            />
            <FormField
              label="URL slug"
              name="slug"
              value={slug}
              onChange={(ev) => {
                setSlug(ev.target.value);
                setSlugTouched(true);
              }}
              error={e.slug}
              hint={`/products/${slug || "…"}`}
            />
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={5} defaultValue={product?.description ?? ""} />
            </div>
            <div>
              <Label htmlFor="details">Details (one per line)</Label>
              <Textarea id="details" name="details" rows={4} defaultValue={product?.details.join("\n") ?? ""} />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField label="Materials" name="materials" defaultValue={product?.materials ?? ""} />
              <FormField label="Care" name="care" defaultValue={product?.care ?? ""} />
              <FormField label="Fit" name="fit" defaultValue={product?.fit ?? ""} />
            </div>
          </div>
        </Panel>
        <Panel title="Pricing">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <FormField label="Price (€)" name="price" inputMode="decimal" defaultValue={euros(product?.price_cents)} error={e.price} required />
            <FormField
              label="Compare-at price (€)"
              name="compareAt"
              inputMode="decimal"
              defaultValue={euros(product?.compare_at_cents)}
              error={e.compareAt}
              hint="Optional. Shows the product as on sale."
            />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Status">
          <div className="space-y-5 p-5">
            <div>
              <Label htmlFor="status">Visibility</Label>
              <NativeSelect id="status" name="status" defaultValue={product?.status ?? "draft"}>
                <option value="draft">Draft — hidden</option>
                <option value="active">Active — visible in store</option>
                <option value="archived">Archived</option>
              </NativeSelect>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.is_featured ?? false} className="size-4 accent-foreground" />
              Featured product
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="isNew" defaultChecked={product?.is_new ?? true} className="size-4 accent-foreground" />
              Show “New” badge
            </label>
          </div>
        </Panel>
        <Panel title="Organisation">
          <div className="space-y-5 p-5">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <NativeSelect id="categoryId" name="categoryId" defaultValue={product?.category_id ?? ""}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <fieldset>
              <legend className="eyebrow mb-3">Collections</legend>
              <div className="space-y-2.5">
                {collections.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="collectionIds"
                      value={c.id}
                      defaultChecked={selectedCollections.includes(c.id)}
                      className="size-4 accent-foreground"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Panel>
        <div className="flex flex-wrap gap-3">
          <SubmitButton pending={pending}>{product ? "Save changes" : "Create product"}</SubmitButton>
          {product && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={deleting}
              onClick={() =>
                startDelete(async () => {
                  if (!confirm("Delete this product? Products with orders are archived instead.")) return;
                  const r = await deleteProduct(product.id);
                  toast(r.ok ? r.message : r.message);
                  if (r.ok) router.push("/admin/products");
                })
              }
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
