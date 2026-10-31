/** Garment measurements in centimetres. Edit to match your own pattern grading. */
export const sizeGuide = {
  tops: {
    title: "Tops & outerwear",
    note: "Measured flat across the garment. Chest is pit to pit, doubled.",
    columns: ["Size", "Chest", "Length", "Sleeve"],
    rows: [
      ["XS", "96", "68", "60"],
      ["S", "102", "70", "62"],
      ["M", "108", "72", "64"],
      ["L", "114", "74", "66"],
      ["XL", "120", "76", "67"],
    ],
  },
  trousers: {
    title: "Trousers & denim",
    note: "Waist measured flat and doubled; inseam from crotch seam to hem.",
    columns: ["Size", "Waist", "Hip", "Inseam"],
    rows: [
      ["28", "72", "96", "80"],
      ["30", "77", "100", "81"],
      ["32", "82", "104", "82"],
      ["34", "87", "108", "83"],
      ["36", "92", "112", "84"],
    ],
  },
} as const;

export type SizeGuideKey = keyof typeof sizeGuide;

export function sizeGuideFor(categorySlug: string | null | undefined): SizeGuideKey | null {
  if (!categorySlug || categorySlug === "accessories") return null;
  return categorySlug === "trousers" ? "trousers" : "tops";
}
