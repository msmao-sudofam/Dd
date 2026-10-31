// POST /api/lead — public bid/service request intake from the website form.
// Stores the lead in a private Vercel Blob store and emails a notification via
// Resend (REST, no SDK) when RESEND_API_KEY + LEAD_NOTIFY_TO + REPORT_FROM exist.

import { validatePublicLead, buildRecord } from './_lib/schema.js';
import { putLead, isConfigured } from './_lib/store.js';
import { send, readJson, clientIp, rateLimiter } from './_lib/http.js';
import { createHash } from 'node:crypto';

const MAX_BODY = 20 * 1024;
const limit = rateLimiter({ max: 5, windowMs: 10 * 60 * 1000 }); // 5 submissions / 10 min / IP
const PHONE_FALLBACK = '(714) 650-4185';

const TYPE_LABEL = {
  'storefront': 'Storefront', 'curtain-wall': 'Curtain wall', 'interior-glass': 'Interior glass / TI',
  'doors': 'Doors', 'service-repair': 'Service / repair', 'other': 'Other',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const ip = clientIp(req);
  if (!limit(ip)) {
    return send(res, 429, { ok: false, error: `Too many requests. Call ${PHONE_FALLBACK}.` });
  }

  let body;
  try { body = await readJson(req, MAX_BODY); }
  catch (e) { return send(res, e.status || 400, { ok: false, error: e.message }); }

  // Honeypot: real users never fill "hp". Pretend success so bots learn nothing.
  if (body && typeof body.hp === 'string' && body.hp.trim() !== '') {
    console.warn('[lead] honeypot tripped', { ipHash: hashIp(ip) });
    return send(res, 200, { ok: true, id: 'received' });
  }

  const { errors, lead } = validatePublicLead(body);
  if (Object.keys(errors).length) {
    return send(res, 400, { ok: false, error: 'validation', fields: errors });
  }

  const record = buildRecord(lead, { origin: 'website' });
  record.meta = {
    ipHash: hashIp(ip),
    smsConsentVersion: "2026-10-30",
    smsConsentText: "Text me about this bid request. By checking this box, I agree to receive text messages from Commercial Glazing Contractors Inc. at the number I provided about my bid request and project, including messages sent with automated technology. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase. See our [Privacy Policy](/privacy/#sms) and [Terms](/terms/).",
    ua: String((req.headers && req.headers['user-agent']) || '').slice(0, 200),
  };

  let stored = false;
  if (isConfigured()) {
    try { await putLead(record, { create: true }); stored = true; }
    catch (e) { console.error('[lead] blob put failed', { id: record.id, error: e && e.message }); }
  } else {
    console.error('[lead] Blob store not configured (no BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID). Lead not stored.', { id: record.id });
  }

  let emailed = false;
  try { emailed = await notify(record, req, stored); }
  catch (e) { console.error('[lead] notify failed', { id: record.id, error: e && e.message }); }

  if (!stored && !emailed) {
    // Nothing captured the lead. Tell the visitor so they can call instead.
    console.error('[lead] LEAD LOST: not stored and not emailed', { id: record.id, projectType: record.projectType });
    return send(res, 503, { ok: false, error: `We could not save your request. Please call ${PHONE_FALLBACK} or email nathan@cgcontractorsinc.com.` });
  }

  return send(res, 200, { ok: true, id: record.id, stored, emailed });
}

function hashIp(ip) {
  return createHash('sha256').update(`${process.env.CRM_KEY || 'cgc'}:${ip}`).digest('hex').slice(0, 16);
}

async function notify(r, req, stored) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.REPORT_FROM;
  if (!key || !to || !from) {
    if (key || to) console.warn('[lead] email skipped: need RESEND_API_KEY, LEAD_NOTIFY_TO and REPORT_FROM');
    return false;
  }
  const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '';
  const crmUrl = host ? `https://${host}/crm/#lead=${r.id}` : '';
  const due = r.bidDue ? `Bid due: ${r.bidDue}` : 'Bid due: (not given)';
  const lines = [
    `New ${r.lane === 'service' ? 'SERVICE CALL' : 'bid request'} from the website.`,
    '',
    `Name:      ${r.name}`,
    `Company:   ${r.company || '-'}`,
    `Role:      ${r.role}`,
    `Phone:     ${r.phone || '-'}${r.smsConsent ? '  (OK to text)' : ''}`,
    `Email:     ${r.email || '-'}`,
    `Type:      ${TYPE_LABEL[r.projectType] || r.projectType}`,
    `City:      ${r.city || '-'}`,
    due,
    `Plans:     ${r.plansLink || '-'}`,
    '',
    'Scope:',
    r.scope || '-',
    '',
    `Source: ${r.source}${r.utm && r.utm.source ? ` / utm ${[r.utm.source, r.utm.medium, r.utm.campaign].filter(Boolean).join(' / ')}` : ''}`,
    `Lead id: ${r.id}`,
    stored ? (crmUrl ? `Open in CRM: ${crmUrl}` : '') : 'WARNING: lead was NOT saved to the CRM (storage not configured). This email is the only copy.',
  ];
  const subject = `${r.lane === 'service' ? 'Service call' : 'Bid request'}: ${r.company || r.name}${r.city ? ` (${r.city})` : ''}${r.bidDue ? ` due ${r.bidDue}` : ''}`;
  const payload = {
    from,
    to: to.split(',').map(s => s.trim()).filter(Boolean),
    subject: subject.slice(0, 180),
    text: lines.join('\n'),
  };
  if (r.email) payload.reply_to = r.email;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `lead-${r.id}` },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => '');
    console.error('[lead] Resend error', resp.status, t.slice(0, 300));
    return false;
  }
  return true;
}
