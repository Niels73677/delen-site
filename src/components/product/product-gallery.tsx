"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const key = images.map((i) => i.id).join();

  // Reset when the selected colour changes the image set.
  useEffect(() => {
    setIndex(0);
    scroller.current?.scrollTo({ left: 0 });
  }, [key]);

  const current = images[index] ?? images[0];
  if (!current) return <div className="aspect-[4/5] bg-surface" />;

  const go = (i: number) => setIndex((i + images.length) % images.length);

  const onMobileScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile: swipeable, scroll-snapped */}
      <div className="relative -mx-4 sm:-mx-6 lg:hidden">
        <div
          ref={scroller}
          onScroll={onMobileScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`${productName} images`}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-surface"
              onClick={() => {
                setIndex(i);
                setZoomOpen(true);
              }}
              aria-label={`Open image ${i + 1} of ${images.length}`}
            >
              <Image src={img.url} alt={img.alt || productName} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <span key={img.id} className={cn("h-0.5 w-5 bg-background/50 transition-colors", i === index && "bg-background")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnails + hover zoom */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[72px_1fr]">
        <ul className="flex flex-col gap-3" aria-label="Choose image">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden bg-surface transition-opacity",
                  i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-foreground" : "opacity-60 hover:opacity-100",
                )}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
              >
                <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <div
          className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-surface"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setOrigin(null)}
          onClick={() => setZoomOpen(true)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={current.url}
                alt={current.alt || productName}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                quality={85}
                className="object-cover transition-transform duration-300 ease-out"
                style={origin ? { transform: "scale(1.8)", transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute bottom-4 right-4 flex size-10 items-center justify-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-4" strokeWidth={1.5} />
          </span>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 text-xs tabular-nums text-foreground/70">
              {index + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      <DialogPrimitive.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 bg-background data-[state=open]:animate-in data-[state=open]:fade-in-0"
            aria-describedby={undefined}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(index + 1);
              if (e.key === "ArrowLeft") go(index - 1);
            }}
          >
            <DialogPrimitive.Title className="sr-only">{productName} — image {index + 1}</DialogPrimitive.Title>
            <div className="relative h-full w-full overflow-auto">
              <div className="relative mx-auto h-[200dvh] w-full max-w-[1400px] sm:h-[180dvh]">
                <Image src={current.url} alt={current.alt || productName} fill sizes="100vw" quality={85} className="object-contain object-top" />
              </div>
            </div>
            <DialogPrimitive.Close
              className="fixed right-4 top-4 flex size-12 items-center justify-center bg-background/90"
              aria-label="Close zoom"
            >
              <X className="size-5" strokeWidth={1.5} />
            </DialogPrimitive.Close>
            {images.length > 1 && (
              <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 bg-background/90 p-1">
                <button type="button" className="flex size-11 items-center justify-center" onClick={() => go(index - 1)} aria-label="Previous image">
                  <ChevronLeft className="size-5" strokeWidth={1.5} />
                </button>
                <span className="text-xs tabular-nums">
                  {index + 1} / {images.length}
                </span>
                <button type="button" className="flex size-11 items-center justify-center" onClick={() => go(index + 1)} aria-label="Next image">
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
