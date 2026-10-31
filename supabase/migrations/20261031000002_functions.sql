-- =============================================================================
-- ATELIER — catalog views, commerce functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Product card view: everything a product grid needs in one row.
-- security_invoker => the caller's RLS policies apply.
-- -----------------------------------------------------------------------------
create or replace view public.product_cards
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.price_cents,
  p.compare_at_cents,
  p.is_new,
  p.is_featured,
  p.popularity,
  p.status,
  p.published_at,
  p.created_at,
  p.category_id,
  c.slug as category_slug,
  c.name as category_name,
  coalesce(stock.total_stock, 0)::int as total_stock,
  coalesce(imgs.images, '[]'::jsonb) as images,
  coalesce(colors.colors, '[]'::jsonb) as colors,
  coalesce(sizes.sizes, '{}'::text[]) as sizes
from public.products p
left join public.categories c on c.id = p.category_id
left join lateral (
  select sum(i.quantity) as total_stock
  from public.product_variants v
  join public.inventory i on i.variant_id = v.id
  where v.product_id = p.id and v.is_active
) stock on true
left join lateral (
  select jsonb_agg(jsonb_build_object('url', pi.url, 'alt', pi.alt) order by pi.sort_order) as images
  from (select * from public.product_images where product_id = p.id order by sort_order limit 2) pi
) imgs on true
left join lateral (
  select jsonb_agg(jsonb_build_object('name', x.color_name, 'hex', x.color_hex)
                   order by x.image_order nulls last, x.color_name) as colors
  from (
    select v.color_name, min(v.color_hex) as color_hex,
           (select min(pi.sort_order) from public.product_images pi
             where pi.product_id = p.id and pi.color_name = v.color_name) as image_order
    from public.product_variants v
    where v.product_id = p.id and v.is_active
    group by v.color_name
  ) x
) colors on true
left join lateral (
  select array_agg(s.size order by s.size_sort) as sizes
  from (
    select v.size, min(v.size_sort) as size_sort
    from public.product_variants v
    where v.product_id = p.id and v.is_active
    group by v.size
  ) s
) sizes on true;

-- -----------------------------------------------------------------------------
-- Catalog search with filters, sorting and pagination.
-- Returns product cards plus the total count of matches (window function).
-- -----------------------------------------------------------------------------
create or replace function public.search_products(
  p_query        text default null,
  p_category     text default null,
  p_collection   text default null,
  p_sizes        text[] default null,
  p_colors       text[] default null,
  p_min_price    int default null,
  p_max_price    int default null,
  p_in_stock     boolean default false,
  p_sort         text default 'featured',
  p_limit        int default 12,
  p_offset       int default 0
)
returns table (
  id uuid, slug text, name text, price_cents int, compare_at_cents int,
  is_new boolean, total_stock int, images jsonb, colors jsonb, sizes text[],
  category_slug text, total_count bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with q as (
    select nullif(trim(p_query), '') as term
  ),
  matches as (
    select pc.*,
      case when (select term from q) is null then 0
           else ts_rank(p.search, websearch_to_tsquery('simple', (select term from q)))
                + similarity(p.name, (select term from q)) end as rank
    from public.product_cards pc
    join public.products p on p.id = pc.id
    where pc.status = 'active'
      and (
        (select term from q) is null
        or p.search @@ websearch_to_tsquery('simple', (select term from q))
        or p.name ilike '%' || (select term from q) || '%'
        or similarity(p.name, (select term from q)) > 0.25
      )
      and (p_category is null or pc.category_slug = p_category)
      and (p_collection is null or exists (
        select 1 from public.product_collections pcol
        join public.collections col on col.id = pcol.collection_id
        where pcol.product_id = pc.id and col.slug = p_collection
      ))
      and (p_min_price is null or pc.price_cents >= p_min_price)
      and (p_max_price is null or pc.price_cents <= p_max_price)
      and (
        (p_sizes is null or cardinality(p_sizes) = 0)
        and (p_colors is null or cardinality(p_colors) = 0)
        and (not p_in_stock or pc.total_stock > 0)
        or exists (
          select 1
          from public.product_variants v
          join public.inventory i on i.variant_id = v.id
          where v.product_id = pc.id
            and v.is_active
            and (p_sizes is null or cardinality(p_sizes) = 0 or v.size = any (p_sizes))
            and (p_colors is null or cardinality(p_colors) = 0 or lower(v.color_name) = any (
              select lower(c) from unnest(p_colors) c))
            and (not p_in_stock or i.quantity > 0)
        )
      )
  )
  select m.id, m.slug, m.name, m.price_cents, m.compare_at_cents, m.is_new, m.total_stock,
         m.images, m.colors, m.sizes, m.category_slug, count(*) over () as total_count
  from matches m
  order by
    case when p_sort = 'price-asc' then m.price_cents end asc,
    case when p_sort = 'price-desc' then m.price_cents end desc,
    case when p_sort = 'newest' then coalesce(m.published_at, m.created_at) end desc,
    case when p_sort = 'popular' then m.popularity end desc,
    case when p_sort = 'featured' then m.rank end desc,
    case when p_sort = 'featured' then m.is_featured::int end desc,
    case when p_sort = 'featured' then m.popularity end desc,
    m.name asc
  limit greatest(1, least(p_limit, 48))
  offset greatest(0, p_offset);
$$;

-- Facet values for filters (only for active products).
create or replace function public.catalog_facets()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'sizes', coalesce((
      select jsonb_agg(size order by size_sort) from (
        select v.size, min(v.size_sort) as size_sort
        from public.product_variants v join public.products p on p.id = v.product_id
        where p.status = 'active' and v.is_active group by v.size
      ) s), '[]'::jsonb),
    'colors', coalesce((
      select jsonb_agg(jsonb_build_object('name', color_name, 'hex', color_hex) order by color_name) from (
        select initcap(lower(v.color_name)) as color_name, min(v.color_hex) as color_hex
        from public.product_variants v join public.products p on p.id = v.product_id
        where p.status = 'active' and v.is_active group by initcap(lower(v.color_name))
      ) c), '[]'::jsonb),
    'price', (
      select jsonb_build_object('min', coalesce(min(price_cents), 0), 'max', coalesce(max(price_cents), 0))
      from public.products where status = 'active')
  );
$$;

-- -----------------------------------------------------------------------------
-- Inventory movement log. Every change to inventory.quantity is recorded with
-- the reason set by the calling transaction (defaults to a manual adjustment).
-- -----------------------------------------------------------------------------
create or replace function public.log_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.quantity is distinct from old.quantity then
    insert into public.inventory_movements (variant_id, delta, reason, order_id)
    values (
      new.variant_id,
      new.quantity - old.quantity,
      coalesce(nullif(current_setting('atelier.inventory_reason', true), ''), 'adjust'),
      nullif(current_setting('atelier.inventory_order', true), '')::uuid
    );
  end if;
  return new;
end;
$$;
create trigger inventory_log_movement after update of quantity on public.inventory
  for each row execute function public.log_inventory_movement();

-- -----------------------------------------------------------------------------
-- Checkout: reserve inventory and create a pending order atomically.
--
-- p_items: [{ "variant_id": uuid, "quantity": int }]
-- Prices are read from the database here — never from the client. The caller
-- passes the totals it computed (from the same DB prices) and the function
-- refuses to continue if they disagree, which also catches price changes
-- between the read and the reservation.
--
-- Rows are locked in a stable order (variant id) to avoid deadlocks between
-- concurrent checkouts; the CHECK (quantity >= 0) constraint is the final
-- guard against overselling.
-- -----------------------------------------------------------------------------
create or replace function public.create_pending_order(
  p_user_id          uuid,
  p_email            text,
  p_items            jsonb,
  p_subtotal_cents   int,
  p_discount_cents   int,
  p_shipping_cents   int,
  p_total_cents      int,
  p_discount_code_id uuid,
  p_expires_at       timestamptz
)
returns table (order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id     uuid;
  v_order_number bigint;
  v_subtotal     int := 0;
  r              record;
  v_code         public.discount_codes%rowtype;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;

  if p_total_cents <> p_subtotal_cents - p_discount_cents + p_shipping_cents then
    raise exception 'TOTAL_MISMATCH' using errcode = 'P0001';
  end if;

  -- Lock the discount code (if any) and reserve a redemption.
  if p_discount_code_id is not null then
    select * into v_code from public.discount_codes where id = p_discount_code_id for update;
    if not found or not v_code.is_active
       or (v_code.starts_at is not null and v_code.starts_at > now())
       or (v_code.ends_at is not null and v_code.ends_at <= now())
       or (v_code.max_redemptions is not null and v_code.redemption_count >= v_code.max_redemptions) then
      raise exception 'DISCOUNT_INVALID' using errcode = 'P0001';
    end if;
    update public.discount_codes set redemption_count = redemption_count + 1 where id = v_code.id;
  end if;

  insert into public.orders (
    user_id, email, status, payment_status, subtotal_cents, discount_cents, shipping_cents,
    total_cents, discount_code_id, discount_code, reservation_expires_at
  ) values (
    p_user_id, p_email, 'pending', 'unpaid', p_subtotal_cents, p_discount_cents, p_shipping_cents,
    p_total_cents, p_discount_code_id, v_code.code, p_expires_at
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  perform set_config('atelier.inventory_reason', 'reserve', true);
  perform set_config('atelier.inventory_order', v_order_id::text, true);

  for r in
    select
      v.id as variant_id, v.sku, v.color_name, v.size, v.is_active,
      p.id as product_id, p.name, p.slug, p.status,
      coalesce(v.price_override_cents, p.price_cents) as unit_price,
      req.quantity,
      inv.quantity as on_hand,
      (select pi.url from public.product_images pi
        where pi.product_id = p.id
        order by (pi.color_name is not distinct from v.color_name) desc, pi.sort_order
        limit 1) as image_url
    from (
      select (e ->> 'variant_id')::uuid as variant_id, sum((e ->> 'quantity')::int)::int as quantity
      from jsonb_array_elements(p_items) e
      group by 1
    ) req
    join public.product_variants v on v.id = req.variant_id
    join public.products p on p.id = v.product_id
    join public.inventory inv on inv.variant_id = v.id
    order by v.id
    for update of inv
  loop
    if r.status <> 'active' or not r.is_active then
      raise exception 'VARIANT_UNAVAILABLE:%', r.variant_id using errcode = 'P0001';
    end if;
    if r.quantity < 1 then
      raise exception 'INVALID_QUANTITY:%', r.variant_id using errcode = 'P0001';
    end if;
    if r.on_hand < r.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', r.variant_id using errcode = 'P0001';
    end if;

    update public.inventory set quantity = quantity - r.quantity where variant_id = r.variant_id;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, product_slug, sku, color_name, size,
      image_url, unit_price_cents, quantity, line_total_cents
    ) values (
      v_order_id, r.product_id, r.variant_id, r.name, r.slug, r.sku, r.color_name, r.size,
      r.image_url, r.unit_price, r.quantity, r.unit_price * r.quantity
    );
    v_subtotal := v_subtotal + r.unit_price * r.quantity;
  end loop;

  if (select count(*) from public.order_items oi where oi.order_id = v_order_id)
     <> (select count(distinct e ->> 'variant_id') from jsonb_array_elements(p_items) e) then
    raise exception 'VARIANT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_subtotal <> p_subtotal_cents then
    raise exception 'PRICE_CHANGED' using errcode = 'P0001';
  end if;

  order_id := v_order_id;
  order_number := v_order_number;
  return next;
end;
$$;

create or replace function public.attach_checkout_session(p_order_id uuid, p_session_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders set stripe_checkout_session_id = p_session_id
  where id = p_order_id and status = 'pending';
$$;

-- Return reserved stock for a pending order (cancelled checkout, expired session,
-- failed payment). Idempotent: only acts on orders that are still pending.
create or replace function public.release_order(p_order_id uuid, p_status text default 'expired')
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_status not in ('cancelled', 'expired') then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending' then
    return false;
  end if;

  perform set_config('atelier.inventory_reason', 'release', true);
  perform set_config('atelier.inventory_order', p_order_id::text, true);

  update public.inventory inv
  set quantity = inv.quantity + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id and oi.variant_id = inv.variant_id;

  if v_order.discount_code_id is not null then
    update public.discount_codes
    set redemption_count = greatest(redemption_count - 1, 0)
    where id = v_order.discount_code_id;
  end if;

  update public.orders
  set status = p_status,
      payment_status = case when p_status = 'cancelled' then 'unpaid' else payment_status end,
      fulfillment_status = 'cancelled'
  where id = p_order_id;

  return true;
end;
$$;

-- Mark an order paid. Called only from the verified Stripe webhook.
-- Idempotent: repeated deliveries of the same event are no-ops.
create or replace function public.mark_order_paid(
  p_session_id        text,
  p_payment_intent_id text,
  p_amount_total      int,
  p_email             text,
  p_customer_name     text,
  p_shipping_address  jsonb,
  p_billing_address   jsonb,
  p_shipping_cents    int default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
  where stripe_checkout_session_id = p_session_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_order.status = 'paid' then
    return v_order.id;
  end if;

  if v_order.status <> 'pending' then
    -- Payment arrived for an order whose reservation was already released.
    -- Flag it for manual review instead of silently overselling.
    update public.orders
    set payment_status = 'paid',
        stripe_payment_intent_id = p_payment_intent_id,
        notes = coalesce(notes || E'\n', '') || 'Payment received after reservation was released — review stock manually.'
    where id = v_order.id;
    return v_order.id;
  end if;

  update public.orders
  set status = 'paid',
      payment_status = 'paid',
      fulfillment_status = 'unfulfilled',
      paid_at = now(),
      stripe_payment_intent_id = p_payment_intent_id,
      email = coalesce(p_email, email),
      customer_name = coalesce(p_customer_name, customer_name),
      shipping_address = p_shipping_address,
      billing_address = p_billing_address,
      shipping_cents = coalesce(p_shipping_cents, shipping_cents),
      total_cents = coalesce(p_amount_total, total_cents),
      reservation_expires_at = null
  where id = v_order.id;

  update public.products p
  set popularity = p.popularity + oi.qty
  from (
    select product_id, sum(quantity)::int as qty
    from public.order_items where order_id = v_order.id group by product_id
  ) oi
  where p.id = oi.product_id;

  -- A purchased item no longer belongs in the saved cart.
  if v_order.user_id is not null then
    delete from public.cart_items c
    using public.order_items oi
    where oi.order_id = v_order.id and c.user_id = v_order.user_id and c.variant_id = oi.variant_id;
  end if;

  return v_order.id;
end;
$$;

-- Safety net for sessions whose expiry webhook never arrived.
create or replace function public.release_expired_orders()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select id from public.orders
    where status = 'pending' and reservation_expires_at < now() - interval '15 minutes'
  loop
    if public.release_order(r.id, 'expired') then
      n := n + 1;
    end if;
  end loop;
  return n;
end;
$$;

-- Only the server (service role) may run commerce functions.
revoke execute on function public.create_pending_order(uuid, text, jsonb, int, int, int, int, uuid, timestamptz) from public, anon, authenticated;
revoke execute on function public.attach_checkout_session(uuid, text) from public, anon, authenticated;
revoke execute on function public.release_order(uuid, text) from public, anon, authenticated;
revoke execute on function public.mark_order_paid(text, text, int, text, text, jsonb, jsonb, int) from public, anon, authenticated;
revoke execute on function public.release_expired_orders() from public, anon, authenticated;
grant execute on function public.create_pending_order(uuid, text, jsonb, int, int, int, int, uuid, timestamptz) to service_role;
grant execute on function public.attach_checkout_session(uuid, text) to service_role;
grant execute on function public.release_order(uuid, text) to service_role;
grant execute on function public.mark_order_paid(text, text, int, text, text, jsonb, jsonb, int) to service_role;
grant execute on function public.release_expired_orders() to service_role;

-- -----------------------------------------------------------------------------
-- Admin analytics
-- -----------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return (
    select jsonb_build_object(
      'revenue_cents', coalesce(sum(total_cents) filter (where payment_status = 'paid' and status <> 'refunded'), 0),
      'orders', count(*) filter (where payment_status = 'paid'),
      'customers', (select count(*) from public.profiles where role = 'customer'),
      'average_order_cents', coalesce(round(avg(total_cents) filter (where payment_status = 'paid' and status <> 'refunded')), 0),
      'pending_fulfillment', count(*) filter (where status = 'paid' and fulfillment_status in ('unfulfilled', 'processing')),
      'revenue_30d_cents', coalesce(sum(total_cents) filter (where payment_status = 'paid' and status <> 'refunded' and paid_at > now() - interval '30 days'), 0)
    )
    from public.orders
  );
end;
$$;

create or replace function public.admin_best_sellers(p_limit int default 5)
returns table (product_id uuid, name text, slug text, units bigint, revenue_cents bigint, image_url text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
    select oi.product_id, max(oi.product_name), max(oi.product_slug),
           sum(oi.quantity)::bigint, sum(oi.line_total_cents)::bigint, max(oi.image_url)
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.payment_status = 'paid' and o.status <> 'refunded'
    group by oi.product_id
    order by sum(oi.quantity) desc
    limit p_limit;
end;
$$;
