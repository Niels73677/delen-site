type Address = {
  name?: string | null;
  full_name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  state?: string | null;
  region?: string | null;
  country?: string | null;
  phone?: string | null;
};

export function AddressBlock({ address }: { address: unknown }) {
  if (!address || typeof address !== "object") return <p className="text-sm text-muted-foreground">—</p>;
  const a = address as Address;
  return (
    <address className="text-sm not-italic leading-relaxed text-muted-foreground">
      {(a.name ?? a.full_name) && <span className="block text-foreground">{a.name ?? a.full_name}</span>}
      {a.line1 && <span className="block">{a.line1}</span>}
      {a.line2 && <span className="block">{a.line2}</span>}
      <span className="block">{[a.postal_code, a.city].filter(Boolean).join(" ")}</span>
      {(a.state ?? a.region) && <span className="block">{a.state ?? a.region}</span>}
      {a.country && <span className="block">{a.country}</span>}
      {a.phone && <span className="mt-1 block">{a.phone}</span>}
    </address>
  );
}
