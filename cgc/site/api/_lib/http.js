// Small HTTP helpers for Vercel Node functions (req/res style, no framework).
import { createHash, timingSafeEqual } from 'node:crypto';

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.end(JSON.stringify(obj));
}

export function clientIp(req) {
  const h = req.headers || {};
  const xf = String(h['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || String(h['x-real-ip'] || '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}

/** Read the JSON body. Vercel pre-parses JSON into req.body; fall back to the stream. */
export async function readJson(req, maxBytes) {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    if (JSON.stringify(req.body).length > maxBytes) throw httpError(413, 'Payload too large');
    return req.body;
  }
  let raw = '';
  if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if (typeof req.on === 'function') {
    raw = await new Promise((resolve, reject) => {
      let size = 0; const chunks = [];
      req.on('data', c => { size += c.length; if (size > maxBytes) { reject(httpError(413, 'Payload too large')); req.destroy && req.destroy(); } else chunks.push(c); });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  if (raw.length > maxBytes) throw httpError(413, 'Payload too large');
  if (!raw.trim()) return {};
  try { return JSON.parse(raw); } catch { throw httpError(400, 'Body must be JSON'); }
}

export function httpError(status, message) { const e = new Error(message); e.status = status; return e; }

/** Best-effort fixed-window limiter (per warm instance only). */
export function rateLimiter({ max, windowMs }) {
  const hits = new Map();
  return function check(key) {
    const now = Date.now();
    let h = hits.get(key);
    if (!h || now - h.start > windowMs) { h = { start: now, count: 0 }; hits.set(key, h); }
    h.count++;
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    return h.count <= max;
  };
}

/** Constant-time string compare (hash both sides so lengths match). */
export function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

export function queryParam(req, name) {
  if (req.query && req.query[name] !== undefined) return String(req.query[name]);
  try { return new URL(req.url, 'http://x').searchParams.get(name); } catch { return null; }
}
