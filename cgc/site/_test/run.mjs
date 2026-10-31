// Tiny test harness: node _test/run.mjs
// Exercises /api/lead and /api/leads handlers against an in-memory blob store
// and a mocked fetch (Resend). No network, no real keys.

import assert from 'node:assert/strict';
import { setStore, memoryStore } from '../api/_lib/store.js';

const TEST_KEY = 'test-only-key-' + Math.random().toString(36).slice(2);
process.env.CRM_KEY = TEST_KEY;
delete process.env.BLOB_READ_WRITE_TOKEN;
delete process.env.BLOB_STORE_ID;
delete process.env.RESEND_API_KEY;
delete process.env.LEAD_NOTIFY_TO;
delete process.env.REPORT_FROM;

const { default: lead } = await import('../api/lead.js');
const { default: leads } = await import('../api/leads.js');

let ipSeq = 0;
function call(handler, { method = 'GET', body, headers = {}, url = '/', ip } = {}) {
  return new Promise((resolve, reject) => {
    const h = { 'x-forwarded-for': ip || `10.0.0.${++ipSeq}`, host: 'example.test', ...headers };
    const req = { method, headers: h, url, body, query: Object.fromEntries(new URL(url, 'http://x').searchParams) };
    const res = {
      statusCode: 200, headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      end(s) { try { resolve({ status: this.statusCode, headers: this.headers, json: JSON.parse(s) }); } catch (e) { reject(e); } },
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

const good = {
  name: 'Pat Sample', company: 'Sample GC Co.', email: 'pat@example.com', phone: '(555) 010-2000',
  role: 'GC', projectType: 'storefront', city: 'Temecula', scope: 'Two storefront elevations, 1 pair of doors.\nSee sheets A4.1.',
  bidDue: '2026-11-12', plansLink: 'https://example.com/plans', sms_consent: true, source: 'website',
  utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'storefront', hp: '',
};

let passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ok  ', name); }
  catch (e) { console.error('  FAIL', name, '\n', e); process.exitCode = 1; }
}

// Mock fetch for Resend
const sent = [];
globalThis.fetch = async (url, init) => {
  sent.push({ url, init, body: JSON.parse(init.body) });
  return new Response(JSON.stringify({ id: 'email_1' }), { status: 200 });
};

console.log('\n/api/lead — no blob configured');
await t('no store + no email => 503 ok:false (never silent)', async () => {
  const r = await call(lead, { method: 'POST', body: good });
  assert.equal(r.status, 503); assert.equal(r.json.ok, false);
  assert.match(r.json.error, /714/);
});
await t('no store + email configured => ok, stored:false, emailed:true', async () => {
  process.env.RESEND_API_KEY = 're_test_dummy'; process.env.LEAD_NOTIFY_TO = 'a@example.com, b@example.com'; process.env.REPORT_FROM = 'CGC Website <leads@example.com>';
  const r = await call(lead, { method: 'POST', body: good });
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(r.json.stored, false); assert.equal(r.json.emailed, true);
  const m = sent.at(-1);
  assert.equal(m.url, 'https://api.resend.com/emails');
  assert.deepEqual(m.body.to, ['a@example.com', 'b@example.com']);
  assert.equal(m.body.reply_to, 'pat@example.com');
  assert.match(m.body.text, /NOT saved/);
  assert.match(m.init.headers.Authorization, /^Bearer /);
});

const mem = memoryStore();
setStore(mem);

console.log('\n/api/lead — with store');
await t('GET => 405', async () => { const r = await call(lead, {}); assert.equal(r.status, 405); });
await t('valid lead stored + emailed', async () => {
  const r = await call(lead, { method: 'POST', body: good });
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(r.json.stored, true);
  assert.match(r.json.id, /^\d{8}-[a-f0-9]{24}$/);
  const rec = (await mem.getLead(r.json.id)).record;
  assert.equal(rec.stage, 'lead'); assert.equal(rec.lane, 'bid'); assert.equal(rec.smsConsent, true);
  assert.equal(rec.utm.source, 'google'); assert.ok(rec.meta.ipHash); assert.ok(!('hp' in rec));
  assert.match(sent.at(-1).body.text, /Open in CRM: https:\/\/example\.test\/crm\/#lead=/);
});
await t('honeypot => 200 but NOT stored', async () => {
  const before = mem.data.size;
  const r = await call(lead, { method: 'POST', body: { ...good, hp: 'http://spam' } });
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(mem.data.size, before);
});
await t('validation errors', async () => {
  const r = await call(lead, { method: 'POST', body: { name: 'x', email: 'nope', projectType: 'windows', bidDue: '2026-13-40', plansLink: 'javascript:alert(1)', role: 'Boss' } });
  assert.equal(r.status, 400);
  for (const f of ['name', 'email', 'projectType', 'bidDue', 'plansLink', 'role']) assert.ok(r.json.fields[f], 'expected error for ' + f);
});
await t('email or phone required; sms consent needs phone', async () => {
  const r = await call(lead, { method: 'POST', body: { name: 'Al Sample', projectType: 'doors', sms_consent: true } });
  assert.equal(r.status, 400); assert.ok(r.json.fields.email); assert.ok(r.json.fields.sms_consent);
});
await t('length limits enforced', async () => {
  const r = await call(lead, { method: 'POST', body: { ...good, scope: 'x'.repeat(9000), city: 'c'.repeat(500) } });
  assert.equal(r.status, 200);
  const rec = (await mem.getLead(r.json.id)).record;
  assert.equal(rec.scope.length, 4000); assert.equal(rec.city.length, 80);
});
await t('payload too large => 413', async () => {
  const r = await call(lead, { method: 'POST', body: JSON.stringify({ ...good, scope: 'x'.repeat(30000) }) });
  assert.equal(r.status, 413);
});
await t('service-repair goes to service lane', async () => {
  const r = await call(lead, { method: 'POST', body: { ...good, projectType: 'service-repair', bidDue: '' } });
  const rec = (await mem.getLead(r.json.id)).record;
  assert.equal(rec.lane, 'service'); assert.equal(rec.stage, 'svc-new');
});
await t('rate limit: 6th submission from same IP => 429', async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await call(lead, { method: 'POST', body: good, ip: '9.9.9.9' });
  assert.equal(last.status, 429);
});

console.log('\n/api/leads — auth');
await t('no key => 401', async () => { const r = await call(leads, {}); assert.equal(r.status, 401); });
await t('wrong key => 401', async () => { const r = await call(leads, { headers: { 'x-crm-key': 'wrong' } }); assert.equal(r.status, 401); });
await t('missing CRM_KEY env => 503', async () => {
  const k = process.env.CRM_KEY; delete process.env.CRM_KEY;
  const r = await call(leads, { headers: { 'x-crm-key': 'anything' } });
  process.env.CRM_KEY = k; assert.equal(r.status, 503);
});
await t('brute force => 429 after 20 bad tries', async () => {
  let r; for (let i = 0; i < 21; i++) r = await call(leads, { headers: { 'x-crm-key': 'bad' + i }, ip: '7.7.7.7' });
  assert.equal(r.status, 429);
});

const auth = { 'x-crm-key': TEST_KEY };
await t('JSON bodies must be objects on public and CRM endpoints', async () => {
  const before = mem.data.size;
  for (const body of ['null', '[]', 'true', '42', '"text"', []]) {
    for (const handler of [lead, leads]) {
      const r = await call(handler, { method: 'POST', headers: auth, body });
      assert.equal(r.status, 400, `Expected 400 for ${JSON.stringify(body)}`);
      assert.equal(r.json.ok, false);
    }
  }
  assert.equal(mem.data.size, before);
});
await t('UTF-8 byte limit applies to pre-parsed objects', async () => {
  const r = await call(lead, { method: 'POST', body: { ...good, scope: '界'.repeat(8000) } });
  assert.equal(r.status, 413);
});
await t('UTF-8 byte limit applies to raw JSON strings and buffers', async () => {
  const raw = JSON.stringify({ ...good, scope: '界'.repeat(8000) });
  for (const body of [raw, Buffer.from(raw)]) {
    const r = await call(lead, { method: 'POST', body });
    assert.equal(r.status, 413);
  }
});
let id;
console.log('\n/api/leads — CRUD');
await t('GET list returns all fields', async () => {
  const r = await call(leads, { headers: auth });
  assert.equal(r.status, 200); assert.ok(r.json.leads.length >= 3);
  const l = r.json.leads[0];
  for (const k of ['id', 'stage', 'name', 'company', 'email', 'phone', 'scope', 'notes', 'activity', 'utm', 'bidAmount', 'nextFollowUp']) assert.ok(k in l, k);
  id = r.json.leads.find(x => x.lane === 'bid').id;
});
await t('PATCH stage + money + dates + tags + note', async () => {
  const r = await call(leads, { method: 'PATCH', url: `/api/leads?id=${id}`, headers: auth, body: {
    stage: 'bid-sent', bidAmount: '$48,250.00', value: 60000, nextFollowUp: '2026-11-05', bidDue: '2026-11-12',
    assigned: 'Nathan', tags: 'tilt-up, Irvine ,tilt-up', appendNote: { text: 'Sent bid via email', by: 'Nathan' },
  } });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const l = r.json.lead;
  assert.equal(l.stage, 'bid-sent'); assert.equal(l.bidAmount, 48250); assert.equal(l.value, 60000);
  assert.ok(l.bidSentAt); assert.deepEqual(l.tags, ['tilt-up', 'irvine']);
  assert.equal(l.notes.at(-1).text, 'Sent bid via email'); assert.equal(l.notes.at(-1).by, 'Nathan');
  assert.ok(l.activity.some(a => a.text === 'Stage → bid-sent'));
});
await t('PATCH id in body also works; awarded sets awardedAt', async () => {
  const r = await call(leads, { method: 'PATCH', headers: auth, body: { id, stage: 'awarded', awardValue: 47000 } });
  assert.equal(r.status, 200); assert.ok(r.json.lead.awardedAt); assert.equal(r.json.lead.awardValue, 47000);
});
await t('PATCH invalid values => 400', async () => {
  const r = await call(leads, { method: 'PATCH', url: `/api/leads?id=${id}`, headers: auth, body: { stage: 'nope', bidAmount: -5, email: 'bad' } });
  assert.equal(r.status, 400); assert.ok(r.json.fields.stage && r.json.fields.bidAmount && r.json.fields.email);
});
await t('PATCH ignores non-editable fields (id, createdAt, meta)', async () => {
  const before = (await mem.getLead(id)).record;
  const r = await call(leads, { method: 'PATCH', url: `/api/leads?id=${id}`, headers: auth, body: { createdAt: '2000-01-01', meta: { x: 1 }, city: 'Irvine' } });
  assert.equal(r.status, 200); assert.equal(r.json.lead.createdAt, before.createdAt); assert.equal(r.json.lead.city, 'Irvine');
});
await t('PATCH bad id / missing => 400 / 404', async () => {
  assert.equal((await call(leads, { method: 'PATCH', url: '/api/leads?id=../../etc', headers: auth, body: {} })).status, 400);
  assert.equal((await call(leads, { method: 'PATCH', url: '/api/leads?id=20260101-deadbeefdeadbeef', headers: auth, body: { city: 'x' } })).status, 404);
});
await t('PATCH retries on etag conflict', async () => {
  const orig = mem.putLead; let first = true;
  mem.putLead = async (rec, opts) => { if (first && opts.ifMatch) { first = false; const e = new Error('Precondition failed'); e.name = 'BlobPreconditionFailedError'; throw e; } return orig(rec, opts); };
  const r = await call(leads, { method: 'PATCH', url: `/api/leads?id=${id}`, headers: auth, body: { assigned: 'Kelly' } });
  mem.putLead = orig;
  assert.equal(r.status, 200); assert.equal(r.json.lead.assigned, 'Kelly');
});
await t('POST manual job', async () => {
  const r = await call(leads, { method: 'POST', headers: auth, body: { company: 'Sample Builders', title: 'Dental office TI', projectType: 'interior-glass', bidDue: '2026-11-20', bidAmount: 12000 } });
  assert.equal(r.status, 201); assert.equal(r.json.lead.origin, 'manual'); assert.equal(r.json.lead.bidAmount, 12000);
});
await t('POST manual job without identity => 400', async () => {
  const r = await call(leads, { method: 'POST', headers: auth, body: { projectType: 'doors' } });
  assert.equal(r.status, 400);
});
await t('POST import rows (keeps history dates)', async () => {
  const r = await call(leads, { method: 'POST', headers: auth, body: { import: [
    { company: 'Imported GC', stage: 'lost', bidAmount: 9000, createdAt: '2026-03-01T00:00:00Z', bidSentAt: '2026-03-05T00:00:00Z' },
    { projectType: 'doors' },
  ] } });
  assert.equal(r.status, 200); assert.equal(r.json.created, 1); assert.equal(r.json.errors.length, 1);
  assert.equal(r.json.leads[0].bidSentAt, '2026-03-05T00:00:00.000Z'); assert.equal(r.json.leads[0].stage, 'lost');
});
await t('DELETE soft-archives', async () => {
  const r = await call(leads, { method: 'DELETE', url: `/api/leads?id=${id}`, headers: auth });
  assert.equal(r.status, 200); assert.equal(r.json.lead.archived, true);
  assert.ok(await mem.getLead(id), 'record must still exist');
  const r2 = await call(leads, { method: 'PATCH', url: `/api/leads?id=${id}`, headers: auth, body: { archived: false } });
  assert.equal(r2.json.lead.archived, false);
});
await t('PUT => 405', async () => {
  assert.equal((await call(leads, { method: 'PUT', headers: auth })).status, 405);
});
await t('store not configured => 503 on /api/leads', async () => {
  setStore({ isConfigured: () => false });
  const r = await call(leads, { headers: auth });
  setStore(mem); assert.equal(r.status, 503);
});

console.log(`\n${passed} passed${process.exitCode ? ', SOME FAILED' : ''}`);
