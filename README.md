# Oliver Samuels — The Collection

The official merch site for Jamaican comedy icon **Oliver Samuels**. Minimal, editorial, premium — built as a static site with Shopify Buy Button integration for checkout.

## Stack

- Plain HTML / CSS / JS (no build step)
- [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- [Shopify Buy Button SDK](https://shopify.dev/docs/api/storefront/buy-button-js) for commerce (to be wired up)

## Local development

Any static server works. For example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Drag-and-drop the folder to [Vercel](https://vercel.com/new) or [Netlify Drop](https://app.netlify.com/drop), or push to GitHub and connect the repo.

## Wiring up Shopify

1. In your Shopify admin, install the **Buy Button** sales channel.
2. Create a Buy Button for each product; copy the product ID.
3. In `index.html`, replace each `data-product-id="PLACEHOLDER_…"` with the real Shopify product ID.
4. In `script.js`, uncomment the Shopify SDK block at the bottom and fill in:
   - `domain: 'your-store.myshopify.com'`
   - `storefrontAccessToken: 'xxxx'`
5. The SDK will render Buy / Checkout buttons into each product card.

## Structure

- `index.html` — markup
- `style.css` — all styles (design tokens at the top)
- `script.js` — filters, newsletter, reveal animations, Shopify integration
- `images/` — hero + lookbook photography
