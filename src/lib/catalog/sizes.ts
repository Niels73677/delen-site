const LETTER_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Canonical size ordering: letter sizes, then numeric sizes, then everything else. */
export function compareSizes(a: string, b: string): number {
  const rank = (s: string): [number, number, string] => {
    const letter = LETTER_ORDER.indexOf(s.toUpperCase());
    if (letter !== -1) return [0, letter, s];
    const num = Number.parseFloat(s);
    if (!Number.isNaN(num)) return [1, num, s];
    return [2, 0, s];
  };
  const [ga, va, sa] = rank(a);
  const [gb, vb, sb] = rank(b);
  return ga - gb || va - vb || sa.localeCompare(sb);
}

export function sortSizes(sizes: string[]): string[] {
  return [...new Set(sizes)].sort(compareSizes);
}
