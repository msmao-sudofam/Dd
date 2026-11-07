import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { assertFetchableUrl, FetchError, isPublicAddress, safeGet } from "@/lib/try/net";
import { cleanProductName, extractProduct } from "@/lib/try/product-page";

describe("try: only the public internet can be fetched", () => {
  it.each([
    "127.0.0.1", "10.1.2.3", "172.16.0.9", "172.31.255.255", "192.168.1.10", "169.254.169.254", "100.64.0.1", "0.0.0.0",
    "224.0.0.1", "::1", "::", "fe80::1", "fd00::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "not-an-ip",
  ])("%s is not public", (addr) => expect(isPublicAddress(addr)).toBe(false));

  it.each(["8.8.8.8", "93.184.216.34", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"])("%s is public", (addr) =>
    expect(isPublicAddress(addr)).toBe(true),
  );

  it.each([
    "ftp://example.com/a", "file:///etc/passwd", "javascript:alert(1)", "http://user:pw@example.com/", "http://example.com:8080/",
    "http://localhost/", "http://intranet/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.5/admin", "not a url",
  ])("rejects %s", (url) => expect(() => assertFetchableUrl(url)).toThrow(FetchError));

  it("accepts an ordinary store link", () => {
    expect(assertFetchableUrl(" https://shop.example.com/products/glow-serum?variant=1 ").hostname).toBe("shop.example.com");
  });

  it("refuses a loopback address before any connection is made", async () => {
    await expect(safeGet("http://127.0.0.1/", { maxBytes: 1000, onTooLarge: "truncate" })).rejects.toThrow(FetchError);
  });
});

describe("try: fetching with limits (local server, private addresses allowed for the test only)", () => {
  let server: http.Server;
  let base = "";
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === "/redirect") return void res.writeHead(302, { Location: "/page" }).end();
      if (req.url === "/loop") return void res.writeHead(302, { Location: "/loop" }).end();
      if (req.url === "/big") return void res.writeHead(200, { "Content-Type": "image/jpeg" }).end(Buffer.alloc(50_000, 1));
      if (req.url === "/slow") return; // never answers
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end("<title>ok</title>" + "x".repeat(5000));
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());
  const opts = { maxBytes: 2000, onTooLarge: "truncate" as const, allowPrivate: true, timeoutMs: 1500 };

  it("follows a redirect and truncates HTML at the cap", async () => {
    const r = await safeGet(`${base}/redirect`, opts);
    expect(r.status).toBe(200);
    expect(r.url).toBe(`${base}/page`);
    expect(r.contentType).toBe("text/html");
    expect(r.body.length).toBe(2000);
  });
  it("rejects a file over the cap when asked to", async () => {
    await expect(safeGet(`${base}/big`, { ...opts, onTooLarge: "error" })).rejects.toThrow(/too large/);
  });
  it("gives up on a redirect loop", async () => {
    await expect(safeGet(`${base}/loop`, opts)).rejects.toThrow(/redirects too many times/);
  });
  it("times out on a server that never answers", async () => {
    await expect(safeGet(`${base}/slow`, { ...opts, timeoutMs: 300 })).rejects.toThrow(FetchError);
  });
});

describe("try: reading a product page", () => {
  const page = "https://shop.example.com/products/glow-serum";

  it("prefers schema.org Product data", () => {
    const html = `<html><head><title>Glow Serum | Shop</title>
      <meta property="og:image" content="https://cdn.example.com/og.jpg">
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Glow Serum &amp; Dropper","image":["//cdn.example.com/a.jpg","https://cdn.example.com/b.jpg"]}</script></head></html>`;
    expect(extractProduct(html, page)).toEqual({ name: "Glow Serum & Dropper", imageUrl: "https://cdn.example.com/a.jpg" });
  });

  it("finds a Product inside @graph and resolves a relative image", () => {
    const html = `<script type="application/ld+json">{"@graph":[{"@type":"WebSite","name":"Shop"},{"@type":["Product","Thing"],"name":"Oak Candle","image":{"url":"/img/candle.png"}}]}</script>`;
    expect(extractProduct(html, page)).toEqual({ name: "Oak Candle", imageUrl: "https://shop.example.com/img/candle.png" });
  });

  it("falls back to Open Graph tags, in either attribute order", () => {
    const html = `<meta content="Matte Bottle – 500 ml | Hydra" property="og:title"><meta property="og:image" content="https://cdn.example.com/bottle.webp?v=1&amp;w=800">`;
    expect(extractProduct(html, page)).toEqual({ name: "Matte Bottle", imageUrl: "https://cdn.example.com/bottle.webp?v=1&w=800" });
  });

  it("survives broken JSON and reports a missing photo", () => {
    const html = `<title>Just a page</title><script type="application/ld+json">{ not json </script>`;
    expect(extractProduct(html, page)).toEqual({ name: "Just a page", imageUrl: null });
  });

  it("ignores image links that are not http(s)", () => {
    expect(extractProduct(`<meta property="og:image" content="data:image/png;base64,AAAA">`, page).imageUrl).toBeNull();
  });

  it.each([
    ["Glow Serum – Vitamin C | Store", "Glow Serum"],
    ["Buy Oak Candle - Home Co", "Oak Candle"],
    ["  Plain   name  ", "Plain name"],
    ["A".repeat(90), "A".repeat(60)],
  ])("cleans the name %j", (raw, want) => expect(cleanProductName(raw)).toBe(want));
});
