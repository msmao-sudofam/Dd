# Warehouse Runner — Knowledge Base

> A complete, sourced reference for **Warehouse Runner**, the smart Costco / warehouse-club
> price-tracking app. Built from public sources (App Store, marketing site, reviews) because
> the app itself (`app.warehouserunner.com`) is login-gated and blocks automated access.

Last updated: 2026-07-25

---

## 1. What it is

**Warehouse Runner** is a **price-tracking and deal-detection app for Costco and other
warehouse clubs** — tagline: *"Smart Costco Price Tracking."* It lets you compare prices
across warehouse locations, decode Costco's hidden price-tag markdown codes, track items you
care about, and reclaim money through Costco's 30-day price-adjustment window.

| Fact | Detail |
|------|--------|
| Category | Shopping / Price tracking |
| Primary platform | iOS (iPhone) + web companion (`app.warehouserunner.com`) |
| App Store ID | `6737151631` |
| Bundle ID | `com.annies.ok.runner` (a-ok.app) |
| Premium price | **$79.99 / year** |
| Privacy stance | Zero data collection — no analytics, no tracking, no third-party SDKs, no signup required |
| Warehouses covered | 600+ |

---

## 2. Core features

### Price comparison & scanning
- **Scan a price tag or barcode** in-store for instant price comparison (recent versions
  improved scan speed and accuracy).
- **Search 600+ warehouses**; the app auto-detects your nearest locations and lets you switch
  between them to find the lowest price.

### The price-code decoder (signature feature)
Warehouse Runner reads Costco's insider price-ending codes so a price tells you *why* it's
priced that way. See the full decoder table in [`price-tag-cheat-sheet.md`](price-tag-cheat-sheet.md).
Highlights it surfaces:
- **`.97`** → clearance / manager markdown (a real deal).
- **`.00` / `.88`** → manager's final closeout — often the deepest markdowns.
- Flags **large markdowns** on high-ticket items (TVs, appliances) and tracks stock status.

### Favorites & alerts
- **Favorites** — track specific items; get **push notifications when prices change**.
  (Free: up to 3 favorites/locations tier limits apply; Premium: unlimited.)
- **Saved searches** — get alerted when new matching items appear at your warehouses.

### New-items feed
- See what just landed at your local warehouse; tap **"All warehouses"** to spot items that
  may be coming to yours soon.

### Price history
- **Interactive price-history graphs**, "when does this typically go on sale" insight, and
  **buy-now vs. wait** recommendations. (Premium.)

### Receipt import & price-adjustment tracking (biggest money-saver)
- Import your in-store warehouse-club receipts; the app **watches for price drops during the
  30-day price-adjustment window** so you can claim the refund. (Premium.)

---

## 3. Free vs. Premium

| Capability | Free | Premium ($79.99/yr) |
|---|:---:|:---:|
| Compare prices at nearby warehouses | ✅ | ✅ |
| Warehouses tracked | up to **3** | up to **10** |
| Basic price monitoring & deal detection | ✅ | ✅ |
| Search all 600+ warehouses | ❌ | ✅ |
| Complete price history + graphs | ❌ | ✅ |
| Unlimited favorites | ❌ | ✅ |
| Saved-search alerts | ❌ | ✅ |
| Receipt price-drop / adjustment monitoring | ❌ | ✅ |

---

## 4. How to actually use it (playbook)

1. **Set your home warehouse(s)** first so comparisons are relevant.
2. In-store, **scan tags** and watch the ending digits — `.97`, `.00`, `.88` = markdowns;
   an **asterisk** ("death star") in the tag's top-right = won't be restocked (last chance).
3. **Favorite** big-ticket items and let price alerts tell you when to buy.
4. After buying, **import the receipt** and let it monitor the **30-day window** — if the
   price drops, go to the membership counter for the adjustment refund.
5. Use **price history** to decide buy-now vs. wait on non-urgent items.

---

## 5. Strengths & known complaints (from reviews)

**Strengths**
- Big time/effort savings for regular Costco shoppers.
- Price-ending decoder + markdown alerts are the standout value.
- Strong privacy posture (no tracking, no account required).

**Complaints**
- **Inventory/availability can be inaccurate**, occasionally causing wasted trips.
- **Aggressive paywall** — core search and history are gated behind the $79.99/yr subscription.

---

## 6. Sources

- Marketing site — https://warehouserunner.com/
- App companion / premium — https://app.warehouserunner.com/premium
- App Store listing — https://apps.apple.com/us/app/warehouse-runner/id6737151631
- MWM app profile — https://mwm.ai/apps/warehouse-runner/6737151631
- Developer domain — https://warehouse-runner.a-ok.app/
- Independent review (2026) — https://marlvel.ai/apps/com-annies-ok-runner

> Note: figures like the $79.99/yr price and feature tiers are drawn from public listings as of
> July 2026 and may change — verify on the in-app **Premium** screen.
