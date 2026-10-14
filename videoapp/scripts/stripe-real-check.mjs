// Real Stripe, TEST MODE ONLY: runs subscribe, upgrade, switch-down, customer portal, cancel, a one-off pack and a
// test-clock renewal through real Stripe Checkout and real webhooks, against a local dev server on the file-backed
// mock DB (no Supabase, no providers). Refuses any key that is not a test key. Never prints key values.
//   node scripts/stripe-real-check.mjs            key from the Stripe CLI profile STRIPE_PROFILE (default "default")
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-real-check.mjs
// Needs the Stripe CLI (webhook forwarding). An unclaimed `stripe sandbox create` key cannot use test clocks, so the
// renewal step fails there; a normal sk_test_ key runs all of it.
import { spawn, spawnSync } from "node:child_process";
import { createWriteStream, mkdirSync, rmSync } from "node:fs";
import { chromium } from "@playwright/test";

const PROFILE = process.env.STRIPE_PROFILE ?? "default";
const PORT = 3210;
const BASE = `http://localhost:${PORT}`;
const OUT = ".data-test/stripe-real";
mkdirSync(OUT, { recursive: true });

const cli = (args) => ["--project-name", PROFILE, ...(process.env.STRIPE_SECRET_KEY ? ["--api-key", process.env.STRIPE_SECRET_KEY] : []), ...args];
const sh = (args) => spawnSync("stripe", cli(args), { encoding: "utf8", shell: true });
const KEY = process.env.STRIPE_SECRET_KEY || (/test_mode_api_key\s*=\s*'?"?([A-Za-z0-9_]+)/.exec(sh(["config", "--list"]).stdout) ?? [])[1];
if (!KEY || !/_test_/.test(KEY)) throw new Error("no Stripe TEST key (set STRIPE_SECRET_KEY=sk_test_... or STRIPE_PROFILE)");
const WHSEC = (/whsec_[A-Za-z0-9]+/.exec(sh(["listen", "--print-secret"]).stdout) ?? [])[0];
if (!WHSEC) throw new Error("could not get the webhook signing secret");
const scrub = (s) => String(s).replaceAll(KEY, "<key>").replaceAll(WHSEC, "<whsec>");
const log = (...a) => console.log(scrub(a.join(" ")));

async function api(method, path, params) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const json = await res.json();
  if (json.error) throw new Error(`Stripe ${method} ${path}: ${json.error.message}`);
  return json;
}

const kids = [];
function start(cmd, args, env, logName) {
  const child = spawn(cmd, args, { env, shell: true });
  const file = createWriteStream(`${OUT}/${logName}.log`);
  child.stdout.on("data", (d) => file.write(scrub(d)));
  child.stderr.on("data", (d) => file.write(scrub(d)));
  kids.push(child);
  return child;
}
const stopAll = () => kids.forEach((c) => c.pid && spawnSync("taskkill", ["/pid", String(c.pid), "/T", "/F"], { shell: true }));

rmSync(".data-test/stripe-real-db.json", { force: true });
start("stripe", cli(["listen", "--events", "checkout.session.completed,checkout.session.async_payment_succeeded,invoice.paid,customer.subscription.deleted", "--forward-to", `${BASE}/api/webhooks/stripe`]), process.env, "listen");
start("npx", ["next", "dev", "-p", String(PORT)], {
  ...process.env,
  MOCK_BACKEND: "true",
  MOCK_PROVIDERS: "true",
  MOCK_STRIPE: "",
  MOCK_DB_PATH: ".data-test/stripe-real-db.json",
  SESSION_SECRET: "stripe-real-secret",
  NEXT_PUBLIC_APP_URL: BASE,
  SIGNUP_MAX_PER_IP: "100000",
  STRIPE_SECRET_KEY: KEY,
  STRIPE_WEBHOOK_SECRET: WHSEC,
  FAL_KEY: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", RESEND_API_KEY: "", NEXT_PUBLIC_POSTHOG_KEY: "",
}, "next");

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok }); log(ok ? "PASS" : "FAIL", name, detail); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${BASE}/pricing`)).ok) break; } catch {}
    if (i > 90) throw new Error("dev server did not start");
    await sleep(2000);
  }
  log("server up");
  browser = await chromium.launch();

  const signUp = async (page, tag) => {
    const email = `stripe-${tag}-${Date.now()}@example.com`;
    await page.goto(`${BASE}/signup`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-1");
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    const me = await page.evaluate(async () => (await fetch("/api/me")).json());
    return { email, id: me.id };
  };
  const state = async (page) => {
    await page.goto(`${BASE}/billing`);
    return {
      balance: Number(await page.getByTestId("billing-balance").innerText()),
      plan: (await page.getByTestId("billing-plan").innerText()).trim(),
    };
  };
  const waitFor = async (page, want, label) => {
    let s;
    for (let i = 0; i < 30; i++) {
      s = await state(page);
      if (s.balance === want.balance && s.plan.toLowerCase() === want.plan.toLowerCase()) break;
      await sleep(2000);
    }
    check(label, s.balance === want.balance && s.plan.toLowerCase() === want.plan.toLowerCase(), `balance ${s.balance} (want ${want.balance}), plan ${s.plan} (want ${want.plan})`);
    return s;
  };
  const payCheckout = async (page, shot) => {
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60000 });
    const card = page.locator("#cardNumber");
    try {
      await card.waitFor({ timeout: 8000 });
    } catch {
      // Payment methods shown as an accordion: open the card one.
      await page.locator('[data-testid="card-accordion-item-button"]').dispatchEvent("click");
      await card.waitFor({ timeout: 20000 });
    }
    await card.fill("4242 4242 4242 4242");
    await page.locator("#cardExpiry").fill("12 / 34");
    await page.locator("#cardCvc").fill("123");
    const name = page.locator("#billingName");
    if (await name.count()) await name.fill("Test Buyer");
    const zip = page.locator("#billingPostalCode");
    if (await zip.count() && await zip.isVisible()) await zip.fill("90210");
    const link = page.locator("#enableStripePass");
    if (await link.count() && await link.isChecked()) await link.uncheck({ force: true });
    await page.screenshot({ path: `${OUT}/${shot}.png` });
    await page.locator('[data-testid="hosted-payment-submit-button"]').click();
    await page.waitForURL(new RegExp(`localhost:${PORT}/billing`), { timeout: 90000 });
  };
  const subOf = async (customer) => (await api("GET", `/subscriptions?customer=${customer}&status=all&limit=5&expand[]=data.latest_invoice`)).data;
  const describe = (s) => {
    const it = s.items.data[0];
    const inv = s.latest_invoice;
    return `status=${s.status} price=${it.price.unit_amount} product=${it.price.product} meta=${JSON.stringify(s.metadata)} latest_invoice: paid=${inv?.amount_paid} reason=${inv?.billing_reason}`;
  };

  // ---------- user A: checkout, upgrade, downgrade, portal, cancel, pack ----------
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const a = await signUp(page, "a");
  let s = await state(page);
  const bonus = s.balance;
  log("user A signed up, balance", bonus, "plan", s.plan);

  await page.getByTestId("buy-monthly").click();
  await payCheckout(page, "checkout-solo");
  await waitFor(page, { balance: bonus + 250, plan: "Solo" }, "subscribe to Solo through Stripe Checkout: +250 credits, plan Solo");

  const cust = (await api("GET", `/customers?email=${encodeURIComponent(a.email)}&limit=1`)).data[0];
  let subs = await subOf(cust.id);
  log("  stripe:", describe(subs[0]));
  check("Solo subscription bills the fixed Solo product at $19", subs[0].items.data[0].price.product === "videoapp_plan_monthly" && subs[0].items.data[0].price.unit_amount === 1900);
  const anchor0 = subs[0].billing_cycle_anchor;

  await page.getByTestId("buy-monthly-growth").click();
  await page.getByTestId("plan-change-confirm").waitFor();
  s = await state(page);
  check("picking Growth changes nothing before the confirm step", s.balance === bonus + 250 && s.plan === "Solo");
  await page.goto(`${BASE}/billing?change=monthly-growth`);
  await page.getByTestId("confirm-plan-change").click();
  await page.waitForURL(/billing\?(success|error)/, { timeout: 60000 });
  check("upgrade request accepted by Stripe", /success=1/.test(page.url()), page.url().replace(BASE, ""));
  await waitFor(page, { balance: bonus + 250 + 700, plan: "Growth" }, "upgrade to Growth: +700 credits once, plan Growth");
  subs = await subOf(cust.id);
  log("  stripe:", describe(subs[0]));
  const up = subs[0];
  check("one subscription only, now on the Growth product at $49", subs.length === 1 && up.items.data[0].price.product === "videoapp_plan_monthly_growth" && up.items.data[0].price.unit_amount === 4900);
  check("upgrade invoice is the full $49, not prorated", up.latest_invoice?.amount_paid === 4900, `paid ${up.latest_invoice?.amount_paid}, reason ${up.latest_invoice?.billing_reason}`);
  check("billing month restarted at the upgrade", up.billing_cycle_anchor >= anchor0, `anchor ${anchor0} -> ${up.billing_cycle_anchor}`);
  const invoicesAfterUp = (await api("GET", `/invoices?customer=${cust.id}&limit=10`)).data.length;

  await page.goto(`${BASE}/billing?change=monthly`);
  await page.getByTestId("confirm-plan-change").click();
  await page.waitForURL(/billing\?(changed|error)/, { timeout: 60000 });
  check("downgrade request accepted by Stripe", /changed=monthly/.test(page.url()), page.url().replace(BASE, ""));
  await sleep(6000);
  await waitFor(page, { balance: bonus + 250 + 700, plan: "Solo" }, "switch down to Solo: no credits, plan Solo");
  subs = await subOf(cust.id);
  log("  stripe:", describe(subs[0]));
  const invoicesAfterDown = (await api("GET", `/invoices?customer=${cust.id}&limit=10`)).data.length;
  check("downgrade created no invoice and no charge", invoicesAfterDown === invoicesAfterUp, `${invoicesAfterUp} -> ${invoicesAfterDown} invoices`);
  check("subscription now on the Solo product at $19", subs[0].items.data[0].price.product === "videoapp_plan_monthly" && subs[0].items.data[0].price.unit_amount === 1900);
  const preview = await api("POST", "/invoices/create_preview", { subscription: subs[0].id });
  check("next renewal will charge $19", preview.amount_due === 1900, `amount_due ${preview.amount_due}`);

  // Customer portal (Manage subscription & invoices)
  await page.goto(`${BASE}/billing`);
  const manage = page.getByRole("button", { name: /Manage subscription/ });
  if (await manage.count()) {
    await manage.click();
    await page.waitForLoadState("domcontentloaded");
    await sleep(3000);
    check("Manage subscription opens the Stripe customer portal", /billing\.stripe\.com/.test(page.url()), page.url().split("?")[0].slice(0, 60));
  } else check("Manage subscription button is shown", false);

  await api("DELETE", `/subscriptions/${subs[0].id}`);
  for (let i = 0; i < 20; i++) { s = await state(page); if (s.plan.toLowerCase() === "paid") break; await sleep(2000); }
  check("cancelling at Stripe drops the plan, credits stay", s.plan.toLowerCase() === "paid" && s.balance === bonus + 950, `plan ${s.plan}, balance ${s.balance}`);

  await page.goto(`${BASE}/billing`);
  await page.getByTestId("buy-starter").click();
  await payCheckout(page, "checkout-pack");
  for (let i = 0; i < 20; i++) { s = await state(page); if (s.balance === bonus + 1050) break; await sleep(2000); }
  check("one-off Starter pack through Stripe Checkout: +100 credits", s.balance === bonus + 1050, `balance ${s.balance}`);
  await ctx.close();

  // ---------- user B: renewal with a Stripe test clock ----------
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  const b = await signUp(pageB, "b");
  const now = Math.floor(Date.now() / 1000);
  const clock = await api("POST", "/test_helpers/test_clocks", { frozen_time: String(now) });
  const custB = await api("POST", "/customers", { email: b.email, test_clock: clock.id, payment_method: "pm_card_visa", "invoice_settings[default_payment_method]": "pm_card_visa" });
  const subB = await api("POST", "/subscriptions", {
    customer: custB.id,
    "items[0][price_data][currency]": "usd",
    "items[0][price_data][product]": "videoapp_plan_monthly_growth",
    "items[0][price_data][recurring][interval]": "month",
    "items[0][price_data][unit_amount]": "4900",
    "metadata[userId]": b.id,
    "metadata[productId]": "monthly-growth",
    "metadata[credits]": "700",
  });
  log("user B subscription", subB.status);
  await waitFor(pageB, { balance: bonus + 700, plan: "Growth" }, "first Growth invoice (test clock): +700 credits");
  await api("POST", `/test_helpers/test_clocks/${clock.id}/advance`, { frozen_time: String(now + 32 * 86400) });
  for (let i = 0; i < 60; i++) {
    const c = await api("GET", `/test_helpers/test_clocks/${clock.id}`);
    if (c.status === "ready") break;
    await sleep(3000);
  }
  await waitFor(pageB, { balance: bonus + 1400, plan: "Growth" }, "monthly renewal one month later (test clock): +700 credits again");
  const invB = (await api("GET", `/invoices?customer=${custB.id}&limit=10`)).data;
  log("  stripe: user B invoices:", invB.map((i) => `${i.billing_reason}:${i.amount_paid}`).join(", "));
  await api("DELETE", `/test_helpers/test_clocks/${clock.id}`);
  await ctxB.close();
} catch (e) {
  check("run completed", false, scrub(e.stack ?? e));
  try { const p = browser?.contexts()[0]?.pages()[0]; if (p) { await p.screenshot({ path: `${OUT}/failure.png` }); log("failure url:", p.url().slice(0, 120)); } } catch {}
} finally {
  await browser?.close();
  stopAll();
}
const failed = results.filter((r) => !r.ok);
log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
