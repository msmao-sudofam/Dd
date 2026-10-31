// /api/leads — CRM backend. All methods require header x-crm-key === env CRM_KEY.
//   GET                      -> { ok, leads:[...all fields...], stored:true }
//   POST   {lead fields}     -> create manual lead/job     -> { ok, lead }
//   POST   {import:[...]}    -> bulk create (CSV import)   -> { ok, created, errors }
//   PATCH  ?id= | {id, ...}  -> update fields / appendNote -> { ok, lead }
//   DELETE ?id=              -> soft delete (archived:true) -> { ok, lead }

import { applyPatch, buildManualRecord, ID_RE } from './_lib/schema.js';
import { getLead, putLead, listLeads, isConfigured, isPreconditionError } from './_lib/store.js';
import { send, readJson, clientIp, rateLimiter, safeEqual, queryParam } from './_lib/http.js';

const MAX_BODY = 1024 * 1024; // CSV import can be large
const badKey = rateLimiter({ max: 20, windowMs: 10 * 60 * 1000 });

export default async function handler(req, res) {
  const ip = clientIp(req);
  const expected = process.env.CRM_KEY;
  if (!expected || expected.length < 12) {
    console.error('[leads] CRM_KEY env is missing or shorter than 12 chars');
    return send(res, 503, { ok: false, error: 'CRM_KEY is not configured on the server.' });
  }
  const given = String((req.headers && req.headers['x-crm-key']) || '');
  if (!given || !safeEqual(given, expected)) {
    if (!badKey(ip)) return send(res, 429, { ok: false, error: 'Too many attempts. Wait 10 minutes.' });
    return send(res, 401, { ok: false, error: 'Unauthorized' });
  }

  if (!isConfigured()) {
    return send(res, 503, { ok: false, error: 'Blob store not connected. See CRM-SETUP.md.', stored: false });
  }

  try {
    switch (req.method) {
      case 'GET': return await doList(req, res);
      case 'POST': return await doCreate(req, res);
      case 'PATCH': return await doPatch(req, res);
      case 'DELETE': return await doArchive(req, res);
      default:
        res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
        return send(res, 405, { ok: false, error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('[leads] error', req.method, e && (e.stack || e.message));
    return send(res, e.status || 500, { ok: false, error: e.status ? e.message : 'Server error' });
  }
}

async function doList(req, res) {
  const { leads, readErrors } = await listLeads();
  leads.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return send(res, 200, { ok: true, leads, readErrors, serverTime: new Date().toISOString() });
}

async function doCreate(req, res) {
  const body = await readJson(req, MAX_BODY);
  if (Array.isArray(body.import)) {
    if (body.import.length > 1000) return send(res, 400, { ok: false, error: 'Max 1000 rows per import.' });
    const created = [];
    const errors = [];
    for (let i = 0; i < body.import.length; i++) {
      const { record, errors: e } = buildManualRecord(body.import[i], 'import');
      if (e.name) { errors.push({ row: i + 1, error: e.name }); continue; }
      try { await putLead(record, { create: true }); created.push(record); }
      catch (err) { errors.push({ row: i + 1, error: 'Write failed' }); console.error('[leads] import write', err && err.message); }
    }
    return send(res, 200, { ok: true, created: created.length, leads: created, errors });
  }
  const { record, errors } = buildManualRecord(body, 'manual');
  if (errors.name) return send(res, 400, { ok: false, error: 'validation', fields: errors });
  await putLead(record, { create: true });
  return send(res, 201, { ok: true, lead: record, warnings: errors });
}

function idFrom(req, body) {
  const id = queryParam(req, 'id') || (body && body.id) || '';
  return ID_RE.test(String(id)) ? String(id) : null;
}

async function update(id, patch, res) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const cur = await getLead(id);
    if (!cur) return send(res, 404, { ok: false, error: 'Not found' });
    const { record, errors, changed } = applyPatch(cur.record, patch);
    if (Object.keys(errors).length && !changed.length) {
      return send(res, 400, { ok: false, error: 'validation', fields: errors });
    }
    if (!changed.length) return send(res, 200, { ok: true, lead: record, changed });
    try {
      await putLead(record, { ifMatch: cur.etag });
      return send(res, 200, { ok: true, lead: record, changed, fields: Object.keys(errors).length ? errors : undefined });
    } catch (e) {
      if (!isPreconditionError(e)) throw e;
      // Someone else wrote in between: re-read and re-apply.
    }
  }
  return send(res, 409, { ok: false, error: 'Lead changed on another device. Reload and try again.' });
}

async function doPatch(req, res) {
  const body = await readJson(req, 64 * 1024);
  const id = idFrom(req, body);
  if (!id) return send(res, 400, { ok: false, error: 'Missing or bad id' });
  const patch = { ...body };
  delete patch.id;
  return update(id, patch, res);
}

async function doArchive(req, res) {
  const id = idFrom(req, null);
  if (!id) return send(res, 400, { ok: false, error: 'Missing or bad id' });
  return update(id, { archived: true }, res);
}
