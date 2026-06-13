# Oliver Samuels — The Official Store

The official Oliver Samuels merchandise store. A minimal black/paper streetwear
storefront with Jamaican flag accents, celebrating fifty years of laughter.

## Pages

- `index.html` — home (hero, featured collection, categories)
- `collection.html?cat=tops|bottoms|accessories|all` — product grid
- `product.html?id=<product-id>` — product detail (gallery, sizes, cart)
- `about.html` — brand story
- `contact.html` — contact form

## Files

- `styles.css` — design system (Archivo / Archivo Expanded, jade · gold · black)
- `store.js` — catalog, cart (localStorage), and page renderers
- `image-slot.js` — drag-and-drop image placeholders for mockups

## Local preview

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173

## Notes

- Product imagery uses `<image-slot>` placeholders. Drop in real mockups or
  wire hardcoded `src=` paths when artwork is ready.
- `.env.example` documents the Shopify Storefront variables for a future
  headless-commerce integration. Copy to `.env` (gitignored) to use.
