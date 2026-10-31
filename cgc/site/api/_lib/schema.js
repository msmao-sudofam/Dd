// Shared lead schema, stages and sanitizers for /api/lead and /api/leads.
// Files under api/_lib are not exposed as routes by Vercel (underscore prefix).

import { randomBytes } from 'node:crypto';

export const ROLES = ['GC', 'PM', 'Owner', 'Architect', 'Other'];
export const PROJECT_TYPES = ['storefront', 'curtain-wall', 'interior-glass', 'doors', 'service-repair', 'other'];

// Bid lane (project work) and service lane (fast lane).
export const BID_STAGES = [
  'lead', 'plans', 'takeoff', 'bid-sent', 'follow-up', 'awarded', 'lost',
  'submittals', 'glass-ordered', 'install-scheduled', 'installed-punch',
  'invoiced-retention', 'closed',
];
export const SERVICE_STAGES = ['svc-new', 'svc-scheduled', 'svc-done', 'svc-invoiced'];
export const STAGES = [...BID_STAGES, ...SERVICE_STAGES];

export const LIMITS = {
  name: 100, company: 120, email: 160, phone: 30, city: 80, scope: 4000,
  plansLink: 500, source: 100, utm: 150, page: 300, assigned: 60,
  tag: 30, tags: 12, note: 2000, lostReason: 300, title: 140,
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const ID_RE = /^[a-z0-9-]{8,64}$/;

export function newId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${d}-${randomBytes(12).toString('hex')}`;
}

// Strip control chars (keep newlines/tabs in multi-line fields), trim, cap length.
export function str(v, max, multiline = false) {
  if (v === undefined || v === null) return '';
  let s = String(v);
  s = multiline
    ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  s = s.trim();
  return s.length > max ? s.slice(0, max) : s;
}

export function isEmail(s) { return s.length <= LIMITS.email && EMAIL_RE.test(s); }

export function phoneDigits(s) { return String(s || '').replace(/\D/g, ''); }

export function isPhone(s) {
  const d = phoneDigits(s);
  return d.length >= 7 && d.length <= 15 && /^[0-9+().\-\s x ext]*$/i.test(s);
}

export function isDate(s) {
  if (!DATE_RE.test(s)) return false;
  const t = Date.parse(s + 'T00:00:00Z');
  if (Number.isNaN(t)) return false;
  return new Date(t).toISOString().slice(0, 10) === s;
}

export function isHttpUrl(s) {
  if (!s || s.length > LIMITS.plansLink) return false;
  try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; }
}

export function toBool(v) {
  return v === true || v === 'true' || v === 'on' || v === '1' || v === 1 || v === 'yes';
}

// Money: accept 12500, "12,500", "$12,500.00". Returns number (2dp) or null.
export function money(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(n) || n < 0 || n > 1e9) return undefined; // undefined = invalid
  return Math.round(n * 100) / 100;
}

export function laneFor(projectType) { return projectType === 'service-repair' ? 'service' : 'bid'; }

export function defaultStage(lane) { return lane === 'service' ? 'svc-new' : 'lead'; }

/**
 * Validate the public website form payload. Returns { errors, lead } where
 * lead holds only the whitelisted, cleaned fields.
 */
export function validatePublicLead(body) {
  const errors = {};
  const b = body && typeof body === 'object' ? body : {};
  const utmIn = b.utm && typeof b.utm === 'object' ? b.utm : {};
  const lead = {
    name: str(b.name, LIMITS.name),
    company: str(b.company, LIMITS.company),
    email: str(b.email, LIMITS.email).toLowerCase(),
    phone: str(b.phone, LIMITS.phone),
    role: str(b.role, 20),
    projectType: str(b.projectType, 30),
    city: str(b.city, LIMITS.city),
    scope: str(b.scope, LIMITS.scope, true),
    bidDue: str(b.bidDue, 10),
    plansLink: str(b.plansLink, LIMITS.plansLink),
    smsConsent: toBool(b.sms_consent ?? b.smsConsent),
    source: str(b.source, LIMITS.source) || 'website',
    page: str(b.page, LIMITS.page),
    referrer: str(b.referrer, LIMITS.page),
    utm: {
      source: str(b.utm_source ?? utmIn.source, LIMITS.utm),
      medium: str(b.utm_medium ?? utmIn.medium, LIMITS.utm),
      campaign: str(b.utm_campaign ?? utmIn.campaign, LIMITS.utm),
      term: str(b.utm_term ?? utmIn.term, LIMITS.utm),
      content: str(b.utm_content ?? utmIn.content, LIMITS.utm),
    },
  };

  if (lead.name.length < 2) errors.name = 'Name is required.';
  if (!lead.email && !lead.phone) errors.email = 'Email or phone is required.';
  if (lead.email && !isEmail(lead.email)) errors.email = 'Email looks wrong.';
  if (lead.phone && !isPhone(lead.phone)) errors.phone = 'Phone looks wrong.';
  if (!lead.role) lead.role = 'Other';
  else if (!ROLES.includes(lead.role)) errors.role = `Role must be one of ${ROLES.join(', ')}.`;
  if (!PROJECT_TYPES.includes(lead.projectType)) errors.projectType = `projectType must be one of ${PROJECT_TYPES.join(', ')}.`;
  if (lead.bidDue && !isDate(lead.bidDue)) errors.bidDue = 'bidDue must be YYYY-MM-DD.';
  if (lead.plansLink && !isHttpUrl(lead.plansLink)) errors.plansLink = 'Plans link must be an http(s) URL.';
  if (lead.smsConsent && !lead.phone) errors.sms_consent = 'Text consent needs a phone number.';
  // Free text that clearly is not text (e.g. raw bodies over the limit) is already capped by str().

  return { errors, lead };
}

/** Build a full stored record from cleaned public/manual fields. */
export function buildRecord(clean, { origin = 'website', now = new Date().toISOString() } = {}) {
  const lane = laneFor(clean.projectType);
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    origin,                      // 'website' | 'manual' | 'import'
    lane,                        // 'bid' | 'service'
    stage: defaultStage(lane),
    stageChangedAt: now,
    lastTouchAt: now,
    name: clean.name || '',
    company: clean.company || '',
    email: clean.email || '',
    phone: clean.phone || '',
    role: clean.role || 'Other',
    projectType: clean.projectType || 'other',
    title: clean.title || '',
    city: clean.city || '',
    scope: clean.scope || '',
    bidDue: clean.bidDue || '',
    plansLink: clean.plansLink || '',
    smsConsent: !!clean.smsConsent,
    smsConsentAt: clean.smsConsent ? now : '',
    source: clean.source || origin,
    page: clean.page || '',
    referrer: clean.referrer || '',
    utm: clean.utm || {},
    value: null,          // estimated contract value
    bidAmount: null,      // our bid
    awardValue: null,     // awarded contract value
    assigned: '',
    tags: [],
    nextFollowUp: '',
    installDate: '',
    lostReason: '',
    bidSentAt: '',
    awardedAt: '',
    lostAt: '',
    archived: false,
    notes: [],            // [{at, by, text}]
    activity: [{ at: now, type: 'created', text: origin === 'website' ? 'Lead came in from website form' : `Created (${origin})` }],
  };
}

// Fields the CRM may PATCH, with their validators. Return undefined for invalid.
const EDITABLE = {
  name: v => str(v, LIMITS.name),
  company: v => str(v, LIMITS.company),
  title: v => str(v, LIMITS.title),
  email: v => { const s = str(v, LIMITS.email).toLowerCase(); return !s || isEmail(s) ? s : undefined; },
  phone: v => { const s = str(v, LIMITS.phone); return !s || isPhone(s) ? s : undefined; },
  role: v => (ROLES.includes(v) ? v : undefined),
  projectType: v => (PROJECT_TYPES.includes(v) ? v : undefined),
  city: v => str(v, LIMITS.city),
  scope: v => str(v, LIMITS.scope, true),
  plansLink: v => { const s = str(v, LIMITS.plansLink); return !s || isHttpUrl(s) ? s : undefined; },
  bidDue: v => { const s = str(v, 10); return !s || isDate(s) ? s : undefined; },
  nextFollowUp: v => { const s = str(v, 10); return !s || isDate(s) ? s : undefined; },
  installDate: v => { const s = str(v, 10); return !s || isDate(s) ? s : undefined; },
  value: money,
  bidAmount: money,
  awardValue: money,
  assigned: v => str(v, LIMITS.assigned),
  lostReason: v => str(v, LIMITS.lostReason),
  source: v => str(v, LIMITS.source),
  smsConsent: v => (typeof v === 'boolean' ? v : undefined),
  archived: v => (typeof v === 'boolean' ? v : undefined),
  lane: v => (v === 'bid' || v === 'service' ? v : undefined),
  stage: v => (STAGES.includes(v) ? v : undefined),
  tags: v => {
    const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : null;
    if (!arr) return undefined;
    return [...new Set(arr.map(t => str(t, LIMITS.tag).toLowerCase()).filter(Boolean))].slice(0, LIMITS.tags);
  },
};

export const EDITABLE_FIELDS = Object.keys(EDITABLE);

/**
 * Apply a PATCH body to a record (mutates and returns {record, errors, changed}).
 * Supports: any EDITABLE field, appendNote: {text, by} | string, activity: string (log line).
 */
export function applyPatch(record, patch, { now = new Date().toISOString(), by = 'crm' } = {}) {
  const errors = {};
  const changed = [];
  const p = patch && typeof patch === 'object' ? patch : {};

  for (const key of EDITABLE_FIELDS) {
    if (!(key in p)) continue;
    const val = EDITABLE[key](p[key]);
    if (val === undefined) { errors[key] = 'Invalid value.'; continue; }
    const before = record[key];
    if (JSON.stringify(before) === JSON.stringify(val)) continue;
    record[key] = val;
    changed.push(key);
  }

  // Keep lane consistent with stage when the stage moves across lanes.
  if (changed.includes('stage')) {
    const lane = SERVICE_STAGES.includes(record.stage) ? 'service' : 'bid';
    if (record.lane !== lane) { record.lane = lane; if (!changed.includes('lane')) changed.push('lane'); }
  } else if (changed.includes('lane')) {
    const ok = record.lane === 'service' ? SERVICE_STAGES : BID_STAGES;
    if (!ok.includes(record.stage)) { record.stage = defaultStage(record.lane); changed.push('stage'); }
  }

  if (changed.includes('stage')) {
    record.stageChangedAt = now;
    record.lastTouchAt = now;
    if (record.stage === 'bid-sent' && !record.bidSentAt) record.bidSentAt = now;
    if (record.stage === 'awarded' && !record.awardedAt) record.awardedAt = now;
    if (record.stage === 'lost' && !record.lostAt) record.lostAt = now;
    record.activity.push({ at: now, type: 'stage', text: `Stage → ${record.stage}` });
  }
  if (changed.includes('archived')) {
    record.activity.push({ at: now, type: 'archive', text: record.archived ? 'Archived' : 'Restored' });
  }
  if (changed.includes('smsConsent') && record.smsConsent && !record.smsConsentAt) record.smsConsentAt = now;
  const fieldChanges = changed.filter(k => !['stage', 'archived', 'lane'].includes(k));
  if (fieldChanges.length) {
    record.activity.push({ at: now, type: 'edit', text: `Updated ${fieldChanges.join(', ')}` });
  }

  if (p.appendNote !== undefined) {
    const n = typeof p.appendNote === 'string' ? { text: p.appendNote } : p.appendNote || {};
    const text = str(n.text, LIMITS.note, true);
    if (text) {
      record.notes.push({ at: now, by: str(n.by, 60) || by, text });
      record.lastTouchAt = now;
      changed.push('notes');
    } else errors.appendNote = 'Note text is empty.';
  }
  if (typeof p.logActivity === 'string' && p.logActivity.trim()) {
    record.activity.push({ at: now, type: 'log', text: str(p.logActivity, 300) });
    if (p.touch === true) record.lastTouchAt = now;
    changed.push('activity');
  }

  // Cap history so a single record cannot grow without bound.
  if (record.notes.length > 500) record.notes = record.notes.slice(-500);
  if (record.activity.length > 500) record.activity = record.activity.slice(-500);
  if (changed.length) record.updatedAt = now;
  return { record, errors, changed };
}

/**
 * Build a record from a manual/CRM POST or a CSV-import row. Less strict than the
 * public form (no name requirement beyond something identifying the job).
 */
export function buildManualRecord(input, origin = 'manual') {
  const b = input && typeof input === 'object' ? input : {};
  const now = new Date().toISOString();
  const projectType = PROJECT_TYPES.includes(b.projectType) ? b.projectType : 'other';
  const base = buildRecord({ projectType, source: str(b.source, LIMITS.source) || origin }, { origin, now });
  const patch = { ...b };
  delete patch.appendNote; delete patch.logActivity;
  const { errors } = applyPatch(base, patch, { now });
  // applyPatch logs "Updated ..." for initial fields; replace with one clean entry.
  base.activity = [{ at: now, type: 'created', text: origin === 'import' ? 'Imported from CSV' : 'Created in CRM' }];
  if (origin === 'import') {
    // Keep history dates from an exported CSV so metrics survive a round trip.
    for (const k of ['createdAt', 'bidSentAt', 'awardedAt', 'lostAt', 'lastTouchAt', 'stageChangedAt']) {
      const v = str(b[k], 40);
      if (v && !Number.isNaN(Date.parse(v))) base[k] = new Date(Date.parse(v)).toISOString();
    }
  }
  if (b.appendNote || b.notes) {
    const text = str(b.appendNote || (typeof b.notes === 'string' ? b.notes : ''), LIMITS.note, true);
    if (text) base.notes.push({ at: now, by: 'crm', text });
  }
  if (!PROJECT_TYPES.includes(b.projectType) && b.projectType) errors.projectType = 'Unknown project type, set to other.';
  if (!base.name && !base.company && !base.title) errors.name = 'Need a name, company or job title.';
  return { record: base, errors };
}
