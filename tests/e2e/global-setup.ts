import { Client } from "pg";

/** Returns stock held by checkouts that earlier test runs left pending. */
export default async function globalSetup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return;
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    await db.query("select release_order(id, 'cancelled') from orders where status = 'pending'");
  } finally {
    await db.end();
  }
}
