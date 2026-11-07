import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const ADMIN_URL = process.env.TEST_PG_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres";

export async function pgAvailable(): Promise<boolean> {
  const c = new Client({ connectionString: ADMIN_URL, connectionTimeoutMillis: 1500 });
  try {
    await c.connect();
    await c.end();
    return true;
  } catch {
    return false;
  }
}

/** Creates a throwaway database with the Supabase shim + every migration applied. */
export async function createMigratedDb(): Promise<{ client: Client; drop: () => Promise<void> }> {
  const name = `videoapp_test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`create database ${name}`);

  const url = new URL(ADMIN_URL);
  url.pathname = `/${name}`;
  const client = new Client({ connectionString: url.toString() });
  await client.connect();

  const root = path.resolve(__dirname, "../..");
  await client.query(readFileSync(path.join(root, "tests/sql/supabase-shim.sql"), "utf8"));
  const dir = path.join(root, "supabase/migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await client.query(readFileSync(path.join(dir, f), "utf8"));
  }
  const seed = path.join(root, "supabase/seed.sql");
  try {
    await client.query(readFileSync(seed, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }

  return {
    client,
    drop: async () => {
      await client.end();
      await admin.query(`drop database if exists ${name} with (force)`);
      await admin.end();
    },
  };
}

/** Run fn as an authenticated Supabase user (RLS applies). */
export async function asUser<T>(client: Client, userId: string, fn: () => Promise<T>): Promise<T> {
  await client.query("begin");
  try {
    await client.query("set local role authenticated");
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
    return await fn();
  } finally {
    await client.query("rollback");
  }
}
