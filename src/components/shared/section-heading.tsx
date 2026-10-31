import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
  id,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 lg:mb-14">
      <div>
        {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
        <h2 id={id} className="text-headline mt-4 font-semibold uppercase">
          {title}
        </h2>
      </div>
      {href && (
        <Link href={href} className="eyebrow link-underline shrink-0">
          {linkLabel ?? "View all"}
        </Link>
      )}
    </div>
  );
}
