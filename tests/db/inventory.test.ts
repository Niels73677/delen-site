import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { connect, hasDatabase } from "./supabase-local";

/**
 * Exercises the real Postgres functions that guard inventory and orders:
 * create_pending_order, mark_order_paid, release_order.
 */
describe.skipIf(!hasDatabase)("inventory & order functions (Postgres)", () => {
  let db: Client;
  let variantId: string;
  let price: number;

  const stock = async () => (await db.query("select quantity from inventory where variant_id = $1", [variantId])).rows[0].quantity as number;
  const setStock = (q: number) => db.query("update inventory set quantity = $2 where variant_id = $1", [variantId, q]);

  const reserve = (quantity: number, opts: { subtotal?: number; discountCodeId?: string | null; discount?: number } = {}) => {
    const subtotal = opts.subtotal ?? price * quantity;
    const discount = opts.discount ?? 0;
    return db.query(
      `select * from create_pending_order(null, 'test@example.com', $1::jsonb, $2, $3, 0, $4, $5, now() + interval '31 minutes')`,
      [JSON.stringify([{ variant_id: variantId, quantity }]), subtotal, discount, subtotal - discount, opts.discountCodeId ?? null],
    );
  };

  beforeAll(async () => {
    db = await connect();
    const { rows } = await db.query(
      `select v.id, p.price_cents from product_variants v join products p on p.id = v.product_id
       where v.sku = 'AT-EHT-WHI-M'`,
    );
    variantId = rows[0].id;
    price = rows[0].price_cents;
  });

  afterAll(async () => {
    await db.query("delete from orders where email = 'test@example.com'");
    await db.end();
  });

  beforeEach(async () => {
    await db.query("delete from orders where email = 'test@example.com'");
    await setStock(5);
  });

  it("reserves stock and creates a pending order with DB prices", async () => {
    const { rows } = await reserve(2);
    expect(await stock()).toBe(3);
    const order = (await db.query("select status, subtotal_cents from orders where id = $1", [rows[0].order_id])).rows[0];
    expect(order).toEqual({ status: "pending", subtotal_cents: price * 2 });
    const items = (await db.query("select unit_price_cents, quantity from order_items where order_id = $1", [rows[0].order_id])).rows;
    expect(items).toEqual([{ unit_price_cents: price, quantity: 2 }]);
  });

  it("refuses to oversell", async () => {
    await expect(reserve(6)).rejects.toThrow(/INSUFFICIENT_STOCK/);
    expect(await stock()).toBe(5);
  });

  it("prevents overselling under concurrent checkouts", async () => {
    await setStock(3);
    const clients = await Promise.all(Array.from({ length: 6 }, () => connect()));
    const results = await Promise.allSettled(
      clients.map((c) =>
        c.query(
          `select * from create_pending_order(null, 'test@example.com', $1::jsonb, $2, 0, 0, $2, null, now() + interval '31 minutes')`,
          [JSON.stringify([{ variant_id: variantId, quantity: 1 }]), price],
        ),
      ),
    );
    await Promise.all(clients.map((c) => c.end()));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(3);
    expect(await stock()).toBe(0);
  });

  it("rejects totals that do not match database prices", async () => {
    await expect(reserve(1, { subtotal: 1 })).rejects.toThrow(/PRICE_CHANGED/);
    expect(await stock()).toBe(5);
  });

  it("marks an order paid exactly once (idempotent webhook)", async () => {
    const { rows } = await reserve(1);
    const orderId = rows[0].order_id;
    await db.query("select attach_checkout_session($1, 'cs_test_db')", [orderId]);
    const popularity = async () =>
      (await db.query("select p.popularity from products p join product_variants v on v.product_id = p.id where v.id = $1", [variantId])).rows[0]
        .popularity as number;
    const before = await popularity();
    for (let i = 0; i < 3; i++) {
      await db.query("select mark_order_paid('cs_test_db', 'pi_1', $1, 'a@b.co', 'Ann', null, null, 0)", [price]);
    }
    const order = (await db.query("select status, payment_status, paid_at from orders where id = $1", [orderId])).rows[0];
    expect(order.status).toBe("paid");
    expect(order.payment_status).toBe("paid");
    expect(await popularity()).toBe(before + 1);
    expect(await stock()).toBe(4);
    // A paid order can no longer be released.
    expect((await db.query("select release_order($1, 'expired') as r", [orderId])).rows[0].r).toBe(false);
    expect(await stock()).toBe(4);
  });

  it("returns stock when a checkout expires, only once", async () => {
    const { rows } = await reserve(2);
    expect(await stock()).toBe(3);
    expect((await db.query("select release_order($1, 'expired') as r", [rows[0].order_id])).rows[0].r).toBe(true);
    expect((await db.query("select release_order($1, 'expired') as r", [rows[0].order_id])).rows[0].r).toBe(false);
    expect(await stock()).toBe(5);
    const moves = (await db.query("select reason, delta from inventory_movements where order_id = $1 order by id", [rows[0].order_id])).rows;
    expect(moves).toEqual([
      { reason: "reserve", delta: -2 },
      { reason: "release", delta: 2 },
    ]);
  });

  it("reserves and releases discount redemptions with the order", async () => {
    const code = (await db.query("insert into discount_codes (code, kind, value, max_redemptions) values ('ONEUSE', 'fixed', 500, 1) returning id")).rows[0].id;
    try {
      const { rows } = await reserve(1, { discountCodeId: code, discount: 500 });
      await expect(reserve(1, { discountCodeId: code, discount: 500 })).rejects.toThrow(/DISCOUNT_INVALID/);
      await db.query("select release_order($1, 'cancelled')", [rows[0].order_id]);
      await expect(reserve(1, { discountCodeId: code, discount: 500 })).resolves.toBeTruthy();
    } finally {
      await db.query("delete from orders where discount_code_id = $1", [code]);
      await db.query("delete from discount_codes where id = $1", [code]);
    }
  });

  it("is not callable by anonymous or signed-in users", async () => {
    await db.query("begin");
    try {
      await db.query("set local role anon");
      await expect(reserve(1)).rejects.toThrow(/permission denied/);
    } finally {
      await db.query("rollback");
    }
  });
});
