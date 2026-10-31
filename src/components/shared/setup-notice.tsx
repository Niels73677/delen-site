import { brand } from "@/config/brand";

/** Shown instead of catalog content when Supabase is not configured yet. */
export function SetupNotice() {
  return (
    <section className="container-page py-24">
      <div className="mx-auto max-w-xl border border-border bg-card p-8 sm:p-12">
        <p className="eyebrow text-muted-foreground">Setup required</p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Connect your database</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {brand.name} reads products, collections and inventory from Supabase. Add{" "}
          <code className="bg-surface px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="bg-surface px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="bg-surface px-1">.env.local</code>,
          run the migrations and seed, then restart the server. See the README for step-by-step instructions.
        </p>
      </div>
    </section>
  );
}
