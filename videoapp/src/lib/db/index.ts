import "server-only";
import { isMockBackend } from "@/lib/env";
import { mockDb } from "./mock";
import { supabaseDb } from "./supabase";
import type { Db } from "./types";

export * from "./types";

export function db(): Db {
  return isMockBackend() ? mockDb : supabaseDb;
}
