# CGC lead desk setup

1. Use the Vercel CGC project with `cgc/site` as root, or deploy from this directory. No framework or build command is needed. Install with `npm ci`; static files and Node API functions deploy together.
2. Owner: create a **Private** Vercel Blob store and connect it for Preview and Production. Use connected `BLOB_STORE_ID` with Vercel OIDC, or the store's `BLOB_READ_WRITE_TOKEN`. Lead blobs must never be public.
3. Owner: create a strong random `CRM_KEY`, at least 12 characters, in Vercel environment variables. Keep it out of source, URLs and shared email. Redeploy after environment changes.
4. Optional notifications: owner adds `RESEND_API_KEY`, `LEAD_NOTIFY_TO` and `REPORT_FROM` (a sender address on an owner-verified domain). All three are needed. Without email, check the desk daily. No SMS service is connected.
5. Owner: turn off Deployment Protection for the intended public audience under Settings → Deployment Protection. This build does not change that setting.
6. Open `/crm/`, enter your key and unlock. It stays only in tab memory. Lock desk clears it. SAMPLE-data demo requires no key, uses fictional records and never sends data to the API.
7. Submit a clearly marked test bid. Verify it appears in the desk and any configured notification arrives. Move its stage, save a note and archive it. Test email-only and phone-only requests. Local tests do not verify cloud storage or email delivery.

## Daily use

Open cards to edit stages, dates, amounts, assignments, tags, plans links and scope. Today shows due/overdue bids, follow-ups and bids untouched for seven days. Metrics use filtered records: win rate = awarded / (awarded + lost), including historical award dates after jobs advance. Enter bid and award amounts for useful totals.

Templates open drafts in your email/text app; they do not send. Text drafts require recorded consent. CSV imports do not establish SMS consent. The public SMS checkbox is optional and unchecked.

Export CSV for a restricted backup. Import accepts exported column names, quoted commas and multiline values, up to 1,000 rows. Import **creates new records**, not updates. Back up first; inspect returned row errors. Export neutralizes spreadsheet formula prefixes. CSV does not transfer SMS consent. Archive is reversible using the Archived filter.

## Local review

Run `npm ci`, `npm test`, then `npm run dev:crm`. Open `http://127.0.0.1:4173`. Local records live only in memory and disappear on restart. SAMPLE demo needs no credentials. Authenticated local review requires an owner-supplied `CRM_KEY` in the process environment; the helper never generates or prints one. Do not host the dev server publicly.

## Maintenance

Rotate the key after personnel changes. Review retained data quarterly. The supplied API soft-archives only: owner must permanently delete expired JSON blobs in the private store (unconverted leads: 24 months after last contact; project records: up to seven years). Protect and expire CSV backups too. Complete LEGAL-NOTES.md's owner checklist, including mailing-address and photo-publicity review. Automated retention and an SMS sender are not included.
