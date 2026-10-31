"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/use-debounce";
import { formatPrice } from "@/lib/utils";

type Suggestion = { id: string; slug: string; name: string; priceCents: number; image: { url: string; alt: string } | null };

const POPULAR = ["Heavyweight tee", "Wool coat", "Denim", "Hoodie", "Cap"];

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; products: Suggestion[]; total: number } | null>(null);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(query.trim(), 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (debounced.length < 2) return;
    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { products: Suggestion[]; total: number }) => {
        setResult({ query: debounced, products: data.products ?? [], total: data.total ?? 0 });
        setActive(-1);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ query: debounced, products: [], total: 0 });
      });
    return () => controller.abort();
  }, [debounced]);

  // Derived state: results only count when they belong to the current query.
  const searching = debounced.length >= 2;
  const loading = searching && result?.query !== debounced;
  const results = searching && result ? result.products : [];
  const total = searching && result ? result.total : 0;

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = results[active];
    if (target) return go(`/products/${target.slug}`);
    if (query.trim()) go(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="max-h-[100dvh] overflow-y-auto"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Search products</SheetTitle>
        <div className="container-page py-6 sm:py-10">
          <form onSubmit={submit} role="search" className="flex items-center gap-4 border-b border-foreground pb-3 pr-10">
            {loading ? (
              <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <Search className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search the collection"
              className="h-12 w-full bg-transparent text-2xl font-medium tracking-tight placeholder:text-muted-foreground/60 focus:outline-none sm:text-3xl"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              aria-label="Search"
              maxLength={80}
            />
          </form>

          {debounced.length < 2 ? (
            <div className="mt-8">
              <p className="eyebrow text-muted-foreground">Popular searches</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      className="border border-border px-4 py-2 text-sm transition-colors hover:border-foreground"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-8" aria-live="polite">
              {!loading && results.length === 0 ? (
                <p className="text-muted-foreground">No products match “{debounced}”. Try a different term.</p>
              ) : (
                <>
                  <ul id={listId} role="listbox" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                    {results.map((p, i) => (
                      <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="group block"
                          data-active={i === active}
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-surface outline-offset-2 group-data-[active=true]:outline group-data-[active=true]:outline-1">
                            {p.image && (
                              <Image
                                src={p.image.url}
                                alt={p.image.alt}
                                fill
                                sizes="(min-width: 1024px) 16vw, 45vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              />
                            )}
                          </div>
                          <p className="mt-3 text-sm">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(p.priceCents)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {total > results.length && (
                    <button
                      type="button"
                      onClick={() => go(`/shop?q=${encodeURIComponent(debounced)}`)}
                      className="eyebrow mt-8 inline-flex items-center gap-2 link-underline"
                    >
                      View all {total} results <ArrowRight className="size-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
