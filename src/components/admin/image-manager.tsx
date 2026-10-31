"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { addImageByUrl, deleteImage, reorderImages, updateImage, uploadProductImage } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/lib/supabase/types";
import { Panel } from "./ui";

type ImageRow = Tables<"product_images">;

export function ImageManager({ productId, images, colors }: { productId: string; images: ImageRow[]; colors: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [color, setColor] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.message) (r.ok ? toast : toast.error)(r.message);
      if (r.ok) router.refresh();
    });

  const move = (index: number, dir: -1 | 1) => {
    const ids = sorted.map((i) => i.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    run(() => reorderImages(productId, ids));
  };

  return (
    <Panel title={`Images (${images.length})`}>
      <div className="p-5">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((img, i) => (
            <li key={img.id} className="border border-border">
              <div className="relative aspect-[4/5] bg-surface">
                <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 bg-foreground px-2 py-1 text-[10px] uppercase tracking-wider text-background">Primary</span>}
              </div>
              <div className="space-y-2 p-2">
                <input
                  defaultValue={img.alt}
                  placeholder="Alt text"
                  aria-label="Alt text"
                  onBlur={(e) => e.target.value !== img.alt && run(() => updateImage(img.id, { alt: e.target.value }))}
                  className="h-8 w-full border border-border bg-background px-2 text-xs"
                />
                <select
                  defaultValue={img.color_name ?? ""}
                  aria-label="Colour"
                  onChange={(e) => run(() => updateImage(img.id, { colorName: e.target.value || null }))}
                  className="h-8 w-full border border-border bg-background px-1 text-xs"
                >
                  <option value="">All colours</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between">
                  <div className="flex">
                    <button type="button" className="p-1.5 disabled:opacity-30" disabled={i === 0 || pending} onClick={() => move(i, -1)} aria-label="Move earlier">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 disabled:opacity-30"
                      disabled={i === sorted.length - 1 || pending}
                      onClick={() => move(i, 1)}
                      aria-label="Move later"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    disabled={pending}
                    onClick={() => confirm("Remove this image?") && run(() => deleteImage(img.id))}
                    aria-label="Delete image"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-4 border-t border-border pt-6 lg:grid-cols-2">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("productId", productId);
              fd.set("colorName", color);
              run(async () => {
                const r = await uploadProductImage(fd);
                if (r.ok && fileRef.current) fileRef.current.value = "";
                return r;
              });
            }}
          >
            <p className="eyebrow">Upload images</p>
            <input
              ref={fileRef}
              type="file"
              name="files"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full text-sm file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-xs"
            />
            <input name="alt" placeholder="Alt text for these images" className="h-10 w-full border border-border bg-background px-3 text-sm" />
            <div className="flex gap-2">
              <select value={color} onChange={(e) => setColor(e.target.value)} className="h-10 flex-1 border border-border bg-background px-2 text-sm" aria-label="Colour for uploaded images">
                <option value="">All colours</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" className="h-10" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Upload />} Upload
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP or AVIF, up to 8 MB. Stored in Supabase Storage.</p>
          </form>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const r = await addImageByUrl(productId, url, "", color || null);
                if (r.ok) setUrl("");
                return r;
              });
            }}
          >
            <p className="eyebrow">Or add by URL</p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
            <Button type="submit" size="sm" variant="outline" className="h-10" disabled={pending || !url}>
              Add image
            </Button>
            <p className="text-xs text-muted-foreground">Remote hosts must be allowed in next.config.ts → images.remotePatterns.</p>
          </form>
        </div>
      </div>
    </Panel>
  );
}
