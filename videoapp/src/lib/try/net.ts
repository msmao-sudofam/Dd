// Fetching a URL a stranger typed in. Everything here exists to make sure the request can only ever reach the
// public internet: http/https on the default port, no credentials, and every address the name resolves to is
// checked at connect time (not before it), so a DNS answer cannot change between the check and the connection.
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import zlib from "node:zlib";

export class FetchError extends Error {}

const blocked = new net.BlockList();
for (const [addr, bits] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(addr, bits, "ipv4");
for (const [addr, bits] of [
  ["::", 128], ["::1", 128], ["64:ff9b::", 96], ["100::", 64], ["2001:db8::", 32], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
] as const) blocked.addSubnet(addr, bits, "ipv6");

/** True only for addresses on the public internet (no loopback, private, link-local, CGNAT, multicast or reserved). */
export function isPublicAddress(address: string): boolean {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  const addr = mapped ? mapped[1] : address;
  const family = net.isIP(addr);
  if (family === 0) return false;
  return !blocked.check(addr, family === 4 ? "ipv4" : "ipv6");
}

/** Shape rules for a URL we are willing to request. Returns the parsed URL or throws. */
export function assertFetchableUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new FetchError("That doesn't look like a link.");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new FetchError("Only http and https links work.");
  if (u.username || u.password) throw new FetchError("Links with a username or password aren't supported.");
  if (u.port) throw new FetchError("Links with a port number aren't supported.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") && net.isIP(host) === 0) throw new FetchError("That doesn't look like a public website.");
  if (net.isIP(host) !== 0 && !isPublicAddress(host)) throw new FetchError("That address isn't on the public internet.");
  return u;
}

export interface SafeGetOptions {
  maxBytes: number;
  /** "truncate" keeps the first maxBytes (HTML); "error" rejects anything larger (images). */
  onTooLarge: "truncate" | "error";
  timeoutMs?: number;
  accept?: string;
  maxRedirects?: number;
  /** Tests only: lets the request reach a server on 127.0.0.1. Never set from request input. */
  allowPrivate?: boolean;
}

export interface SafeResponse {
  url: string;
  status: number;
  contentType: string;
  body: Buffer;
}

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

function guardedLookup(allowPrivate: boolean) {
  return (hostname: string, options: dns.LookupOptions, cb: LookupCb) => {
    dns.lookup(hostname, options, (err, address, family) => {
      if (err) return cb(err, address as string, family);
      const list = Array.isArray(address) ? address : [{ address: address as string, family: family ?? 4 }];
      if (!allowPrivate && list.some((a) => !isPublicAddress(a.address))) {
        return cb(Object.assign(new Error("address is not public"), { code: "EPRIVATE" }), "", 0);
      }
      cb(null, address as string, family);
    });
  };
}

function once(url: URL, o: SafeGetOptions, deadline: number): Promise<{ res: http.IncomingMessage; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup(!!o.allowPrivate) as unknown as net.LookupFunction,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ReelforgePreview/1.0; product photo preview requested by a visitor)",
          Accept: o.accept ?? "*/*",
          "Accept-Encoding": "gzip, br, deflate",
          "Accept-Language": "en",
        },
      },
      (res) => {
        const enc = String(res.headers["content-encoding"] ?? "").toLowerCase();
        const stream =
          enc === "gzip" ? res.pipe(zlib.createGunzip()) : enc === "br" ? res.pipe(zlib.createBrotliDecompress()) : enc === "deflate" ? res.pipe(zlib.createInflate()) : res;
        const chunks: Buffer[] = [];
        let size = 0;
        let done = false;
        const finish = (err?: Error) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (err) reject(err);
          else resolve({ res, body: Buffer.concat(chunks) });
        };
        stream.on("data", (c: Buffer) => {
          if (done) return;
          size += c.length;
          if (size > o.maxBytes) {
            if (o.onTooLarge === "error") {
              req.destroy();
              return finish(new FetchError("That file is too large."));
            }
            chunks.push(c.subarray(0, c.length - (size - o.maxBytes)));
            req.destroy();
            return finish();
          }
          chunks.push(c);
        });
        stream.on("end", () => finish());
        stream.on("error", (e) => finish(done ? undefined : new FetchError(`Couldn't read the response (${(e as Error).message}).`)));
        res.on("error", () => finish(new FetchError("The connection dropped.")));
      },
    );
    const timer = setTimeout(() => req.destroy(new FetchError("That site took too long to answer.")), Math.max(1, deadline - Date.now()));
    req.on("error", (e: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (e instanceof FetchError) return reject(e);
      reject(new FetchError(e.code === "EPRIVATE" ? "That address isn't on the public internet." : e.code === "ENOTFOUND" ? "We couldn't find that website." : "We couldn't reach that website."));
    });
    req.end();
  });
}

/** GET a public URL with a size cap, a total time budget and re-checked redirects. */
export async function safeGet(raw: string, o: SafeGetOptions): Promise<SafeResponse> {
  const deadline = Date.now() + (o.timeoutMs ?? 8000);
  let url = o.allowPrivate ? new URL(raw) : assertFetchableUrl(raw);
  for (let hop = 0; hop <= (o.maxRedirects ?? 3); hop++) {
    const { res, body } = await once(url, o, deadline);
    const status = res.statusCode ?? 0;
    if (status >= 300 && status < 400 && res.headers.location) {
      const next = new URL(res.headers.location, url);
      url = o.allowPrivate ? next : assertFetchableUrl(next.toString());
      continue;
    }
    return { url: url.toString(), status, contentType: String(res.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase(), body };
  }
  throw new FetchError("That link redirects too many times.");
}
