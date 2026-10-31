-- =============================================================================
-- ATELIER — core schema
-- Catalog, inventory, customers, orders, discounts, newsletter.
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;
create extension if not exists citext with schema extensions;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text check (char_length(full_name) <= 120),
  phone       text check (char_length(phone) <= 40),
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role) where role = 'admin';
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Admin check used by RLS policies. SECURITY DEFINER so it can read profiles
-- without recursing into the profiles policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers must never be able to promote themselves. Requests without a user
-- (service role, SQL console) and admins may change roles.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Not allowed to change role' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- -----------------------------------------------------------------------------
-- Catalog
-- -----------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 1 and 80),
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 1 and 80),
  description text,
  image_url   text,
  image_alt   text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (char_length(name) between 1 and 120),
  description       text not null default '',
  details           text[] not null default '{}',
  materials         text,
  care              text,
  fit               text,
  price_cents       int not null check (price_cents >= 0),
  compare_at_cents  int check (compare_at_cents is null or compare_at_cents > price_cents),
  category_id       uuid references public.categories (id) on delete set null,
  status            text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  is_featured       boolean not null default false,
  is_new            boolean not null default false,
  popularity        int not null default 0,
  search            tsvector generated always as (
                      setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
                      setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
                      setweight(to_tsvector('simple', coalesce(materials, '')), 'C')
                    ) stored,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index products_status_idx on public.products (status);
create index products_category_idx on public.products (category_id);
create index products_featured_idx on public.products (is_featured) where is_featured;
create index products_published_idx on public.products (published_at desc);
create index products_popularity_idx on public.products (popularity desc);
create index products_search_idx on public.products using gin (search);
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_collections (
  product_id    uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order    int not null default 0,
  primary key (product_id, collection_id)
);
create index product_collections_collection_idx on public.product_collections (collection_id);

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  color_name  text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.product_variants (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references public.products (id) on delete cascade,
  sku                   text not null unique,
  color_name            text not null,
  color_hex             text not null check (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  size                  text not null,
  size_sort             int not null default 0,
  price_override_cents  int check (price_override_cents is null or price_override_cents >= 0),
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  unique (product_id, color_name, size)
);
create index product_variants_product_idx on public.product_variants (product_id);
create index product_variants_size_idx on public.product_variants (size);
create index product_variants_color_idx on public.product_variants (lower(color_name));

-- Inventory is kept separate from variants so stock movements can be locked
-- and audited independently of catalog edits.
create table public.inventory (
  variant_id  uuid primary key references public.product_variants (id) on delete cascade,
  quantity    int not null default 0 check (quantity >= 0),
  updated_at  timestamptz not null default now()
);
create trigger inventory_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

create table public.inventory_movements (
  id          bigint generated always as identity primary key,
  variant_id  uuid not null references public.product_variants (id) on delete cascade,
  delta       int not null,
  reason      text not null check (reason in ('reserve', 'release', 'adjust', 'restock')),
  order_id    uuid,
  created_at  timestamptz not null default now()
);
create index inventory_movements_variant_idx on public.inventory_movements (variant_id, created_at desc);

-- Every variant gets an inventory row.
create or replace function public.ensure_inventory_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inventory (variant_id, quantity) values (new.id, 0)
  on conflict (variant_id) do nothing;
  return new;
end;
$$;
create trigger product_variants_inventory after insert on public.product_variants
  for each row execute function public.ensure_inventory_row();

-- -----------------------------------------------------------------------------
-- Customers
-- -----------------------------------------------------------------------------
create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  label        text check (char_length(label) <= 40),
  full_name    text not null check (char_length(full_name) between 1 and 120),
  line1        text not null check (char_length(line1) between 1 and 200),
  line2        text check (char_length(line2) <= 200),
  city         text not null check (char_length(city) between 1 and 100),
  postal_code  text not null check (char_length(postal_code) between 1 and 20),
  region       text check (char_length(region) <= 100),
  country      text not null check (country ~ '^[A-Z]{2}$'),
  phone        text check (char_length(phone) <= 40),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
create unique index addresses_one_default_idx on public.addresses (user_id) where is_default;

create table public.wishlist_items (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.cart_items (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  variant_id  uuid not null references public.product_variants (id) on delete cascade,
  quantity    int not null check (quantity between 1 and 99),
  updated_at  timestamptz not null default now(),
  primary key (user_id, variant_id)
);

-- -----------------------------------------------------------------------------
-- Discounts
-- -----------------------------------------------------------------------------
create table public.discount_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                extensions.citext not null unique check (code ~ '^[A-Za-z0-9_-]{3,32}$'),
  description         text,
  kind                text not null check (kind in ('percentage', 'fixed')),
  value               int not null check (value > 0),
  min_subtotal_cents  int not null default 0 check (min_subtotal_cents >= 0),
  max_redemptions     int check (max_redemptions is null or max_redemptions > 0),
  redemption_count    int not null default 0 check (redemption_count >= 0),
  starts_at           timestamptz,
  ends_at             timestamptz,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  check (kind <> 'percentage' or value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- -----------------------------------------------------------------------------
-- Orders
-- -----------------------------------------------------------------------------
create sequence public.order_number_seq start 100001;

create table public.orders (
  id                          uuid primary key default gen_random_uuid(),
  order_number                bigint not null unique default nextval('public.order_number_seq'),
  user_id                     uuid references public.profiles (id) on delete set null,
  email                       text,
  customer_name               text,
  status                      text not null default 'pending'
                                check (status in ('pending', 'paid', 'cancelled', 'expired', 'refunded')),
  payment_status              text not null default 'unpaid'
                                check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  fulfillment_status          text not null default 'unfulfilled'
                                check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency                    text not null default 'eur',
  subtotal_cents              int not null check (subtotal_cents >= 0),
  discount_cents              int not null default 0 check (discount_cents >= 0),
  shipping_cents              int not null default 0 check (shipping_cents >= 0),
  tax_cents                   int not null default 0 check (tax_cents >= 0),
  total_cents                 int not null check (total_cents >= 0),
  discount_code_id            uuid references public.discount_codes (id) on delete set null,
  discount_code               text,
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text,
  shipping_address            jsonb,
  billing_address             jsonb,
  tracking_number             text,
  tracking_carrier            text,
  notes                       text,
  reservation_expires_at      timestamptz,
  paid_at                     timestamptz,
  shipped_at                  timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create index orders_email_idx on public.orders (lower(email));
create index orders_pending_expiry_idx on public.orders (reservation_expires_at) where status = 'pending';
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  variant_id        uuid references public.product_variants (id) on delete set null,
  product_name      text not null,
  product_slug      text,
  sku               text not null,
  color_name        text not null,
  size              text not null,
  image_url         text,
  unit_price_cents  int not null check (unit_price_cents >= 0),
  quantity          int not null check (quantity > 0),
  line_total_cents  int not null check (line_total_cents >= 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Processed Stripe events, for webhook idempotency.
create table public.stripe_events (
  id            text primary key,
  type          text not null,
  processed_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Newsletter
-- -----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       extensions.citext not null unique check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      text not null default 'site' check (char_length(source) <= 40),
  created_at  timestamptz not null default now()
);
