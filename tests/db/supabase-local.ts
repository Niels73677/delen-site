import { Client } from "pg";

/**
 * Database integration tests run against a local Supabase stack
 * (`npx supabase start` + `npx supabase db reset`). They are skipped when
 * TEST_DATABASE_URL is not set, so `npm test` works anywhere.
 */
export const DATABASE_URL = process.env.TEST_DATABASE_URL;
export const hasDatabase = Boolean(DATABASE_URL);

export async function connect() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  return client;
}

/** Run a block as a given Postgres role/JWT, like PostgREST would. Rolled back afterwards. */
export async function asRole<T>(client: Client, role: "anon" | "authenticated", userId: string | null, fn: () => Promise<T>) {
  await client.query("begin");
  try {
    await client.query(`select set_config('role', $1, true)`, [role]);
    await client.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(userId ? { sub: userId, role } : { role }),
    ]);
    return await fn();
  } finally {
    await client.query("rollback");
  }
}
