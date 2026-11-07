import { env } from "@/lib/env";

/** Sends via Resend when RESEND_API_KEY is set; otherwise logs (mock). Never throws. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.resendKey()) {
    console.info(`[email:mock] to=${to} subject="${subject}"`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.emailFrom(), to, subject, html }),
    });
    if (!res.ok) console.error("[email] resend failed", res.status, await res.text());
  } catch (e) {
    console.error("[email] resend error", (e as Error).message);
  }
}

export function videoReadyEmail(url: string) {
  return {
    subject: `Your ${env.brandName()} video is ready`,
    html: `<p>Your clip finished rendering.</p><p><a href="${env.appUrl()}/library">Open your library</a> or <a href="${url}">download it directly</a>.</p>`,
  };
}
