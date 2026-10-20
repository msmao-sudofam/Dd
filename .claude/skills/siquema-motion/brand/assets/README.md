# Brand assets

Put M Mo's real files here. These are the ONLY product visuals any SÍ QUEMA video may use.

```
assets/
├── logo/          logo files (svg/png), light + dark
├── label/         straight-on label photos per flavor (Mango, Kiwi Strawberry); also the source for flavor colors and the Supplement Facts panel
├── product/       tub/scoop/pour photos and footage
├── fonts/         label/brand fonts (.ttf/.otf)
└── past-reels/    reels that shipped and worked
```

`product/` and `../store.json` fill themselves: run `python3 scripts/fetch_store.py` from the skill folder.
It pulls every product photo, price, and description from the live store's public catalog. The session's network
policy has to allow `siquemasupplements.com` and `cdn.shopify.com`.

After adding the logo and label files, fill in the palette/font table in `../brand.md`.
