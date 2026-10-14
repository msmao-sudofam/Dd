import "server-only";
import { db } from "@/lib/db";

const PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 6);
const PER_DAY = Number(process.env.RATE_LIMIT_PER_DAY ?? 200);

/** Per-user generation rate limit. Returns an error message when limited. */
export async function checkRateLimit(userId: string): Promise<string | null> {
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  if ((await db().countJobsSince(userId, minuteAgo)) >= PER_MINUTE)
    return "You're going fast! Wait a minute before starting more generations.";
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  if ((await db().countJobsSince(userId, dayAgo)) >= PER_DAY) return "Daily generation limit reached.";
  return null;
}
