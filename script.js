const products = [
  { title: "We Go Far T-Shirt", price: 80, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
  { title: "Spiked Zip-Up Hoodie", price: 270, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
  { title: "Miss Longsleeve", price: 90, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80" },
  { title: "White Hoodie", price: 190, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80" },
  { title: "Air Hooded Shirt", price: 190, img: "https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=80" },
  { title: "Bootcut Jeans", price: 170, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" },
  { title: "Cortex Grunge Sweater", price: 170, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80" },
  { title: "Star Knit Top", price: 190, img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80" },
  { title: "Spiked Slim Zip-Up", price: 240, img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80" },
  { title: "Miss Shirt", price: 190, img: "https://images.unsplash.com/photo-1485518882345-15568b007407?w=600&q=80" },
  { title: "Layered Sweatpants", price: 190, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80" },
  { title: "Hit T-Shirt", price: 80, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80" },
  { title: "Wool Sweater", price: 220, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80" },
  { title: "Track Pants", price: 140, img: "https://images.unsplash.com/photo-1565693413579-8a73fcc2c0a4?w=600&q=80" },
  { title: "Yuan Belt", price: 80, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80" },
  { title: "Trench Coat", price: 220, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80" },
  { title: "Fire Jacket", price: 260, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
  { title: "Layered Sweatshirt", price: 190, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
  { title: "I ♥ NY T-Shirt", price: 80, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80" },
  { title: "Cortex Sweater (Black)", price: 170, img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80" },
  { title: "Basic Sweatpants", price: 170, img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80" },
  { title: "We Go Far Tee", price: 80, img: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80" },
  { title: "Spiked Zip-Up Hoodie", price: 270, img: "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=600&q=80" },
  { title: "MF Knit Polo", price: 120, img: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=80" },
  { title: "Joy-Love-Pain Tank", price: 60, img: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80" },
  { title: "Pinstripe Zip-Up Hoodie", price: 290, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80" },
  { title: "Spiked Bracelet", price: null, sold: true, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80" },
  { title: "Cortex Grunge Sweater", price: 170, img: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=80" },
  { title: "Striped Track Pants", price: 220, img: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80" },
  { title: "Mad Knit T-Shirt", price: 90, img: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80" },
  { title: "Long Distance Hat", price: 40, img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80" },
  { title: "Spiked Slim Zip-Up", price: 240, img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80" },
  { title: "Spiked Wallet Chain", price: 70, img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80" },
  { title: "Tailored Shorts", price: 140, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80" },
  { title: "Camo Bag", price: 160, img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80" },
  { title: "Pads Knit Top", price: 170, img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=80" },
  { title: "Oversized Hooded", price: 320, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
  { title: "Spiked Lollipop (Charm)", price: null, sold: true, img: "https://images.unsplash.com/photo-1582450871972-aba8af446b03?w=600&q=80" },
  { title: "Petrol Head Longsleeve", price: 120, img: "https://images.unsplash.com/photo-1485518882345-15568b007407?w=600&q=80" },
  { title: "Mad Blazer", price: 190, img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
  { title: "Striped Track Jacket", price: 240, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
  { title: "Pinstripe Sweatpants", price: 240, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80" },
  { title: "We Go Far Keychain", price: 15, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80" },
  { title: "Mask Knit Hoodie", price: 170, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80" }
];

const grid = document.getElementById('productGrid');
grid.innerHTML = products.map(p => `
  <a href="#" class="product-card">
    <div class="product-card__image" style="background-image:url('${p.img}')"></div>
    <p class="product-card__title">${p.title}</p>
    <p class="product-card__price ${p.sold ? 'product-card__price--sold' : ''}">${p.sold ? 'Sold Out' : '$' + p.price}</p>
  </a>
`).join('');

// Discount popup
const popup = document.createElement('div');
popup.className = 'discount-popup';
popup.innerHTML = `
  <button aria-label="close">×</button>
  <span>Get 10% OFF!</span>
  <span class="arrow">→</span>
`;
document.body.appendChild(popup);
popup.querySelector('button').onclick = () => popup.remove();
