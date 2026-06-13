/* ============================================================
   OLIVER SAMUELS store engine — data, chrome, cart, renderers
   ============================================================ */
(function(){
"use strict";

/* ---------------- Catalog ---------------- */
// Patois phrases used are common Jamaican cultural expressions.
const P = [
  // ---- TOPS ----
  { id:"oliver-logo-tee-black", cat:"tops", name:"OLIVER Logo Tee", color:"Black", price:45, badge:"new",
    tag:"Heavyweight cotton tee with the signature OLIVER script across the chest. The everyday classic.",
    sizes:["S","M","L","XL","XXL"], details:["100% heavyweight cotton, 220 g/m²","Relaxed unisex fit","Embroidered OLIVER script","Ribbed crew neck","Pre-washed for softness"] },
  { id:"oliver-logo-tee-white", cat:"tops", name:"OLIVER Logo Tee", color:"White", price:45,
    tag:"The OLIVER script in jade and gold on a clean white body. A wardrobe staple, yard-style.",
    sizes:["S","M","L","XL","XXL"], details:["100% heavyweight cotton, 220 g/m²","Relaxed unisex fit","Jade & gold embroidered script","Ribbed crew neck","Pre-washed for softness"] },
  { id:"likkle-more-tee", cat:"tops", name:"LIKKLE MORE Tee", color:"Bone", price:48, badge:"new",
    tag:"\u201CLikkle more\u201D \u2014 the warmest way to say see you later. Puff-print across the back.",
    sizes:["S","M","L","XL","XXL"], details:["100% cotton, 240 g/m²","Boxy oversized fit","Back puff-print graphic","Chest crest detail","Unisex"] },
  { id:"big-up-tee", cat:"tops", name:"BIG UP YUHSELF Tee", color:"Black", price:48,
    tag:"A little encouragement goes far. Bold type, gold ink, big energy.",
    sizes:["S","M","L","XL","XXL"], details:["100% cotton, 240 g/m²","Boxy oversized fit","Gold discharge print","Dropped shoulders","Unisex"] },
  { id:"oliver-at-large-longsleeve", cat:"tops", name:"OLIVER AT LARGE Longsleeve", color:"Cream", price:62, badge:"new",
    tag:"A tribute longsleeve to five decades on stage. Sleeve-printed tour-style graphic.",
    sizes:["S","M","L","XL","XXL"], details:["100% cotton, 260 g/m²","Relaxed fit","Sleeve & back print","Ribbed cuffs","Unisex"] },
  { id:"irie-tank", cat:"tops", name:"IRIE Tank Top", color:"White", price:38,
    tag:"Everything irie. A breezy ribbed tank for warm days and warmer laughs.",
    sizes:["XS","S","M","L","XL"], details:["95% cotton / 5% elastane rib","Fitted tank","Tonal chest embroidery","Scooped neckline"] },
  { id:"fifty-years-tee", cat:"tops", name:"50 YEARS Anniversary Tee", color:"Black", price:52, badge:"new",
    tag:"Fifty years of laughter, commemorated. Numbered anniversary graphic in flag colours.",
    sizes:["S","M","L","XL","XXL"], details:["100% cotton, 240 g/m²","Relaxed unisex fit","Commemorative front graphic","Flag-stripe sleeve hit","Limited run"] },
  { id:"yard-style-tee", cat:"tops", name:"YARD STYLE Tee", color:"Forest", price:48,
    tag:"Forest-green tee with a vintage washed crest. Straight from the yard.",
    sizes:["S","M","L","XL","XXL"], details:["100% cotton, 240 g/m²","Garment-dyed forest green","Vintage washed crest","Boxy fit","Unisex"] },

  // ---- BOTTOMS ----
  { id:"oliver-sweatpants", cat:"bottoms", name:"OLIVER Sweatpants", color:"Black", price:80, badge:"new",
    tag:"Heavyweight fleece sweatpants with embroidered leg script. Tapered and comfortable.",
    sizes:["S","M","L","XL","XXL"], details:["80% cotton / 20% poly fleece, 380 g/m²","Tapered fit","Embroidered leg script","Elastic waist + drawcord","Cuffed ankle"] },
  { id:"irie-track-pants", cat:"bottoms", name:"IRIE Track Pants", color:"Black/Gold", price:85,
    tag:"Track pants with a gold side-stripe. Court to street, no problem.",
    sizes:["S","M","L","XL","XXL"], details:["Recycled poly tricot","Relaxed straight leg","Gold woven side taping","Zip ankle","Side pockets"] },
  { id:"yard-shorts", cat:"bottoms", name:"YARD Sweat Shorts", color:"Heather", price:55,
    tag:"Mid-length fleece shorts in heather grey. Easy living, all summer.",
    sizes:["S","M","L","XL","XXL"], details:["Cotton-rich fleece, 340 g/m²","7\u2033 inseam","Embroidered hem logo","Elastic drawcord waist","Side pockets"] },
  { id:"patois-lounge-pants", cat:"bottoms", name:"PATOIS Lounge Pants", color:"Sand", price:75,
    tag:"Soft woven lounge pants with an all-over patois word-print. Pure comfort.",
    sizes:["XS","S","M","L","XL"], details:["100% brushed cotton twill","Relaxed wide leg","All-over tonal word-print","Elastic + tie waist","Unisex"] },
  { id:"classic-sweatshorts", cat:"bottoms", name:"CLASSIC Sweatshorts", color:"Black", price:55,
    tag:"The plain black short, done right. Clean embroidery, perfect weight.",
    sizes:["S","M","L","XL","XXL"], details:["Cotton-rich fleece, 340 g/m²","8\u2033 inseam","Tonal embroidered logo","Elastic drawcord waist","Side pockets"] },

  // ---- ACCESSORIES ----
  { id:"oliver-dad-hat", cat:"accessories", name:"OLIVER Dad Hat", color:"Black", price:35, badge:"new",
    tag:"Low-profile cotton cap with a clean embroidered OLIVER. Adjustable strap.",
    sizes:["One Size"], details:["100% brushed cotton twill","Low unstructured profile","Front embroidery","Adjustable metal buckle"] },
  { id:"irie-bucket-hat", cat:"accessories", name:"IRIE Bucket Hat", color:"Forest", price:40,
    tag:"Reversible bucket hat \u2014 forest green one side, flag-stripe lining the other.",
    sizes:["S/M","L/XL"], details:["100% cotton","Reversible construction","Embroidered eyelets","Flag-stripe inner"] },
  { id:"yard-tote", cat:"accessories", name:"YARD Canvas Tote", color:"Natural", price:30,
    tag:"Heavy natural canvas tote with a screen-printed crest. Carries everything.",
    sizes:["One Size"], details:["16 oz natural cotton canvas","42 \u00d7 38 cm","Screen-printed crest","Reinforced handles"] },
  { id:"oliver-enamel-mug", cat:"accessories", name:"OLIVER Enamel Mug", color:"White/Jade", price:25,
    tag:"Camp-style enamel mug for morning coffee and evening reruns.",
    sizes:["One Size"], details:["Enamel-coated steel","350 ml","Jade rim","Hand-wash recommended"] },
  { id:"likkle-more-pins", cat:"accessories", name:"LIKKLE MORE Pin Set", color:"Multi", price:15,
    tag:"Set of three hard-enamel pins \u2014 flag, crest, and the word itself.",
    sizes:["One Size"], details:["Set of 3 hard-enamel pins","Gold-plated finish","Rubber backings","Collector card included"] },
  { id:"oliver-keychain", cat:"accessories", name:"OLIVER Keychain", color:"Gold", price:12,
    tag:"Die-cast gold-tone keychain with the OLIVER monogram.",
    sizes:["One Size"], details:["Die-cast zinc alloy","Gold-tone finish","Split ring + clasp"] },
  { id:"fifty-years-poster", cat:"accessories", name:"50 YEARS Print", color:"\u2014", price:20,
    tag:"A2 commemorative art print celebrating five decades. Ships in a tube.",
    sizes:["A2"], soldout:true, details:["A2 (42 \u00d7 59.4 cm)","200 gsm matte stock","Archival inks","Ships rolled in a tube"] },
];

const CATS = [
  { key:"all", label:"All", title:"All Products" },
  { key:"tops", label:"Tops", title:"Tops" },
  { key:"bottoms", label:"Bottoms", title:"Bottoms" },
  { key:"accessories", label:"Accessories", title:"Accessories" },
];

const money = n => "$"+Number(n).toFixed(0);
const byId = id => P.find(p=>p.id===id);
const inCat = key => key==="all" ? P : P.filter(p=>p.cat===key);

/* ---------------- Cart (localStorage) ---------------- */
const CART_KEY = "os_cart_v1";
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY))||[]; }catch(e){ return []; } }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartCount(); renderDrawer(); }
function cartQty(){ return getCart().reduce((n,l)=>n+l.qty,0); }
function cartTotal(){ return getCart().reduce((n,l)=>{ const p=byId(l.id); return n+(p?p.price*l.qty:0); },0); }
function addToCart(id,size){
  const c=getCart(); const k=c.find(l=>l.id===id&&l.size===size);
  if(k) k.qty++; else c.push({id,size,qty:1});
  setCart(c); openDrawer();
}
function changeQty(id,size,d){
  let c=getCart(); const k=c.find(l=>l.id===id&&l.size===size);
  if(!k) return; k.qty+=d; if(k.qty<=0) c=c.filter(l=>!(l.id===id&&l.size===size));
  setCart(c);
}
function removeLine(id,size){ setCart(getCart().filter(l=>!(l.id===id&&l.size===size))); }

/* ---------------- Chrome: header, drawer, footer ---------------- */
function navLinks(active){
  return CATS.map(c=>`<a href="collection.html?cat=${c.key}" class="${active===c.key?'active':''}">${c.label}</a>`).join("")
    + `<a href="about.html" class="${active==='about'?'active':''}">About</a>`;
}
function renderHeader(active){
  const el=document.getElementById("site-head"); if(!el) return;
  el.innerHTML = `
  <div class="announce"><span class="dot"></span> Large &amp; In Charge \u2014 Free worldwide shipping over $100 <span class="dot"></span></div>
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
          <small>&nbsp;&nbsp;2026 \u00A9 Oliver Samuels \u2014 made with one love</small></div>
        <small>support@oliversamuels.store</small>
      </div>
    </div>
  </footer>`;
}

function renderCartCount(){
  const c=document.getElementById("cart-count"); if(!c) return;
  const q=cartQty(); c.textContent=q; c.setAttribute("data-empty", q?"0":"1");
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
        <div class="row"><span>Shipping</span><span id="d-ship">\u2014</span></div>
        <div class="row tot"><span>Subtotal</span><span id="d-total">$0</span></div>
        <button class="co" onclick="OS.toast('This is a demo store \u2014 checkout coming soon!')">Checkout</button>
        <div class="note">Free worldwide shipping over $100</div>
      </div>
    </aside>`;
  document.body.appendChild(d);
}
function renderDrawer(){
  ensureDrawer();
  const items=document.getElementById("d-items"); if(!items) return;
  const c=getCart();
  document.getElementById("d-qty").textContent=cartQty();
  const foot=document.getElementById("d-foot");
  if(!c.length){
    items.innerHTML = `<div class="empty"><p>Your cart is empty</p><a class="hero-cta" style="position:static;background:var(--ink);color:#fff;padding:14px 28px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;" href="collection.html?cat=all">Continue Shopping</a></div>`;
    foot.hidden=true; return;
  }
  foot.hidden=false;
  items.innerHTML = c.map(l=>{
    const p=byId(l.id); if(!p) return "";
    const img=slotImg(galleryId(p.id,0));
    return `<div class="li">
      <div class="liph">${img?`<img src="${img}" alt=""/>`:""}</div>
      <div>
        <div class="lin">${p.name}${p.color&&p.color!=="\u2014"?` <span style="color:var(--muted);font-weight:400;">/ ${p.color}</span>`:""}</div>
        <div class="lis">Size: ${l.size}</div>
        <div class="liqty"><button onclick="OS.changeQty('${l.id}','${l.size}',-1)">\u2212</button><span>${l.qty}</span><button onclick="OS.changeQty('${l.id}','${l.size}',1)">+</button></div>
      </div>
      <div><div class="lip">${money(p.price*l.qty)}</div><button class="lirm" onclick="OS.removeLine('${l.id}','${l.size}')">Remove</button></div>
    </div>`;
  }).join("");
  const tot=cartTotal();
  document.getElementById("d-total").textContent=money(tot);
  document.getElementById("d-ship").textContent = tot>=100 ? "Free" : "$20";
}
function openDrawer(){ ensureDrawer(); renderDrawer(); document.getElementById("os-scrim").classList.add("open"); document.getElementById("os-drawer").classList.add("open"); }
function closeDrawer(){ const s=document.getElementById("os-scrim"),d=document.getElementById("os-drawer"); if(s)s.classList.remove("open"); if(d)d.classList.remove("open"); }
function openMnav(){ const m=document.getElementById("mnav"); if(m)m.classList.add("open"); }
function closeMnav(){ const m=document.getElementById("mnav"); if(m)m.classList.remove("open"); }

/* ---------------- image-slot helpers ---------------- */
function galleryId(pid,i){ return "img_"+pid+"_"+i; }
// read a filled slot's persisted dataURL (best-effort) for cart thumbnails
function slotImg(id){
  try{
    const el=document.querySelector(`image-slot[id="${id}"]`);
    if(el && el.shadowRoot){ const im=el.shadowRoot.querySelector("img"); if(im&&im.src) return im.src; }
  }catch(e){}
  return null;
}

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
  const badge = p.soldout ? `<span class="badge sold">Sold Out</span>`
    : p.badge==="new" ? `<span class="badge new">New</span>` : "";
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="ph">
      ${badge}
      <image-slot id="${galleryId(p.id,0)}" placeholder="${p.name}" fit="cover"></image-slot>
      ${p.soldout?"":`<div class="quick">View Product</div>`}
    </div>
    <div class="meta">
      <span class="nm">${p.name}${p.color&&p.color!=="\u2014"?` \u2014 ${p.color}`:""}</span>
      <span class="pr">${p.soldout?"Sold Out":money(p.price)}</span>
    </div>
  </a>`;
}
function gridHTML(list){ return `<div class="grid">${list.map(cardHTML).join("")}</div>`; }

/* ---------------- Page: Home ---------------- */
function renderHome(){
  renderHeader(""); 
  const root=document.getElementById("app");
  const featured = P.filter(p=>p.badge==="new").slice(0,8);
  const fill = P.filter(p=>!featured.includes(p)).slice(0,8-featured.length);
  const home = [...featured, ...fill].slice(0,8);
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
      ${gridHTML(home)}
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
}

/* ---------------- Page: Collection ---------------- */
function renderCollection(){
  const params=new URLSearchParams(location.search);
  const key=params.get("cat")||"all";
  const cat=CATS.find(c=>c.key===key)||CATS[0];
  renderHeader(key);
  const list=inCat(key);
  const root=document.getElementById("app");
  root.innerHTML = `
    <div class="wrap">
      <div class="coll-head">
        <div class="crumbs"><a href="index.html">Home</a> / ${cat.title}</div>
        <h1>${cat.title}</h1>
        <div class="count">${list.length} ${list.length===1?"item":"items"}</div>
      </div>
      <div class="coll-filters">
        ${CATS.map(c=>`<a href="collection.html?cat=${c.key}" class="${c.key===key?'active':''}">${c.label}</a>`).join("")}
      </div>
      ${gridHTML(list)}
    </div>`;
  document.title = cat.title+" \u2014 Oliver Samuels";
  renderFooter();
}

/* ---------------- Page: Product ---------------- */
function renderProduct(){
  const params=new URLSearchParams(location.search);
  const p=byId(params.get("id"))||P[0];
  renderHeader(p.cat);
  const cat=CATS.find(c=>c.key===p.cat);
  const root=document.getElementById("app");
  const related=inCat(p.cat).filter(x=>x.id!==p.id).slice(0,4);
  root.innerHTML = `
    <div class="wrap">
      <div class="pdp">
        <div class="gallery">
          <image-slot id="${galleryId(p.id,0)}" class="g-main" placeholder="${p.name} \u2014 main" fit="cover"></image-slot>
          <image-slot id="${galleryId(p.id,1)}" class="g-sub" placeholder="Detail" fit="cover"></image-slot>
          <image-slot id="${galleryId(p.id,2)}" class="g-sub" placeholder="Back" fit="cover"></image-slot>
          <image-slot id="${galleryId(p.id,3)}" class="g-sub" placeholder="On model" fit="cover"></image-slot>
          <image-slot id="${galleryId(p.id,4)}" class="g-sub" placeholder="Flat lay" fit="cover"></image-slot>
        </div>
        <div class="info">
          <div class="crumbs"><a href="index.html">Home</a> / <a href="collection.html?cat=${p.cat}">${cat.title}</a> / ${p.name}</div>
          <h1>${p.name}${p.color&&p.color!=="\u2014"?` <span style="color:var(--muted);">[${p.color}]</span>`:""}</h1>
          <div class="price">${money(p.price)}</div>
          <p class="tagline">${p.tag}</p>

          <div class="opt-label">Size <a onclick="OS.openAcc('acc-size');return false;" href="#">Size guide</a></div>
          <div class="sizes" id="sizes">
            ${p.sizes.map((s,i)=>`<button data-size="${s}" ${p.soldout?'disabled':''} onclick="OS.pickSize(this)">${s}</button>`).join("")}
          </div>

          <div class="stock ${p.soldout?'out':''}"><i></i>${p.soldout?"Sold out \u2014 restock soon":"In stock, ready to ship"}</div>
          <button class="add-btn" id="add-btn" ${p.soldout?'disabled':''} onclick="OS.tryAdd('${p.id}')">${p.soldout?"Sold Out":"Add to Cart"}</button>

          <div class="accordions">
            <div class="acc open"><button onclick="OS.toggleAcc(this)">Product Details<span class="pm">+</span></button>
              <div class="body"><div class="inner"><ul>${p.details.map(d=>`<li>${d}</li>`).join("")}</ul></div></div></div>
            <div class="acc" id="acc-size"><button onclick="OS.toggleAcc(this)">Size Guide<span class="pm">+</span></button>
              <div class="body"><div class="inner">${sizeGuide(p)}</div></div></div>
            <div class="acc"><button onclick="OS.toggleAcc(this)">Shipping &amp; Returns<span class="pm">+</span></button>
              <div class="body"><div class="inner"><p>We ship worldwide \u2014 flat $20, free over $100. Orders process in 1\u20133 business days; most arrive within 10 business days.</p><p>Returns accepted within 14 days of delivery in original condition with tags attached. Final-sale items excluded.</p></div></div></div>
          </div>
        </div>
      </div>

      ${related.length?`<div class="sec-head"><div><div class="sub">More from ${cat.title}</div><h2>You May Also Like</h2></div></div>${gridHTML(related)}`:""}
    </div>`;
  document.title = p.name+" \u2014 Oliver Samuels";
  renderFooter();
}
function sizeGuide(p){
  if(p.cat==="accessories") return `<p>One size unless noted. See product details for measurements.</p>`;
  const rows = p.cat==="bottoms"
    ? [["S","28\u201330","40"],["M","31\u201333","42"],["L","34\u201336","44"],["XL","37\u201339","46"],["XXL","40\u201342","48"]]
    : [["S","18\u201320","27"],["M","21\u201322","28"],["L","23\u201324","29"],["XL","25\u201326","30"],["XXL","27\u201328","31"]];
  const head = p.cat==="bottoms" ? ["Size","Waist (in)","EU"] : ["Size","Chest (in)","Length (in)"];
  return `<table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
    ${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <p style="margin-top:14px;">Model is 6'0\u201D (183cm) wearing size L. Measurements are approximate.</p>`;
}

/* ---------------- Product interactions ---------------- */
let selectedSize=null;
function pickSize(btn){
  selectedSize=btn.getAttribute("data-size");
  document.querySelectorAll("#sizes button").forEach(b=>b.classList.remove("sel"));
  btn.classList.add("sel");
}
function tryAdd(id){
  if(!selectedSize){ toast("Please select a size"); 
    const sz=document.getElementById("sizes"); if(sz){ sz.animate([{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:300}); } return; }
  addToCart(id, selectedSize);
  const b=document.getElementById("add-btn"); b.classList.add("added"); b.textContent="Added \u2713";
  setTimeout(()=>{ b.classList.remove("added"); b.textContent="Add to Cart"; },1400);
}
function toggleAcc(btn){ btn.parentElement.classList.toggle("open"); }
function openAcc(id){ const a=document.getElementById(id); if(a){ a.classList.add("open"); a.scrollIntoView?null:null; } }

/* ---------------- Boot ---------------- */
window.OS = { renderHome, renderCollection, renderProduct, openDrawer, closeDrawer,
  openMnav, closeMnav, changeQty, removeLine, pickSize, tryAdd, toggleAcc, openAcc, toast,
  renderHeader, renderFooter };

})();
