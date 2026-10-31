"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import {
  discountSchema,
  fulfillmentSchema,
  productSchema,
  taxonomySchema,
  variantSchema,
} from "@/lib/validation/admin";
import { fieldErrors, type FormState } from "@/lib/validation/schemas";

/*
 * Every admin action re-checks the caller's role on the server (requireAdmin)
 * and then writes through the user's own Supabase client, so Row Level Security
 * enforces admin-only access a second time at the database.
 */

type Result = { ok: true; message?: string; id?: string } | { ok: false; message: string };

function fail(error: unknown, fallback = "Something went wrong."): Result {
  if (error instanceof AuthError) return { ok: false, message: error.message };
  if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
    return { ok: false, message: "That value is already in use (must be unique)." };
  }
  console.error("[admin]", error);
  return { ok: false, message: fallback };
}

function failMessage(error: unknown, fallback?: string): string {
  const r = fail(error, fallback);
  return r.ok ? "" : r.message;
}

function revalidateStore(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/products/${slug}`);
}

const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export async function saveProduct(_prev: FormState & { id?: string }, formData: FormData): Promise<FormState & { id?: string }> {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const name = String(formData.get("name") ?? "");
  const parsed = productSchema.safeParse({
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: formData.get("description") ?? "",
    details: formData.get("details") ?? "",
    materials: formData.get("materials") ?? undefined,
    care: formData.get("care") ?? undefined,
    fit: formData.get("fit") ?? undefined,
    price: formData.get("price") ?? "",
    compareAt: formData.get("compareAt") ?? undefined,
    categoryId: formData.get("categoryId") || null,
    collectionIds: formData.getAll("collectionIds"),
    status: formData.get("status"),
    isFeatured: bool(formData.get("isFeatured")),
    isNew: bool(formData.get("isNew")),
  });
  if (!parsed.success) return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const p = parsed.data;
  const id = z.uuid().safeParse(formData.get("id")).data;
  const row = {
    name: p.name,
    slug: p.slug,
    description: p.description,
    details: p.details,
    materials: p.materials,
    care: p.care,
    fit: p.fit,
    price_cents: p.price,
    compare_at_cents: p.compareAt,
    category_id: p.categoryId,
    status: p.status,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    ...(p.status === "active" ? { published_at: new Date().toISOString() } : {}),
  };

  const { supabase } = ctx;
  let productId = id;
  if (id) {
    const { data: existing } = await supabase.from("products").select("published_at").eq("id", id).maybeSingle();
    const { error } = await supabase
      .from("products")
      .update({ ...row, published_at: existing?.published_at ?? row.published_at ?? null })
      .eq("id", id);
    if (error) return { status: "error", message: failMessage(error) };
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return { status: "error", message: failMessage(error) };
    productId = data.id;
  }

  await supabase.from("product_collections").delete().eq("product_id", productId!);
  if (p.collectionIds.length) {
    await supabase.from("product_collections").insert(p.collectionIds.map((collection_id) => ({ product_id: productId!, collection_id })));
  }
  revalidateStore(p.slug);
  revalidatePath("/admin/products");
  return { status: "success", message: id ? "Product saved." : "Product created.", id: productId };
}

export async function setProductStatus(productId: string, status: "draft" | "active" | "archived"): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(productId);
    const { data, error } = await supabase.from("products").update({ status }).eq("id", productId).select("slug").single();
    if (error) throw error;
    revalidateStore(data.slug);
    revalidatePath("/admin/products");
    return { ok: true, message: status === "archived" ? "Product archived." : "Status updated." };
  } catch (e) {
    return fail(e);
  }
}

/** Hard delete only when the product has never been ordered; otherwise archive. */
export async function deleteProduct(productId: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(productId);
    const { count } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", productId);
    if ((count ?? 0) > 0) {
      await supabase.from("products").update({ status: "archived" }).eq("id", productId);
      revalidateStore();
      return { ok: true, message: "This product has orders, so it was archived instead of deleted." };
    }
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
    revalidateStore();
    revalidatePath("/admin/products");
    return { ok: true, message: "Product deleted." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadProductImage(formData: FormData): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    const productId = z.uuid().parse(formData.get("productId"));
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return { ok: false, message: "Choose at least one image." };
    const { data: product } = await supabase.from("products").select("slug").eq("id", productId).single();
    const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
    let order = count ?? 0;

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) return { ok: false, message: `${file.name}: use JPG, PNG, WebP or AVIF.` };
      if (file.size > 8 * 1024 * 1024) return { ok: false, message: `${file.name}: images must be under 8 MB.` };
      const ext = file.type.split("/")[1];
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const colorName = String(formData.get("colorName") ?? "").trim() || null;
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        url: pub.publicUrl,
        alt: String(formData.get("alt") ?? "").trim().slice(0, 200),
        color_name: colorName,
        sort_order: order++,
      });
      if (error) throw error;
    }
    revalidateStore(product?.slug);
    return { ok: true, message: files.length === 1 ? "Image uploaded." : `${files.length} images uploaded.` };
  } catch (e) {
    return fail(e, "Upload failed. Check the file and try again.");
  }
}

export async function addImageByUrl(productId: string, url: string, alt: string, colorName: string | null): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(productId);
    const safeUrl = z.url().refine((u) => u.startsWith("https://"), "Use an https:// URL").parse(url.trim());
    const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
    const { error } = await supabase
      .from("product_images")
      .insert({ product_id: productId, url: safeUrl, alt: alt.slice(0, 200), color_name: colorName || null, sort_order: count ?? 0 });
    if (error) throw error;
    revalidateStore();
    return { ok: true, message: "Image added." };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Invalid URL" };
    return fail(e);
  }
}

export async function updateImage(imageId: string, patch: { alt?: string; colorName?: string | null; sortOrder?: number }): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(imageId);
    const { error } = await supabase
      .from("product_images")
      .update({
        ...(patch.alt !== undefined ? { alt: patch.alt.slice(0, 200) } : {}),
        ...(patch.colorName !== undefined ? { color_name: patch.colorName || null } : {}),
        ...(patch.sortOrder !== undefined ? { sort_order: patch.sortOrder } : {}),
      })
      .eq("id", imageId);
    if (error) throw error;
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reorderImages(productId: string, orderedIds: string[]): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(productId);
    z.array(z.uuid()).parse(orderedIds);
    await Promise.all(
      orderedIds.map((id, i) => supabase.from("product_images").update({ sort_order: i }).eq("id", id).eq("product_id", productId)),
    );
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteImage(imageId: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(imageId);
    const { data: image } = await supabase.from("product_images").select("url").eq("id", imageId).single();
    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) throw error;
    const marker = "/storage/v1/object/public/product-images/";
    if (image?.url.includes(marker)) {
      await supabase.storage.from("product-images").remove([image.url.split(marker)[1]!]);
    }
    revalidateStore();
    return { ok: true, message: "Image removed." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Variants & inventory
// ---------------------------------------------------------------------------
export async function saveVariant(input: Record<string, unknown>): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = variantSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid variant." };
    const v = parsed.data;
    const row = {
      product_id: v.productId,
      sku: v.sku.toUpperCase(),
      color_name: v.colorName,
      color_hex: v.colorHex.toUpperCase(),
      size: v.size,
      size_sort: v.sizeSort,
      price_override_cents: v.priceOverride,
      is_active: v.isActive,
    };
    let variantId = v.id;
    if (v.id) {
      const { error } = await supabase.from("product_variants").update(row).eq("id", v.id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("product_variants").insert(row).select("id").single();
      if (error) throw error;
      variantId = data.id;
    }
    // Inventory row is created by trigger for new variants; set absolute stock.
    const { error: invError } = await supabase.from("inventory").update({ quantity: v.stock }).eq("variant_id", variantId!);
    if (invError) throw invError;
    revalidateStore();
    return { ok: true, id: variantId, message: v.id ? "Variant saved." : "Variant added." };
  } catch (e) {
    return fail(e);
  }
}

/** Adjusts stock by a delta (e.g. +12 restock, -1 damaged). Never goes below zero. */
export async function adjustInventory(variantId: string, delta: number): Promise<Result & { quantity?: number }> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(variantId);
    z.number().int().min(-100000).max(100000).parse(delta);
    const { data: current, error: readError } = await supabase.from("inventory").select("quantity").eq("variant_id", variantId).single();
    if (readError) throw readError;
    const quantity = Math.max(0, current.quantity + delta);
    // Compare-and-set: if a checkout reserved stock in the meantime, nothing is
    // updated and the admin is asked to retry with the fresh value.
    const { data: updated, error } = await supabase
      .from("inventory")
      .update({ quantity })
      .eq("variant_id", variantId)
      .eq("quantity", current.quantity)
      .select("quantity");
    if (error) throw error;
    if (!updated?.length) return { ok: false, message: "Stock changed while you were editing — please try again." };
    revalidateStore();
    return { ok: true, quantity };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteVariant(variantId: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(variantId);
    const { count } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("variant_id", variantId);
    if ((count ?? 0) > 0) {
      await supabase.from("product_variants").update({ is_active: false }).eq("id", variantId);
      revalidateStore();
      return { ok: true, message: "Variant has orders — it was deactivated instead." };
    }
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) throw error;
    revalidateStore();
    return { ok: true, message: "Variant deleted." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function updateFulfillment(_prev: FormState, formData: FormData): Promise<FormState> {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const parsed = fulfillmentSchema.safeParse({
    orderId: formData.get("orderId"),
    fulfillmentStatus: formData.get("fulfillmentStatus"),
    trackingCarrier: formData.get("trackingCarrier") ?? undefined,
    trackingNumber: formData.get("trackingNumber") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  const f = parsed.data;
  const { data: order } = await ctx.supabase.from("orders").select("status, shipped_at").eq("id", f.orderId).single();
  if (!order) return { status: "error", message: "Order not found." };
  if (order.status !== "paid" && f.fulfillmentStatus !== "cancelled") {
    return { status: "error", message: "Only paid orders can be fulfilled." };
  }
  if (f.fulfillmentStatus === "shipped" && !f.trackingNumber) {
    return { status: "error", message: "Add a tracking number before marking the order as shipped." };
  }
  const { error } = await ctx.supabase
    .from("orders")
    .update({
      fulfillment_status: f.fulfillmentStatus,
      tracking_carrier: f.trackingCarrier,
      tracking_number: f.trackingNumber,
      notes: f.notes,
      shipped_at: f.fulfillmentStatus === "shipped" ? (order.shipped_at ?? new Date().toISOString()) : order.shipped_at,
    })
    .eq("id", f.orderId);
  if (error) return { status: "error", message: "Could not update the order." };
  revalidatePath(`/admin/orders/${f.orderId}`);
  revalidatePath("/admin/orders");
  return { status: "success", message: "Order updated." };
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------
export async function createDiscount(_prev: FormState, formData: FormData): Promise<FormState> {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const parsed = discountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const { error } = await ctx.supabase.from("discount_codes").insert({
    code: d.code,
    description: d.description,
    kind: d.kind,
    value: d.kind === "fixed" ? Math.round(d.value * 100) : Math.round(d.value),
    min_subtotal_cents: Math.round(d.minSubtotal * 100),
    max_redemptions: d.maxRedemptions,
    starts_at: d.startsAt ? new Date(d.startsAt).toISOString() : null,
    ends_at: d.endsAt ? new Date(d.endsAt).toISOString() : null,
  });
  if (error) {
    return { status: "error", message: error.code === "23505" ? "A discount with this code already exists." : "Could not create the discount." };
  }
  revalidatePath("/admin/discounts");
  return { status: "success", message: `Discount ${d.code} created.` };
}

export async function toggleDiscount(id: string, isActive: boolean): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(id);
    const { error } = await supabase.from("discount_codes").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDiscount(id: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(id);
    const { error } = await supabase.from("discount_codes").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/discounts");
    return { ok: true, message: "Discount deleted." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Categories & collections
// ---------------------------------------------------------------------------
export async function saveTaxonomy(kind: "category" | "collection", input: Record<string, unknown>): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = taxonomySchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
    const t = parsed.data;
    if (kind === "category") {
      const row = { name: t.name, slug: t.slug, description: t.description, sort_order: t.sortOrder };
      const { error } = t.id
        ? await supabase.from("categories").update(row).eq("id", t.id)
        : await supabase.from("categories").insert(row);
      if (error) throw error;
    } else {
      const row = {
        name: t.name,
        slug: t.slug,
        description: t.description,
        image_url: t.imageUrl,
        sort_order: t.sortOrder,
        is_active: t.isActive,
      };
      const { error } = t.id
        ? await supabase.from("collections").update(row).eq("id", t.id)
        : await supabase.from("collections").insert(row);
      if (error) throw error;
    }
    revalidateStore();
    revalidatePath("/admin/catalog");
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTaxonomy(kind: "category" | "collection", id: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    z.uuid().parse(id);
    const { error } = await supabase.from(kind === "category" ? "categories" : "collections").delete().eq("id", id);
    if (error) throw error;
    revalidateStore();
    revalidatePath("/admin/catalog");
    return { ok: true, message: "Deleted." };
  } catch (e) {
    return fail(e);
  }
}
