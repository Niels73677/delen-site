# ATELIER — Modern Essentials

A premium clothing e-commerce store built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui-style components**, **Motion**, **Supabase** and **Stripe**.

> Contemporary clothing designed for individuals who value simplicity, quality, and timeless expression.

Everything here works for real: the catalogue, filters, inventory, cart, checkout, payments, accounts and admin all run on the database and Stripe. No mock data is used at runtime.

---

## Features

**Storefront**
- Editorial homepage: full-screen hero, collection cards, best sellers, brand story, newsletter
- Shop with filters for category, size, colour, price and availability, plus sorting (featured, newest, popular, price) and pagination. Filters are kept in the URL and filtered in Postgres
- Search with autocomplete (⌘/Ctrl + K), using full-text and trigram matching
- Product pages: colour-aware gallery with thumbnails, hover zoom and a fullscreen lightbox; colour/size variants; stock indicators; size guide; quantity limits; specifications; shipping and returns info; related and recently viewed products; JSON-LD structured data
- Quick-add from product cards, a wishlist, an animated cart drawer and a full cart page with discount codes
- Mobile: full-screen animated menu, filter drawer, swipeable gallery, sticky add-to-bag button
- SEO: per-page metadata, Open Graph tags, canonical URLs, dynamic `sitemap.xml`, `robots.txt`, ISR for product pages
- Respects `prefers-reduced-motion`, skip link, semantic landmarks, labelled controls, visible focus styles

**Commerce**
- Prices are always recalculated on the server from the database. The client only sends variant IDs and quantities
- Stock is reserved in one Postgres transaction (`create_pending_order`) with row locks, so nothing can be oversold
- Stripe Checkout handles shipping and billing addresses, phone number and discounts (as an exact single-use coupon). Every Stripe call uses an idempotency key
- Orders become **paid only through the signature-verified Stripe webhook**. Duplicate events are ignored, and failed processing is retried
- Expired, cancelled or failed checkouts release their reserved stock and discount redemptions
- Guest checkout. Signed-in customers get their default saved address prefilled through a Stripe Customer
- The cart persists in localStorage and, for signed-in users, is also saved to their account

**Accounts** (Supabase Auth): register, sign in and out, password reset, profile, address book, order history and order detail with fulfilment progress and tracking.

**Admin** (`/admin`, admins only, checked on the server and by RLS)
- Overview: revenue, orders, customers, average order value, recent orders, best sellers, low stock
- Products: create, edit, archive or delete; prices and sale prices; categories and collections; featured and "new" flags; image upload to Supabase Storage (reorder, alt text, link to a colour); variant generator (colour × sizes); stock adjustment and restocking
- Orders: search and filter, customer info, payment status, fulfilment status, tracking numbers, internal notes
- Discount codes (percentage or fixed, minimum order, usage limit, validity window), categories and collections, customers

---

## Project structure

```
src/
  app/
    (store)/            storefront routes (home, shop, collections, products, cart, checkout, account, content pages)
    admin/              admin dashboard
    api/                checkout, cart quote, search, Stripe webhook
    actions/            server actions (auth, account, admin, newsletter, sync)
    auth/callback       email confirmation / password recovery
  components/           ui/ (shadcn-style primitives), layout/, home/, shop/, product/, cart/, account/, admin/
  config/               brand.ts (name, copy, shipping rules), navigation, size guide
  lib/
    catalog/            filters, queries, variant logic
    cart/               pure cart maths (shared by client estimate & server quote)
    checkout/           quote, createCheckout (dependency-injected), Stripe/Supabase wiring
    stripe/             client + webhook handler
    supabase/           server / browser / public / service clients, generated types
  stores/               Zustand: cart, wishlist, recently viewed
  proxy.ts              session refresh + route protection (Next 16 "proxy", formerly middleware)
supabase/
  migrations/           schema, functions, RLS, storage
  seed.sql              20 sample products, 4 collections, 6 categories, discount codes
tests/
  unit/                 Vitest
  db/                   Postgres integration tests (inventory, concurrency, RLS)
  e2e/                  Playwright
scripts/create-admin.mjs
```

## Customising the brand

- **Name, copy, hero and story images, social links, shipping thresholds, currency:** `src/config/brand.ts`
- **Colours and type scale:** CSS variables at the top of `src/app/globals.css`
- **Fonts:** `src/app/layout.tsx` (Geist via the `geist` package, so no network fetch at build time)
- **Navigation and footer links:** `src/config/navigation.ts`
- **Size guide:** `src/config/size-guide.ts`

---

## Getting started

Requirements: Node 20.9+, and Docker if you want to run Supabase locally.

```bash
npm install
cp .env.example .env.local
```

### 1. Supabase

**Option A: local (recommended for development)**

```bash
npx supabase start          # prints API URL, anon key and service_role key
npx supabase db reset       # applies supabase/migrations + supabase/seed.sql
```

Copy the printed `API URL`, `anon key` and `service_role key` into `.env.local`.

**Option B: hosted project**

1. Create a project at [supabase.com](https://supabase.com).
2. Link it and push the schema:
   ```bash
   npx supabase link --project-ref <your-ref>
   npx supabase db push
   ```
3. Load the sample catalogue (optional) by running `supabase/seed.sql` in the SQL editor, or `psql "$DATABASE_URL" -f supabase/seed.sql`.
4. **Authentication → URL configuration:** set *Site URL* to your domain and add `https://your-domain/auth/callback` to *Redirect URLs*.
5. Copy the URL, anon key and service-role key from **Project Settings → API** into your env.

The `product-images` storage bucket and its policies are created by the migrations.

### 2. Create an administrator

```bash
node --env-file=.env.local scripts/create-admin.mjs you@example.com 'a-strong-password'
```

Running it for an existing account promotes that account. Customers can never change their own role: this is blocked by column privileges and a database trigger.

### 3. Stripe

1. Get your **test** secret key from Dashboard → Developers → API keys and set `STRIPE_SECRET_KEY`.
2. Forward webhooks locally with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Put the printed `whsec_…` value in `STRIPE_WEBHOOK_SECRET`.
3. In production, add an endpoint at `https://your-domain/api/stripe/webhook` with these events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
4. Enable the payment methods you want (cards, iDEAL, Bancontact, Apple Pay…) in the Stripe dashboard. Checkout shows them automatically.

Test card: `4242 4242 4242 4242`, any future expiry date, any CVC.

### 4. Run

```bash
npm run dev     # http://localhost:3000
```

Without Supabase keys the site still renders and shows a setup notice instead of the catalogue. Without Stripe keys, checkout returns a clear "not configured" message.

---

## How checkout stays safe

1. The cart sends only `{ variantId, quantity }`. `/api/checkout` validates it with Zod.
2. The server loads current prices, stock and the discount code with the service role, and builds a quote (`lib/checkout/quote.ts`).
3. `create_pending_order()` locks the inventory rows in a fixed order, checks availability, deducts stock, reserves a discount redemption, and creates the order and its line items. It also recomputes the subtotal from the database and refuses to continue if the price changed. `CHECK (quantity >= 0)` is the final guard.
4. A Stripe Checkout Session is created with the exact amounts, an idempotency key and a 31-minute expiry. If Stripe fails, the reservation is released immediately.
5. Only the webhook, after verifying the signature, calls `mark_order_paid()`. That call is idempotent. Processed event IDs are stored in `stripe_events`.
6. `checkout.session.expired` or a failed asynchronous payment releases the reserved stock. Leaving checkout through the cancel page expires the session right away. `release_expired_orders()` is a safety net: schedule it with `pg_cron` if you want, for example `select cron.schedule('release-expired', '*/15 * * * *', 'select public.release_expired_orders()');`.

The success page reads the order status from the database (written by the webhook). It never trusts the redirect itself.

---

## Testing

```bash
npm test               # unit tests (no services needed)
npm run typecheck
npm run lint
```

**Database integration tests** need the local Supabase stack. They cover stock reservation, concurrent checkouts (no overselling), idempotent payment and RLS:

```bash
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm run test:db
```

**End-to-end tests** (Playwright) cover the full journey: browse, filter, product, bag, discount, checkout, a signed webhook, then the paid order and success page. They also cover auth, address book, admin access control, discount management and mobile navigation. They run against a production build, local Supabase and [stripe-mock](https://github.com/stripe/stripe-mock):

```bash
docker run -d -p 12111:12111 stripe/stripe-mock:latest
node --env-file=.env.local scripts/create-admin.mjs admin@atelier.test 'atelier-admin-1'

export TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
export STRIPE_SECRET_KEY=sk_test_123mock STRIPE_WEBHOOK_SECRET=whsec_e2e_secret
export STRIPE_API_BASE_URL=http://localhost:12111
export E2E_ADMIN_EMAIL=admin@atelier.test E2E_ADMIN_PASSWORD=atelier-admin-1
npm run test:e2e
```

---

## Deployment (Vercel)

1. Push to GitHub and import the repository in Vercel.
2. Add the environment variables from `.env.example`, using your production URL and live Stripe keys once you are ready.
3. Run `npx supabase db push` against your production project. Do **not** run the seed in production unless you want the sample catalogue.
4. Create the Stripe webhook endpoint (see above) and set `STRIPE_WEBHOOK_SECRET`.
5. Create your admin with `scripts/create-admin.mjs`.
6. In Supabase Auth, configure SMTP so confirmation and reset emails come from your domain.

Product pages are statically generated and revalidated every 60 seconds, and admin edits trigger revalidation immediately.

---

## Notes and trade-offs

- **Hosted Stripe Checkout vs. embedded payment form:** Checkout keeps card data entirely off our servers (simplest PCI scope) and supports wallets and local methods without extra code. The trade-off is less visual control over the payment step.
- **Taxes:** prices include VAT, which suits an EU brand. For destination-based tax, enable Stripe Tax and set `automatic_tax` in `lib/checkout/deps.ts`.
- **Emails:** order confirmation emails come from Stripe receipts (enable them in the Stripe dashboard). Shipping notifications are a natural next step: send them from `updateFulfillment` with a provider such as Resend.
- **Rate limiting:** add it to `/api/checkout`, `/api/cart/quote` and the auth actions at the edge (Vercel Firewall or Upstash) before launch.
- **Images:** the sample photos come from [Unsplash](https://unsplash.com/license) and are free for commercial use. Replace them with your own photography before launch.
