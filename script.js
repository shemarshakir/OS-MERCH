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
   SHOPIFY BUY BUTTON (commented out — activate when ready)
   ------------------------------------------------------------
   1. Fill in your Shopify domain + Storefront access token.
   2. In each .product element, set data-product-id to the real
      Shopify product ID from your admin.
   3. Uncomment the block below.
   ============================================================

   (function loadShopify() {
     const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
     if (window.ShopifyBuy && window.ShopifyBuy.UI) return initShopify();
     const s = document.createElement('script');
     s.async = true;
     s.src = scriptURL;
     s.onload = initShopify;
     document.head.appendChild(s);
   })();

   function initShopify() {
     const client = ShopifyBuy.buildClient({
       domain: 'YOUR-STORE.myshopify.com',
       storefrontAccessToken: 'YOUR_STOREFRONT_TOKEN'
     });
     const ui = ShopifyBuy.UI.init(client);
     document.querySelectorAll('.product[data-product-id]').forEach(el => {
       const id = el.dataset.productId;
       if (!id || id.startsWith('PLACEHOLDER_')) return;
       ui.createComponent('product', {
         id,
         node: el,
         moneyFormat: '%24%7B%7Bamount%7D%7D',
         options: {
           product: { buttonDestination: 'checkout' }
         }
       });
     });
   }
*/
