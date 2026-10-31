export const mainNav = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
] as const;

export const shopLinks = [
  { label: "All products", href: "/shop" },
  { label: "T-Shirts", href: "/shop?category=tees" },
  { label: "Sweatshirts & Hoodies", href: "/shop?category=sweatshirts" },
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "Outerwear", href: "/shop?category=outerwear" },
  { label: "Trousers & Denim", href: "/shop?category=trousers" },
  { label: "Accessories", href: "/shop?category=accessories" },
] as const;

export const serviceLinks = [
  { label: "Help & Contact", href: "/help" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Size guide", href: "/help#size-guide" },
  { label: "Track an order", href: "/account/orders" },
] as const;

export const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
] as const;
