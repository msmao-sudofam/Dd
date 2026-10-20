#!/usr/bin/env python3
"""Pull SÍ QUEMA's public Shopify catalog into the skill.

  fetch_store.py [--base https://siquemasupplements.com]

Writes:
  brand/assets/product/<handle>/NN.<ext>   every product photo (the real ones, from the store)
  brand/store.json                          titles, prices, variants, description text, image list
  sources.json                              price-<handle> entries refreshed from the live store

Only reads the public /products.json endpoint every Shopify store serves.
"""
import argparse
import html
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (siquema-motion asset fetch)"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def text_of(body_html):
    t = re.sub(r"<(br|/p|/li|/h\d)[^>]*>", "\n", body_html or "", flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", "", t))
    return re.sub(r"\n\s*\n+", "\n", t).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--base", default="https://siquemasupplements.com")
    args = ap.parse_args()
    base = args.base.rstrip("/")

    products, page = [], 1
    while True:
        try:
            batch = json.loads(get(f"{base}/products.json?limit=250&page={page}"))["products"]
        except Exception as e:  # network block, store moved, password page
            sys.exit(f"can't read {base}/products.json: {e}")
        if not batch:
            break
        products += batch
        page += 1
    if not products:
        sys.exit("store returned no products")

    today = date.today().isoformat()
    out_dir = SKILL / "brand" / "assets" / "product"
    summary = []
    for p in products:
        folder = out_dir / p["handle"]
        folder.mkdir(parents=True, exist_ok=True)
        images = []
        for i, img in enumerate(p.get("images", []), 1):
            src = img["src"].split("?")[0]
            ext = Path(src).suffix.lower() or ".jpg"
            dest = folder / f"{i:02d}{ext}"
            dest.write_bytes(get(src))
            images.append(str(dest.relative_to(SKILL)))
        variants = [{"title": v["title"], "price": v["price"], "sku": v.get("sku")} for v in p.get("variants", [])]
        summary.append({
            "handle": p["handle"], "title": p["title"], "vendor": p.get("vendor"), "type": p.get("product_type"),
            "tags": p.get("tags"), "url": f"{base}/products/{p['handle']}", "variants": variants,
            "description": text_of(p.get("body_html")), "images": images,
        })
        print(f"{p['title']}: {len(images)} photos, " + ", ".join(f"${v['price']}" for v in variants))

    (SKILL / "brand" / "store.json").write_text(json.dumps({"fetched": today, "base": base, "products": summary}, indent=2, ensure_ascii=False) + "\n")

    sources_path = SKILL / "sources.json"
    sources = json.loads(sources_path.read_text())
    by_id = {e["id"]: e for e in sources["entries"]}
    for p in summary:
        for v in p["variants"]:
            sid = f"price-{p['handle']}" + ("" if v["title"] == "Default Title" else f"-{re.sub(r'[^a-z0-9]+', '-', v['title'].lower()).strip('-')}")
            by_id[sid] = {
                "id": sid, "claim": f"{p['title']}" + ("" if v["title"] == "Default Title" else f" ({v['title']})") + f": ${v['price']}",
                "match": [f"${v['price']}", v["price"]], "source": f"{p['url']} (fetched {today})",
                "show_source": None, "added": by_id.get(sid, {}).get("added", today),
            }
    sources["entries"] = list(by_id.values())
    sources_path.write_text(json.dumps(sources, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote brand/store.json, {sum(len(p['images']) for p in summary)} photos, refreshed prices in sources.json")
    print("next: check the old price-mango / price-kiwi-strawberry entries against these and delete any that are stale")


if __name__ == "__main__":
    main()
