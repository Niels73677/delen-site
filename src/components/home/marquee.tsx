const WORDS = ["Essentials", "Outerwear", "Knitwear", "Denim", "Tailoring", "Accessories"];

/** Oversized words whose speed and direction follow the visitor's scrolling. */
export function Marquee({ direction = 1 }: { direction?: 1 | -1 }) {
  const row = [...WORDS, ...WORDS];
  return (
    <div data-fx="marquee" data-direction={direction} className="overflow-hidden border-y border-border py-6 lg:py-10" aria-label="Categories">
      <ul className="sr-only">
        {WORDS.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div data-track className="flex w-max animate-marquee items-center motion-reduce:animate-none [.fx-ready_&]:animate-none" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span
                  className={`whitespace-nowrap px-6 text-[clamp(3rem,9vw,8rem)] font-semibold uppercase leading-none tracking-[-0.05em] lg:px-10 ${i % 2 ? "text-outline" : ""}`}
                >
                  {w}
                </span>
                <span className="inline-block size-4 shrink-0 rounded-full bg-accent lg:size-6" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
