export function PolicyPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="container-page pb-24 pt-10 lg:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow text-muted-foreground">{eyebrow}</p>
        <h1 className="text-headline mt-4 font-semibold uppercase">{title}</h1>
        {updated && <p className="mt-5 text-sm text-muted-foreground">Last updated {updated}</p>}
      </header>
      <div className="prose-atelier mt-12 max-w-2xl lg:ml-[33%]">{children}</div>
    </article>
  );
}
