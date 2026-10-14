import { mockCreateUser, mockDb } from "@/lib/db/mock";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";

/** A fresh mock user that has received the welcome bonus. */
export async function createUser(email = `u${Math.random()}@example.com`) {
  const u = await mockCreateUser(email, "h");
  await mockDb.applyCredit({ userId: u.id, delta: SIGNUP_BONUS_CREDITS, reason: "signup_bonus" });
  return u;
}
