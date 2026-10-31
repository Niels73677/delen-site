import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { asRole, connect, hasDatabase } from "./supabase-local";

/** Verifies Row Level Security: customers only see their own data; only admins manage the store. */
describe.skipIf(!hasDatabase)("row level security", () => {
  let db: Client;
  const alice = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const bob = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const admin = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  let aliceOrder: string;

  beforeAll(async () => {
    db = await connect();
    for (const [id, email] of [
      [alice, "alice@rls.test"],
      [bob, "bob@rls.test"],
      [admin, "admin@rls.test"],
    ]) {
      await db.query(
        `insert into auth.users (id, email, instance_id, aud, role, raw_user_meta_data) values ($1, $2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '{}')
         on conflict (id) do nothing`,
        [id, email],
      );
    }
    await db.query("update profiles set role = 'admin' where id = $1", [admin]);
    aliceOrder = (
      await db.query(
        "insert into orders (user_id, email, subtotal_cents, total_cents, status, payment_status) values ($1, 'alice@rls.test', 1000, 1000, 'paid', 'paid') returning id",
        [alice],
      )
    ).rows[0].id;
    await db.query("insert into addresses (user_id, full_name, line1, city, postal_code, country) values ($1, 'Alice', 'Street 1', 'Utrecht', '3511', 'NL')", [alice]);
  });

  afterAll(async () => {
    await db.query("delete from auth.users where id = any($1)", [[alice, bob, admin]]);
    await db.end();
  });

  it("customers can read their own orders but not others'", async () => {
    const own = await asRole(db, "authenticated", alice, () => db.query("select id from orders where id = $1", [aliceOrder]));
    const other = await asRole(db, "authenticated", bob, () => db.query("select id from orders where id = $1", [aliceOrder]));
    expect(own.rowCount).toBe(1);
    expect(other.rowCount).toBe(0);
  });

  it("customers cannot read other customers' addresses or profiles", async () => {
    const r = await asRole(db, "authenticated", bob, async () => ({
      addresses: (await db.query("select * from addresses where user_id = $1", [alice])).rowCount,
      profiles: (await db.query("select * from profiles where id = $1", [alice])).rowCount,
    }));
    expect(r).toEqual({ addresses: 0, profiles: 0 });
  });

  it("customers cannot promote themselves to admin", async () => {
    await expect(asRole(db, "authenticated", alice, () => db.query("update profiles set role = 'admin' where id = $1", [alice]))).rejects.toThrow();
  });

  it("customers cannot modify orders, inventory or products", async () => {
    const r = await asRole(db, "authenticated", alice, async () => ({
      orders: (await db.query("update orders set total_cents = 1 where id = $1", [aliceOrder])).rowCount,
      inventory: (await db.query("update inventory set quantity = 999")).rowCount,
      products: (await db.query("update products set price_cents = 1")).rowCount,
    }));
    expect(r).toEqual({ orders: 0, inventory: 0, products: 0 });
  });

  it("anonymous visitors can browse the active catalog but not drafts or discount codes", async () => {
    await db.query("insert into products (slug, name, price_cents, status) values ('rls-draft', 'Draft', 100, 'draft') on conflict do nothing");
    try {
      const r = await asRole(db, "anon", null, async () => ({
        active: (await db.query("select 1 from products where status = 'active'")).rowCount,
        drafts: (await db.query("select 1 from products where slug = 'rls-draft'")).rowCount,
        discounts: (await db.query("select 1 from discount_codes")).rowCount,
        subscribers: (await db.query("select 1 from newsletter_subscribers")).rowCount,
      }));
      expect(r.active).toBeGreaterThan(0);
      expect(r).toMatchObject({ drafts: 0, discounts: 0, subscribers: 0 });
    } finally {
      await db.query("delete from products where slug = 'rls-draft'");
    }
  });

  it("anyone can subscribe to the newsletter", async () => {
    const r = await asRole(db, "anon", null, () => db.query("insert into newsletter_subscribers (email) values ('rls-news@example.com')"));
    expect(r.rowCount).toBe(1);
  });

  it("admins can manage the catalog and read all orders", async () => {
    const r = await asRole(db, "authenticated", admin, async () => ({
      orders: (await db.query("select 1 from orders where id = $1", [aliceOrder])).rowCount,
      update: (await db.query("update inventory set quantity = quantity where variant_id in (select id from product_variants limit 1)")).rowCount,
      discounts: (await db.query("select 1 from discount_codes")).rowCount,
    }));
    expect(r.orders).toBe(1);
    expect(r.update).toBe(1);
    expect(r.discounts).toBeGreaterThan(0);
  });
});
