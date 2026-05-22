// ---------- Product filter ----------
const filters = document.querySelectorAll('.filter');
const products = document.querySelectorAll('.product');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    products.forEach(p => {
      const show = cat === 'all' || p.dataset.cat === cat;
      p.style.display = show ? '' : 'none';
    });
  });
});

// ---------- Newsletter ----------
const signupForm = document.getElementById('signupForm');
const signupNote = document.getElementById('signupNote');
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    signupNote.textContent = 'Thanks — you\u2019re on the list.';
    signupForm.querySelector('input').value = '';
  });
}

// ---------- Light scroll reveal ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.product, .look, .story-text, .story-media, .hero-text, .hero-media').forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .8s ease, transform .8s ease';
  io.observe(el);
});

/* ============================================================
   SHOPIFY BUY BUTTON
   ------------------------------------------------------------
   Renders a real Add-to-Cart button inside each product card
   that has a numeric data-product-id. Cards still using
   PLACEHOLDER_* IDs are skipped — they keep their static look
   until the matching product is created in Shopify.

   To add a new product:
     1. Create the product in Shopify Admin → Products
     2. Copy its numeric product ID from the admin URL
     3. Replace the card's data-product-id with that number
   No code change here is needed.
   ============================================================ */
(function () {
  const SHOPIFY = {
    domain: 'srsn7k-hx.myshopify.com',
    storefrontAccessToken: '3a8b062e6c407e4bc3650af0e1af6e18',
  };

  const cards = document.querySelectorAll('.product[data-product-id]');
  const liveCards = Array.from(cards).filter(el => {
    const id = el.dataset.productId;
    return id && /^\d+$/.test(id);
  });
  if (liveCards.length === 0) return;

  function loadSDK(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) return cb();
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadSDK(function () {
    const client = ShopifyBuy.buildClient(SHOPIFY);

    ShopifyBuy.UI.onReady(client).then(function (ui) {
      liveCards.forEach(function (card) {
        let mount = card.querySelector('.product-buy');
        if (!mount) {
          mount = document.createElement('div');
          mount.className = 'product-buy';
          (card.querySelector('.product-info') || card).appendChild(mount);
        }
        ui.createComponent('product', {
          id: card.dataset.productId,
          node: mount,
          moneyFormat: '%24%7B%7Bamount%7D%7D%20JMD',
          options: {
            product: {
              contents: {
                img: false,
                title: false,
                price: false,
                description: false,
                button: true,
                buttonWithQuantity: false,
              },
              text: { button: 'Add to cart' },
              styles: {
                product: { 'text-align': 'left' },
                button: {
                  'font-family': "'Inter', system-ui, sans-serif",
                  'font-size': '13px',
                  'font-weight': '500',
                  'letter-spacing': '0.04em',
                  'background-color': '#1A1A1A',
                  'color': '#F5F1EA',
                  'padding-top': '13px',
                  'padding-bottom': '13px',
                  'border-radius': '999px',
                  ':hover': { 'background-color': '#1E5A2A' },
                  ':focus': { 'background-color': '#1E5A2A' },
                },
              },
            },
            cart: {
              text: { total: 'Subtotal', button: 'Checkout' },
              styles: {
                button: {
                  'background-color': '#1E5A2A',
                  ':hover': { 'background-color': '#0F3A1A' },
                  ':focus': { 'background-color': '#0F3A1A' },
                },
              },
            },
            toggle: {
              styles: {
                toggle: {
                  'background-color': '#1E5A2A',
                  ':hover': { 'background-color': '#0F3A1A' },
                  ':focus': { 'background-color': '#0F3A1A' },
                  'font-family': "'Inter', system-ui, sans-serif",
                },
              },
            },
          },
        });
      });
    });
  });
})();
