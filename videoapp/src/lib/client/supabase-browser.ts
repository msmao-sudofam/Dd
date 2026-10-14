"use client";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Null in mock mode (no Supabase keys). */
export function supabaseBrowser() {
  if (!url || !key) return null;
  client ??= createBrowserClient(url, key);
  return client;
}
