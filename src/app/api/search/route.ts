import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog/queries";
import { DEFAULT_FILTERS } from "@/lib/catalog/filters";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2 || !isSupabaseConfigured()) return NextResponse.json({ products: [], total: 0 });
  try {
    const { products, total } = await searchProducts({ ...DEFAULT_FILTERS, q }, 6);
    return NextResponse.json(
      {
        total,
        products: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          priceCents: p.priceCents,
          image: p.images[0] ?? null,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json({ products: [], total: 0, error: "Search is unavailable." }, { status: 503 });
  }
}
