// Lead storage on Vercel Blob (private store).
//
// Storage choice (documented for the owner, see CRM-SETUP.md):
// - The Blob store must be created with access "Private" (supported by
//   @vercel/blob >= 2.3). Every read/write is authenticated; blob URLs are not
//   publicly fetchable. We never use access:'public' for lead data.
// - One JSON file per lead at leads/<id>.json. The id is a date prefix plus 96
//   random bits, so pathnames are unguessable even if a URL leaked.
// - We do NOT use addRandomSuffix: updates must overwrite the same pathname
//   (allowOverwrite / ifMatch). The random id gives the same unguessability.
// - Reads use useCache:false so the CRM always sees the latest write.
// - Nothing lists or serves leads publicly. Only /api/leads (CRM_KEY) reads them.
//
// Auth: on Vercel the SDK uses OIDC + BLOB_STORE_ID automatically once the
// store is connected to the project; BLOB_READ_WRITE_TOKEN also works.
// Tests can swap the backend with setStore().

const PREFIX = 'leads/';
let override = null;
let blobMod = null;

async function blob() {
  if (!blobMod) blobMod = await import('@vercel/blob');
  return blobMod;
}

export function setStore(impl) { override = impl; }

export function isConfigured() {
  if (override) return override.isConfigured ? override.isConfigured() : true;
  return !!(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && (process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)));
}

function pathFor(id) { return `${PREFIX}${id}.json`; }

async function streamToText(stream) {
  return await new Response(stream).text();
}

/** Returns {record, etag} or null. */
export async function getLead(id) {
  if (override) return override.getLead(id);
  const { get } = await blob();
  const res = await get(pathFor(id), { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200) return null;
  const text = await streamToText(res.stream);
  return { record: JSON.parse(text), etag: res.blob.etag };
}

/** Write a lead. opts.create => fail if exists; opts.ifMatch => optimistic concurrency. */
export async function putLead(record, opts = {}) {
  if (override) return override.putLead(record, opts);
  const { put } = await blob();
  const body = JSON.stringify(record);
  const options = {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
  };
  if (opts.ifMatch) options.ifMatch = opts.ifMatch;
  else if (!opts.create) options.allowOverwrite = true;
  return await put(pathFor(record.id), body, options);
}

/** List all leads (full records). Concurrency-limited reads. */
export async function listLeads() {
  if (override) return override.listLeads();
  const { list } = await blob();
  const paths = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, limit: 1000, cursor });
    for (const b of page.blobs) if (b.pathname.endsWith('.json')) paths.push(b.pathname);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const ids = paths.map(p => p.slice(PREFIX.length, -5));
  const out = [];
  const errors = [];
  let i = 0;
  async function worker() {
    while (i < ids.length) {
      const id = ids[i++];
      try {
        const r = await getLead(id);
        if (r) out.push(r.record);
      } catch (e) { errors.push({ id, error: String(e && e.message || e) }); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, ids.length) }, worker));
  if (errors.length) console.error('[store] failed to read some leads', errors);
  return { leads: out, readErrors: errors.length };
}

export function isPreconditionError(e) {
  return !!e && (e.name === 'BlobPreconditionFailedError' || /precondition/i.test(String(e.message || '')));
}

/** In-memory store for tests and local dev. */
export function memoryStore() {
  const m = new Map();
  let n = 0;
  return {
    data: m,
    isConfigured: () => true,
    async getLead(id) { const v = m.get(id); return v ? { record: JSON.parse(v.body), etag: v.etag } : null; },
    async putLead(record, opts = {}) {
      const cur = m.get(record.id);
      if (opts.create && cur) throw new Error('exists');
      if (opts.ifMatch && (!cur || cur.etag !== opts.ifMatch)) { const e = new Error('Precondition failed'); e.name = 'BlobPreconditionFailedError'; throw e; }
      m.set(record.id, { body: JSON.stringify(record), etag: `"e${++n}"` });
      return { pathname: pathFor(record.id) };
    },
    async listLeads() { return { leads: [...m.values()].map(v => JSON.parse(v.body)), readErrors: 0 }; },
  };
}
