export type ColorSwatch = { name: string; hex: string };
export type CardImage = { url: string; alt: string };

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  isNew: boolean;
  totalStock: number;
  images: CardImage[];
  colors: ColorSwatch[];
  sizes: string[];
  categorySlug: string | null;
};

export type Variant = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  sizeSort: number;
  priceCents: number;
  stock: number;
  isActive: boolean;
};

export type ProductImage = { id: string; url: string; alt: string; colorName: string | null; sortOrder: number };

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  materials: string | null;
  care: string | null;
  fit: string | null;
  priceCents: number;
  compareAtCents: number | null;
  isNew: boolean;
  category: { slug: string; name: string } | null;
  images: ProductImage[];
  variants: Variant[];
  updatedAt: string;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type Category = { id: string; slug: string; name: string; description: string | null };

export type Facets = {
  sizes: string[];
  colors: ColorSwatch[];
  price: { min: number; max: number };
};
