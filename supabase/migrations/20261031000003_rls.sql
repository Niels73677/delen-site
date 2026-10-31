-- =============================================================================
-- ATELIER — Row Level Security
-- Principle: public can read the active catalog; customers can read/write only
-- their own rows; admins manage everything; order/payment mutations happen only
-- through SECURITY DEFINER functions executed by the server (service role).
-- =============================================================================

alter table public.profiles               enable row level security;
alter table public.categories             enable row level security;
alter table public.collections            enable row level security;
alter table public.products               enable row level security;
alter table public.product_collections    enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.inventory              enable row level security;
alter table public.inventory_movements    enable row level security;
alter table public.addresses              enable row level security;
alter table public.wishlist_items         enable row level security;
alter table public.cart_items             enable row level security;
alter table public.discount_codes         enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.stripe_events          enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles --------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Catalog: public read --------------------------------------------------------
create policy "categories: public read" on public.categories
  for select to anon, authenticated using (true);
create policy "categories: admin write" on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "collections: public read" on public.collections
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "collections: admin write" on public.collections
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "products: public read active" on public.products
  for select to anon, authenticated using (status = 'active' or (select public.is_admin()));
create policy "products: admin write" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_collections: public read" on public.product_collections
  for select to anon, authenticated using (true);
create policy "product_collections: admin write" on public.product_collections
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_images: public read" on public.product_images
  for select to anon, authenticated using (true);
create policy "product_images: admin write" on public.product_images
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "product_variants: public read" on public.product_variants
  for select to anon, authenticated using (true);
create policy "product_variants: admin write" on public.product_variants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Stock levels are public (needed for availability) but only admins change them.
create policy "inventory: public read" on public.inventory
  for select to anon, authenticated using (true);
create policy "inventory: admin update" on public.inventory
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "inventory_movements: admin read" on public.inventory_movements
  for select to authenticated using ((select public.is_admin()));

-- Customer data ---------------------------------------------------------------
create policy "addresses: own" on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "addresses: admin read" on public.addresses
  for select to authenticated using ((select public.is_admin()));

create policy "wishlist: own" on public.wishlist_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "cart: own" on public.cart_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Orders: customers read their own; only admins update (fulfilment, tracking).
-- Inserts happen exclusively through create_pending_order().
create policy "orders: read own" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders: admin update" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "order_items: read own" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- Discounts: admin only. Customers validate codes through the server.
create policy "discount_codes: admin" on public.discount_codes
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Newsletter: anyone may subscribe; nobody but admins may read the list.
create policy "newsletter: subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy "newsletter: admin read" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));

-- stripe_events: no policies => service role only.

-- Customers may only edit safe profile columns.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
-- Roles are changed only by the service role (see scripts/create-admin.mjs);
-- protect_profile_role() is an additional guard.

-- -----------------------------------------------------------------------------
-- Storage: public product image bucket, admin-only writes.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product images: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
