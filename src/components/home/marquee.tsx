const ITEMS = [
  "Complimentary shipping over €150",
  "30-day returns",
  "Organic & recycled fibres",
  "Small-batch production",
  "Designed to last",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-b border-border py-4" aria-label="Store benefits">
      <ul className="sr-only">
        {ITEMS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="flex w-max animate-marquee motion-reduce:animate-none" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className="eyebrow flex items-center whitespace-nowrap px-8 text-muted-foreground">
                {t}
                <span className="ml-16 inline-block size-1 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
