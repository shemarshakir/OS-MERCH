/* ============================================================
   OLIVER SAMUELS store engine — Shopify Storefront API, chrome,
   cart (real Shopify Cart + checkout), and page renderers.
   ============================================================ */
(function(){
"use strict";

/* ---------------- Shopify Storefront client ---------------- */
const CFG = window.SHOPIFY_CONFIG || {};
const SF_ENDPOINT = `https://${CFG.domain}/api/${CFG.apiVersion || "2024-10"}/graphql.json`;

async function sf(query, variables){
  const res = await fetch(SF_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": CFG.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if(json.errors){ console.error("Shopify error:", json.errors); throw new Error("Shopify request failed"); }
  return json.data;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  descriptionHtml
  productType
  tags
  availableForSale
  featuredImage { url altText }
  images(first: 10) { edges { node { url altText } } }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount } }
  options { name values }
  variants(first: 100) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount }
        image { url altText }
        selectedOptions { name value }
      }
    }
  }
`;

// Preferred default colour for hero/card imagery, most-preferred first.
// The store leads with a neutral mockup (black, then white, then grey) for
// every product rather than whatever colour Shopify happens to return first.
const NEUTRAL_COLOR_ORDER = [/black/i, /white/i, /gr[ae]y/i];
function pickNeutralColor(values, hasImage){
  for(const rx of NEUTRAL_COLOR_ORDER){
    const match = values.find(v => rx.test(v) && hasImage(v));
    if(match) return match;
  }
  return values.find(hasImage) || null;
}

function normalizeProduct(p){
  const images = p.images.edges.map(e=>e.node);
  const variants = p.variants.edges.map(e=>e.node);
  const options = (p.options||[]).filter(o=>!(o.name==="Title" && o.values.length===1 && o.values[0]==="Default Title"));
  const allImages = images.length ? images : (p.featuredImage ? [p.featuredImage] : []);

  // Map each colour value to its variant mockup image.
  const colorOpt = options.find(o=>/colou?r/i.test(o.name));
  const colorImages = {};
  if(colorOpt){
    variants.forEach(v=>{
      const cv = v.selectedOptions.find(o=>o.name===colorOpt.name);
      if(cv && v.image && !colorImages[cv.value]) colorImages[cv.value] = v.image;
    });
  }
  const neutralColor = colorOpt ? pickNeutralColor(colorOpt.values, v=>!!colorImages[v]) : null;

  // Tapstitch products ship a blank flat-lay as the first gallery image and
  // put the real design mockup on each variant. Lead with a neutral colour's
  // variant image so grid tiles and the PDP default to a black/white/grey
  // design shot; fall back to any variant image, then the gallery image.
  const primaryImage = (neutralColor && colorImages[neutralColor])
    || (variants.find(v=>v.image)||{}).image
    || allImages[0] || null;

  return {
    id: p.handle,
    gid: p.id,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    productType: (p.productType||"").toLowerCase(),
    tags: (p.tags||[]).map(t=>t.toLowerCase()),
    availableForSale: p.availableForSale,
    price: Number(p.priceRange.minVariantPrice.amount),
    compareAtPrice: (p.compareAtPriceRange && p.compareAtPriceRange.minVariantPrice) ? Number(p.compareAtPriceRange.minVariantPrice.amount) : null,
    currency: p.priceRange.minVariantPrice.currencyCode,
    images: allImages,
    primaryImage,
    neutralColor,
    options,
    variants,
  };
}

async function fetchProducts(first){
  const data = await sf(
    `query($first:Int!){ products(first:$first){ edges { node { ${PRODUCT_FIELDS} } } } }`,
    { first: first || 50 }
  );
  return data.products.edges.map(e=>normalizeProduct(e.node));
}

async function fetchProductByHandle(handle){
  const data = await sf(
    `query($handle:String!){ productByHandle(handle:$handle){ ${PRODUCT_FIELDS} } }`,
    { handle }
  );
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}

function money(n, currency){
  const amt = Number(n)||0;
  const symbol = (!currency || currency==="USD") ? "$" : currency+" ";
  return symbol + amt.toFixed(2);
}

function stripHtml(html){
  const d=document.createElement("div"); d.innerHTML = html||"";
  return (d.textContent||d.innerText||"").trim();
}

const CATS = [
  { key:"all", label:"All", title:"All Products" },
  { key:"tops", label:"Tops", title:"Tops" },
  { key:"bottoms", label:"Bottoms", title:"Bottoms" },
  { key:"accessories", label:"Accessories", title:"Accessories" },
];
function matchesCat(p, key){
  if(key==="all") return true;
  return p.productType===key || p.tags.includes(key);
}

/* ---------------- Cart (real Shopify Cart API) ---------------- */
const CART_ID_KEY = "os_shopify_cart_id";
let cartCache = null;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount { amount currencyCode }
    subtotalAmount { amount currencyCode }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount }
            image { url altText }
            selectedOptions { name value }
            product { title handle }
          }
        }
      }
    }
  }
`;

async function getOrCreateCart(){
  if(cartCache) return cartCache;
  const id = localStorage.getItem(CART_ID_KEY);
  if(id){
    try{
      const data = await sf(`query($id:ID!){ cart(id:$id){ ${CART_FIELDS} } }`, { id });
      if(data.cart){ cartCache = data.cart; return cartCache; }
      localStorage.removeItem(CART_ID_KEY);
    }catch(e){ /* stale/expired cart id — fall through */ }
  }
  return null;
}

async function addToCart(variantId, qty){
  qty = qty || 1;
  const existing = await getOrCreateCart();
  let cart;
  if(!existing){
    const data = await sf(
      `mutation($input:CartInput!){ cartCreate(input:$input){ cart { ${CART_FIELDS} } userErrors { field message } } }`,
      { input: { lines: [{ merchandiseId: variantId, quantity: qty }] } }
    );
    if(data.cartCreate.userErrors.length) throw new Error(data.cartCreate.userErrors[0].message);
    cart = data.cartCreate.cart;
  } else {
    const data = await sf(
      `mutation($cartId:ID!,$lines:[CartLineInput!]!){ cartLinesAdd(cartId:$cartId, lines:$lines){ cart { ${CART_FIELDS} } userErrors { field message } } }`,
      { cartId: existing.id, lines: [{ merchandiseId: variantId, quantity: qty }] }
    );
    if(data.cartLinesAdd.userErrors.length) throw new Error(data.cartLinesAdd.userErrors[0].message);
    cart = data.cartLinesAdd.cart;
  }
  cartCache = cart;
  localStorage.setItem(CART_ID_KEY, cart.id);
  renderCartCount();
  renderDrawer();
  return cart;
}

async function changeQty(lineId, newQty){
  const cart = await getOrCreateCart();
  if(!cart) return;
  let data;
  if(newQty <= 0){
    data = await sf(
      `mutation($cartId:ID!,$lineIds:[ID!]!){ cartLinesRemove(cartId:$cartId, lineIds:$lineIds){ cart { ${CART_FIELDS} } userErrors{field message} } }`,
      { cartId: cart.id, lineIds: [lineId] }
    );
    cartCache = data.cartLinesRemove.cart;
  } else {
    data = await sf(
      `mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){ cartLinesUpdate(cartId:$cartId, lines:$lines){ cart { ${CART_FIELDS} } userErrors{field message} } }`,
      { cartId: cart.id, lines: [{ id: lineId, quantity: newQty }] }
    );
    cartCache = data.cartLinesUpdate.cart;
  }
  renderCartCount();
  renderDrawer();
}
function removeLine(lineId){ return changeQty(lineId, 0); }

async function goToCheckout(){
  const cart = await getOrCreateCart();
  if(cart && cart.checkoutUrl) window.location.href = cart.checkoutUrl;
}

/* ---------------- Chrome: header, drawer, footer ---------------- */
function navLinks(active){
  return CATS.map(c=>`<a href="collection.html?cat=${c.key}" class="${active===c.key?'active':''}">${c.label}</a>`).join("")
    + `<a href="about.html" class="${active==='about'?'active':''}">About</a>`;
}
function renderHeader(active){
  const el=document.getElementById("site-head"); if(!el) return;
  el.innerHTML = `
  <div class="announce"><span class="dot"></span> Large &amp; In Charge — Free worldwide shipping over $100 <span class="dot"></span></div>
  <header class="site-head">
    <div class="wrap bar">
      <nav class="head-nav">${navLinks(active)}</nav>
      <button class="nav-toggle" aria-label="Menu" onclick="OS.openMnav()"><span></span><span></span><span></span></button>
      <a class="brand" href="index.html">Oliver&nbsp;Samuels<small>The Official Store</small></a>
      <div class="head-tools">
        <a href="contact.html" aria-label="Contact">Contact</a>
        <button class="cart-btn" onclick="OS.openDrawer()" aria-label="Cart">Cart <span class="cart-count" id="cart-count" data-empty="1">0</span></button>
      </div>
    </div>
    <div class="flag-rule"><i></i><i></i><i></i></div>
  </header>
  <div class="mnav" id="mnav">
    <div class="mtop"><span class="brand">Menu</span><button onclick="OS.closeMnav()" aria-label="Close">&times;</button></div>
    ${CATS.map(c=>`<a href="collection.html?cat=${c.key}">${c.label}</a>`).join("")}
    <a href="about.html">About</a><a href="contact.html">Contact</a>
  </div>`;
  renderCartCount();
}
function renderFooter(){
  const el=document.getElementById("site-foot"); if(!el) return;
  el.innerHTML = `
  <footer class="site-foot">
    <div class="wrap">
      <div class="ftop">
        <div class="brandblock">
          <h3>Oliver Samuels</h3>
          <p>The official merchandise store. Fifty years of laughter, made to wear. Designed with love, shipped from yard to the world.</p>
        </div>
        <div><h5>Shop</h5><ul>
          ${CATS.map(c=>`<li><a href="collection.html?cat=${c.key}">${c.label}</a></li>`).join("")}
        </ul></div>
        <div><h5>Info</h5><ul>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="https://www.instagram.com/theofficialoliversamuels/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="#">Terms &amp; Policies</a></li>
        </ul></div>
        <div class="news"><h5>Stay close</h5>
          <p style="font-size:13px;line-height:1.6;margin:0 0 16px;">Get early access to new drops and limited runs.</p>
          <input type="email" placeholder="Email address" aria-label="Email"/>
          <button onclick="OS.toast('Thanks for subscribing!')">Get Access</button>
        </div>
      </div>
      <div class="fbot">
        <div class="fl"><i style="background:var(--jade)"></i><i style="background:var(--gold)"></i><i style="background:#000"></i>
          <small>&nbsp;&nbsp;2026 © Oliver Samuels — made with one love</small></div>
        <small>support@oliversamuels.store</small>
      </div>
    </div>
  </footer>`;
}

async function renderCartCount(){
  const c=document.getElementById("cart-count"); if(!c) return;
  const cart = await getOrCreateCart();
  const q = cart ? cart.totalQuantity : 0;
  c.textContent=q; c.setAttribute("data-empty", q?"0":"1");
}

/* ---------------- Cart drawer ---------------- */
function ensureDrawer(){
  if(document.getElementById("os-drawer")) return;
  const d=document.createElement("div");
  d.innerHTML = `
    <div class="scrim" id="os-scrim" onclick="OS.closeDrawer()"></div>
    <aside class="drawer" id="os-drawer" aria-label="Cart">
      <div class="dh"><h3>Your Cart (<span id="d-qty">0</span>)</h3><button onclick="OS.closeDrawer()">Close</button></div>
      <div class="ditems" id="d-items"></div>
      <div class="dfoot" id="d-foot" hidden>
        <div class="row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <div class="row tot"><span>Subtotal</span><span id="d-total">$0</span></div>
        <button class="co" onclick="OS.goToCheckout()">Checkout</button>
        <div class="note">Secure checkout powered by Shopify</div>
      </div>
    </aside>`;
  document.body.appendChild(d);
}
async function renderDrawer(){
  ensureDrawer();
  const items=document.getElementById("d-items"); if(!items) return;
  const foot=document.getElementById("d-foot");
  const cart = await getOrCreateCart();
  const lines = cart ? cart.lines.edges.map(e=>e.node) : [];
  const qtyEl=document.getElementById("d-qty"); if(qtyEl) qtyEl.textContent = cart ? cart.totalQuantity : 0;
  if(!lines.length){
    items.innerHTML = `<div class="empty"><p>Your cart is empty</p><a class="hero-cta" style="position:static;background:var(--ink);color:#fff;padding:14px 28px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;" href="collection.html?cat=all">Continue Shopping</a></div>`;
    foot.hidden=true; return;
  }
  foot.hidden=false;
  const currency = cart.cost.totalAmount.currencyCode;
  items.innerHTML = lines.map(l=>{
    const m=l.merchandise;
    const opts = (m.selectedOptions||[]).map(o=>`${o.name}: ${o.value}`).join(" / ");
    return `<div class="li">
      <div class="liph">${m.image?`<img src="${m.image.url}" alt=""/>`:""}</div>
      <div>
        <div class="lin">${m.product.title}</div>
        <div class="lis">${opts}</div>
        <div class="liqty"><button onclick="OS.changeQty('${l.id}',${l.quantity-1})">−</button><span>${l.quantity}</span><button onclick="OS.changeQty('${l.id}',${l.quantity+1})">+</button></div>
      </div>
      <div><div class="lip">${money(Number(m.price.amount)*l.quantity, currency)}</div><button class="lirm" onclick="OS.removeLine('${l.id}')">Remove</button></div>
    </div>`;
  }).join("");
  const subtotal = cart.cost.subtotalAmount ? cart.cost.subtotalAmount.amount : cart.cost.totalAmount.amount;
  const totalEl=document.getElementById("d-total"); if(totalEl) totalEl.textContent = money(subtotal, currency);
}
function openDrawer(){ ensureDrawer(); document.getElementById("os-scrim").classList.add("open"); document.getElementById("os-drawer").classList.add("open"); renderDrawer(); }
function closeDrawer(){ const s=document.getElementById("os-scrim"),d=document.getElementById("os-drawer"); if(s)s.classList.remove("open"); if(d)d.classList.remove("open"); }
function openMnav(){ const m=document.getElementById("mnav"); if(m)m.classList.add("open"); }
function closeMnav(){ const m=document.getElementById("mnav"); if(m)m.classList.remove("open"); }

/* ---------------- image-slot helpers ---------------- */
function galleryId(pid,i){ return "img_"+pid+"_"+i; }

/* ---------------- Toast ---------------- */
let toastT;
function toast(msg){
  let t=document.getElementById("os-toast");
  if(!t){ t=document.createElement("div"); t.id="os-toast";
    t.style.cssText="position:fixed;left:50%;bottom:30px;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#fff;padding:14px 24px;border-radius:4px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;z-index:200;opacity:0;transition:.25s ease;pointer-events:none;";
    document.body.appendChild(t); }
  t.textContent=msg; requestAnimationFrame(()=>{ t.style.opacity="1"; t.style.transform="translateX(-50%) translateY(0)"; });
  clearTimeout(toastT); toastT=setTimeout(()=>{ t.style.opacity="0"; t.style.transform="translateX(-50%) translateY(20px)"; },2200);
}

/* ---------------- Card + grid ---------------- */
function cardHTML(p){
  const outOfStock = !p.availableForSale;
  const badge = outOfStock ? `<span class="badge sold">Sold Out</span>` : "";
  const img = p.primaryImage || p.images[0];
  const imgHTML = img
    ? `<img src="${img.url}" alt="${(img.altText||p.title).replace(/"/g,'&quot;')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"/>`
    : `<image-slot id="${galleryId(p.id,0)}" placeholder="${p.title}" fit="cover"></image-slot>`;
  return `<a class="card" href="product.html?id=${encodeURIComponent(p.id)}">
    <div class="ph">
      ${badge}
      ${imgHTML}
      ${outOfStock?"":`<div class="quick">View Product</div>`}
    </div>
    <div class="meta">
      <span class="nm">${p.title}</span>
      <span class="pr">${outOfStock?"Sold Out":money(p.price,p.currency)}</span>
    </div>
  </a>`;
}
function gridHTML(list){ return `<div class="grid">${list.map(cardHTML).join("")}</div>`; }
function loadingHTML(){ return `<p style="padding:50px 0;color:var(--muted);text-align:center;">Loading products&hellip;</p>`; }
function emptyHTML(msg){ return `<p style="padding:50px 0;color:var(--muted);text-align:center;">${msg}</p>`; }

/* ---------------- Page: Home ---------------- */
async function renderHome(){
  renderHeader("");
  const root=document.getElementById("app");
  root.innerHTML = `
    <section class="hero hero--plain">
      <div class="hero-copy">
        <div class="hero-kicker">The Official Store &middot; Est. 1975</div>
        <h1>Fifty Years<br>Of Laughter</h1>
        <p>The official Oliver Samuels collection. Made to wear, straight from yard.</p>
        <a class="hero-cta" href="collection.html?cat=all">Shop the Collection &rarr;</a>
      </div>
    </section>

    <div class="wrap">
      <div class="sec-head">
        <div><div class="sub">New &amp; Featured</div><h2>The Collection</h2></div>
        <a class="viewall" href="collection.html?cat=all">View All</a>
      </div>
      <div id="home-grid">${loadingHTML()}</div>
    </div>

    <div class="wrap">
      <div class="sec-head"><div><div class="sub">Shop by</div><h2>Category</h2></div></div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);padding-bottom:0;">
        ${["tops","bottoms","accessories"].map(k=>{
          const c=CATS.find(x=>x.key===k);
          return `<a class="card" href="collection.html?cat=${k}">
            <div class="ph" style="aspect-ratio:1/1.1;">
              <image-slot id="cat_${k}" placeholder="${c.title}" fit="cover"></image-slot>
              <div class="quick" style="opacity:1;transform:none;background:var(--ink);color:#fff;">${c.title} &rarr;</div>
            </div></a>`;
        }).join("")}
      </div>
    </div>`;
  renderFooter();

  try{
    const products = await fetchProducts(8);
    const el = document.getElementById("home-grid");
    if(!el) return;
    el.outerHTML = products.length ? gridHTML(products) : emptyHTML("New drops coming soon.");
  }catch(e){
    const el = document.getElementById("home-grid");
    if(el) el.innerHTML = emptyHTML("Couldn't load products right now — please refresh.");
  }
}

/* ---------------- Page: Collection ---------------- */
async function renderCollection(){
  const params=new URLSearchParams(location.search);
  const key=params.get("cat")||"all";
  const cat=CATS.find(c=>c.key===key)||CATS[0];
  renderHeader(key);
  const root=document.getElementById("app");
  root.innerHTML = `
    <div class="wrap">
      <div class="coll-head">
        <div class="crumbs"><a href="index.html">Home</a> / ${cat.title}</div>
        <h1>${cat.title}</h1>
        <div class="count" id="coll-count">Loading&hellip;</div>
      </div>
      <div class="coll-filters">
        ${CATS.map(c=>`<a href="collection.html?cat=${c.key}" class="${c.key===key?'active':''}">${c.label}</a>`).join("")}
      </div>
      <div id="coll-grid">${loadingHTML()}</div>
    </div>`;
  document.title = cat.title+" — Oliver Samuels";
  renderFooter();

  try{
    const all = await fetchProducts(50);
    const list = all.filter(p=>matchesCat(p,key));
    const countEl=document.getElementById("coll-count");
    const gridEl=document.getElementById("coll-grid");
    if(!countEl||!gridEl) return;
    countEl.textContent = `${list.length} ${list.length===1?"item":"items"}`;
    gridEl.innerHTML = list.length ? gridHTML(list) : emptyHTML("No products here yet — check back soon.");
  }catch(e){
    const gridEl=document.getElementById("coll-grid");
    if(gridEl) gridEl.innerHTML = emptyHTML("Couldn't load products right now — please refresh.");
  }
}

/* ---------------- Page: Product ---------------- */
let currentProduct = null;
let selectedOptions = {};

async function renderProduct(){
  const params=new URLSearchParams(location.search);
  const handle=params.get("id")||params.get("handle");
  renderHeader("");
  const root=document.getElementById("app");
  root.innerHTML = `<div class="wrap">${loadingHTML()}</div>`;
  renderFooter();

  let p=null;
  try{ p = handle ? await fetchProductByHandle(handle) : null; }catch(e){ p=null; }

  if(!p){
    root.innerHTML = `<div class="wrap"><div class="coll-head"><h1>Product not found</h1><p style="margin-top:14px;"><a href="collection.html?cat=all" style="text-decoration:underline;">Back to shop</a></p></div></div>`;
    return;
  }

  currentProduct = p;
  selectedOptions = {};

  const cat = CATS.find(c=>c.key===p.productType) || CATS[0];
  renderHeader(cat.key==="all" ? "" : cat.key);

  let related=[];
  try{
    const all = await fetchProducts(50);
    related = all.filter(x=>x.id!==p.id && matchesCat(x,p.productType||"all")).slice(0,4);
  }catch(e){ /* non-fatal */ }

  // Per-color mockups: map each colour value to its variant image so the
  // main image can swap when a colour is picked.
  const colorOpt = p.options.find(o=>/colou?r/i.test(o.name));
  const colorImages = {};
  if(colorOpt){
    p.variants.forEach(v=>{
      const cv=v.selectedOptions.find(o=>o.name===colorOpt.name);
      if(cv && v.image && !colorImages[cv.value]) colorImages[cv.value]=v.image.url;
    });
  }
  p._colorOptName = colorOpt ? colorOpt.name : null;
  p._colorImages = colorImages;

  // Tapstitch descriptions are usually a size table + spec dump, not marketing
  // copy — suppress the tagline when the text is clearly chart/spec data so the
  // page doesn't lead with "M L XL 2XL 3XL inch cm...".
  const descText = stripHtml(p.descriptionHtml);
  const looksLikeChart = /\b(inch|cm)\b/i.test(descText.slice(0,60))
    || /^\s*(XS|S|M|L|XL|XXL|2XL|3XL)(\s+(XS|S|M|L|XL|XXL|2XL|3XL))+/i.test(descText);
  const tagline = looksLikeChart ? "" : descText.slice(0,220);

  // Default to a neutral colour (black/white/grey) so the PDP opens on the same
  // mockup shown on the grid, rather than whatever colour Shopify returns first.
  const defaultColor = colorOpt ? pickNeutralColor(colorOpt.values, v=>!!colorImages[v]) : null;
  const mainSrc = (defaultColor && colorImages[defaultColor]) || (p.primaryImage && p.primaryImage.url) || "";

  // Thumbnails double as a colour picker when the product has colours;
  // otherwise fall back to the product's own gallery images.
  const thumbs = colorOpt
    ? colorOpt.values.filter(v=>colorImages[v]).map(v=>({ url:colorImages[v], color:v, label:v }))
    : p.images.slice(1,5).map(img=>({ url:img.url, color:null, label:img.altText||p.title }));

  const galleryHTML = mainSrc ? `
    <img id="pdp-main-img" class="g-main" src="${mainSrc}" alt="${p.title.replace(/"/g,'&quot;')}" style="width:100%;aspect-ratio:4/5;object-fit:cover;background:var(--paper-2);"/>
    <div class="g-thumbs">
      ${thumbs.map(t=>`<button type="button" class="g-thumb${t.color&&t.color===defaultColor?' sel':''}" ${t.color?`data-color="${t.color.replace(/"/g,'&quot;')}" onclick="OS.pickColor(this.getAttribute('data-color'))" title="${t.color.replace(/"/g,'&quot;')}"`:''}>
        <img src="${t.url}" alt="${(t.label||p.title).replace(/"/g,'&quot;')}" loading="lazy"/>
      </button>`).join("")}
    </div>`
    : `<image-slot id="${galleryId(p.id,0)}" class="g-main" placeholder="${p.title} — main" fit="cover"></image-slot>`;

  root.innerHTML = `
    <div class="wrap">
      <div class="pdp">
        <div class="gallery">${galleryHTML}</div>
        <div class="info">
          <div class="crumbs"><a href="index.html">Home</a> / <a href="collection.html?cat=${cat.key}">${cat.title}</a> / ${p.title}</div>
          <h1>${p.title}</h1>
          <div class="price">${money(p.price,p.currency)}${(p.compareAtPrice && p.compareAtPrice>p.price)?` <s>${money(p.compareAtPrice,p.currency)}</s>`:""}</div>
          ${tagline?`<p class="tagline">${tagline}</p>`:""}

          ${p.options.map(opt=>`
            <div class="opt-label">${opt.name}</div>
            <div class="sizes" data-opt="${opt.name}">
              ${opt.values.map(v=>`<button data-opt-name="${opt.name}" data-opt-value="${v.replace(/"/g,'&quot;')}" onclick="OS.pickOption(this)">${v}</button>`).join("")}
            </div>`).join("")}

          <div class="stock" id="pdp-stock"><i></i>${p.options.length?"Select options":(p.availableForSale?"In stock, ready to ship":"Sold out — restock soon")}</div>
          <button class="add-btn" id="add-btn" ${p.options.length?"disabled":(p.availableForSale?"":"disabled")} onclick="OS.tryAdd()">${p.options.length?"Select Options":(p.availableForSale?"Add to Cart":"Sold Out")}</button>

          <div class="accordions">
            <div class="acc open"><button onclick="OS.toggleAcc(this)">Product Details<span class="pm">+</span></button>
              <div class="body"><div class="inner">${p.descriptionHtml || "<p>No details yet.</p>"}</div></div></div>
            <div class="acc"><button onclick="OS.toggleAcc(this)">Shipping &amp; Returns<span class="pm">+</span></button>
              <div class="body"><div class="inner"><p>We ship worldwide. Orders process in 1–3 business days.</p><p>Returns accepted within 14 days of delivery in original condition with tags attached. Final-sale items excluded.</p></div></div></div>
          </div>
        </div>
      </div>

      ${related.length?`<div class="sec-head"><div><div class="sub">More from ${cat.title}</div><h2>You May Also Like</h2></div></div>${gridHTML(related)}`:""}
    </div>`;
  document.title = p.title+" — Oliver Samuels";

  if(defaultColor) pickColor(defaultColor); else updateVariantState();
}

function findMatchingVariant(){
  if(!currentProduct) return null;
  if(currentProduct.options.length===0) return currentProduct.variants[0] || null;
  const needed = currentProduct.options.map(o=>o.name);
  if(needed.some(n=>!selectedOptions[n])) return null;
  return currentProduct.variants.find(v => v.selectedOptions.every(so => selectedOptions[so.name]===so.value)) || null;
}

function updateVariantState(){
  const variant = findMatchingVariant();
  const btn = document.getElementById("add-btn");
  const stock = document.getElementById("pdp-stock");
  if(!btn) return;
  currentProduct._selectedVariant = variant;
  if(!variant){
    btn.disabled = true; btn.textContent = "Select Options"; btn.classList.remove("added");
    if(stock){ stock.className="stock"; stock.innerHTML = "<i></i>Select options"; }
    return;
  }
  if(variant.availableForSale){
    btn.disabled = false; btn.textContent = "Add to Cart";
    if(stock){ stock.className="stock"; stock.innerHTML = "<i></i>In stock, ready to ship"; }
  } else {
    btn.disabled = true; btn.textContent = "Sold Out";
    if(stock){ stock.className="stock out"; stock.innerHTML = "<i></i>Sold out — restock soon"; }
  }
}

/* ---------------- Product interactions ---------------- */
// Selecting a colour swaps the main mockup image and keeps the swatch +
// thumbnail selection in sync. Both the text swatch and the image
// thumbnails call through here so they never disagree.
function pickColor(value){
  const p = currentProduct; if(!p || !p._colorOptName) return;
  selectedOptions[p._colorOptName] = value;
  const main = document.getElementById("pdp-main-img");
  const url = p._colorImages[value];
  if(main && url) main.src = url;
  document.querySelectorAll(`.sizes[data-opt="${p._colorOptName}"] button`).forEach(b=>{
    b.classList.toggle("sel", b.getAttribute("data-opt-value")===value);
  });
  document.querySelectorAll(".g-thumb").forEach(t=>{
    t.classList.toggle("sel", t.getAttribute("data-color")===value);
  });
  updateVariantState();
}

function pickOption(btn){
  const name = btn.getAttribute("data-opt-name");
  const value = btn.getAttribute("data-opt-value");
  if(currentProduct && currentProduct._colorOptName === name){ pickColor(value); return; }
  selectedOptions[name] = value;
  const group = btn.closest(".sizes");
  group.querySelectorAll("button").forEach(b=>b.classList.remove("sel"));
  btn.classList.add("sel");
  updateVariantState();
}

async function tryAdd(){
  const variant = currentProduct && currentProduct._selectedVariant;
  if(!variant){ toast("Please select options"); return; }
  const b=document.getElementById("add-btn");
  const prevText=b.textContent;
  b.disabled=true; b.textContent="Adding…";
  try{
    await addToCart(variant.id, 1);
    b.classList.add("added"); b.textContent="Added ✓";
    openDrawer();
    setTimeout(()=>{ b.classList.remove("added"); b.textContent="Add to Cart"; b.disabled=false; },1400);
  }catch(e){
    toast("Couldn't add to cart — try again");
    b.textContent=prevText; b.disabled=false;
  }
}

function toggleAcc(btn){ btn.parentElement.classList.toggle("open"); }
function openAcc(id){ const a=document.getElementById(id); if(a){ a.classList.add("open"); } }

/* ---------------- Boot ---------------- */
window.OS = { renderHome, renderCollection, renderProduct, openDrawer, closeDrawer,
  openMnav, closeMnav, changeQty, removeLine, pickOption, pickColor, tryAdd, toggleAcc, openAcc, toast,
  renderHeader, renderFooter, goToCheckout };

})();
