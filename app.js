const PRODUCTS = [
  {
    id: "sig-runner",
    name: "Signature Runner",
    price: 119,
    color: "white",
    logoType: "patch",
    material: "Leer",
    comfort: "Cloud sole",
    desc: "Lichtgewicht runner met premium logo patch. Perfect voor events en daily wear."
  },
  {
    id: "city-low",
    name: "City Low",
    price: 109,
    color: "black",
    logoType: "emboss",
    material: "Vegan",
    comfort: "Flex foam",
    desc: "Minimalistische low-top met subtiele emboss branding. Strak en zakelijk."
  },
  {
    id: "studio-mid",
    name: "Studio Mid",
    price: 129,
    color: "sand",
    logoType: "stitch",
    material: "Suède mix",
    comfort: "Cushion collar",
    desc: "Mid-top met borduur logo. Extra support rond de enkel, premium look."
  },
  {
    id: "board-pro",
    name: "Board Pro",
    price: 99,
    color: "navy",
    logoType: "patch",
    material: "Canvas",
    comfort: "Grip sole",
    desc: "Skate geïnspireerd, stevige zool. Logo patch valt mooi op zonder te schreeuwen."
  },
  {
    id: "exec-derby",
    name: "Executive Derby",
    price: 139,
    color: "black",
    logoType: "emboss",
    material: "Leer",
    comfort: "Soft insole",
    desc: "Nettere sneaker-derby hybride. Emboss branding aan de zijkant of tong."
  },
  {
    id: "mono-knit",
    name: "Mono Knit",
    price: 115,
    color: "white",
    logoType: "stitch",
    material: "Knit",
    comfort: "Breathable",
    desc: "Super ademend knit upper met geborduurd mini-logo. Ideaal voor warme dagen."
  }
];

const $ = (q) => document.querySelector(q);

const grid = $("#productGrid");
const search = $("#search");
const filterType = $("#filterType");
const filterColor = $("#filterColor");

const modal = $("#productModal");
const modalBody = $("#modalBody");

const cartDrawer = $("#cartDrawer");
const cartCount = $("#cartCount");
const cartItems = $("#cartItems");
const cartTotal = $("#cartTotal");

const THEME_KEY = "lk_theme";
const CART_KEY = "lk_cart";

function euro(n){
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

function loadTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === "light" || saved === "dark"){
    document.documentElement.dataset.theme = saved;
  }
}
function toggleTheme(){
  const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}

function getCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  }catch{
    return {};
  }
}
function setCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}
function addToCart(productId){
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + 1;
  setCart(cart);
  openCart();
}
function changeQty(productId, delta){
  const cart = getCart();
  const next = (cart[productId] || 0) + delta;
  if(next <= 0) delete cart[productId];
  else cart[productId] = next;
  setCart(cart);
}
function removeItem(productId){
  const cart = getCart();
  delete cart[productId];
  setCart(cart);
}

function filteredProducts(){
  const q = (search.value || "").trim().toLowerCase();
  const t = filterType.value;
  const c = filterColor.value;

  return PRODUCTS.filter(p => {
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.logoType.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q);

    const matchesT = t === "all" || p.logoType === t;
    const matchesC = c === "all" || p.color === c;

    return matchesQ && matchesT && matchesC;
  });
}

function tagForLogoType(type){
  if(type === "patch") return "Patch logo";
  if(type === "emboss") return "Emboss";
  if(type === "stitch") return "Borduur";
  return type;
}

function colorLabel(color){
  return ({ white: "Wit", black: "Zwart", sand: "Sand", navy: "Navy" }[color] || color);
}

function renderGrid(){
  const items = filteredProducts();

  grid.innerHTML = items.map(p => `
    <article class="card product">
      <div class="product__img">
        <div class="product__tag">${tagForLogoType(p.logoType)}</div>
      </div>
      <div class="product__body">
        <div>
          <div class="product__title">${p.name}</div>
          <div class="product__meta">
            <span class="kbd">${colorLabel(p.color)}</span>
            <span class="kbd">${p.material}</span>
            <span class="kbd">${p.comfort}</span>
          </div>
        </div>

        <div class="product__row">
          <div class="price">${euro(p.price)}</div>
          <div class="product__actions">
            <button class="btn btn--small" data-view="${p.id}">Details</button>
            <button class="btn btn--primary btn--small" data-add="${p.id}">In winkelwagen</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => openProduct(btn.dataset.view));
  });
  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function openProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;

  modalBody.innerHTML = `
    <div class="modal__img" aria-hidden="true"></div>
    <div class="modal__info">
      <h3 id="modalTitle">${p.name}</h3>
      <p>${p.desc}</p>

      <div class="modal__chips">
        <span class="chip">${tagForLogoType(p.logoType)}</span>
        <span class="chip">${colorLabel(p.color)}</span>
        <span class="chip">${p.material}</span>
        <span class="chip">${p.comfort}</span>
      </div>

      <div class="modal__row">
        <div class="price">${euro(p.price)}</div>
        <button class="btn btn--primary" id="modalAdd">In winkelwagen</button>
      </div>

      <p class="tiny muted" style="margin-top:10px">
        Demo: voeg later echte productfoto’s toe en render ze vanuit <code>assets/shoes/</code>.
      </p>
    </div>
  `;

  $("#modalAdd").addEventListener("click", () => addToCart(p.id));
  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden", "true");
}

function openCart(){
  cartDrawer.classList.add("isOpen");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart(){
  cartDrawer.classList.remove("isOpen");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function renderCart(){
  const cart = getCart();
  const entries = Object.entries(cart);
  const count = entries.reduce((sum, [,qty]) => sum + qty, 0);
  cartCount.textContent = String(count);

  if(entries.length === 0){
    cartItems.innerHTML = `<p class="muted">Je winkelwagen is leeg.</p>`;
    cartTotal.textContent = euro(0);
    return;
  }

  let total = 0;

  cartItems.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) return "";
    const line = p.price * qty;
    total += line;

    return `
      <div class="cartItem">
        <div>
          <div class="cartItem__title">${p.name}</div>
          <div class="cartItem__meta">${tagForLogoType(p.logoType)} · ${colorLabel(p.color)}</div>
          <div class="cartItem__meta"><strong>${euro(p.price)}</strong> per paar</div>
        </div>
        <div class="cartItem__actions">
          <button class="qtyBtn" data-dec="${id}" aria-label="Minder">−</button>
          <div class="qty">${qty}</div>
          <button class="qtyBtn" data-inc="${id}" aria-label="Meer">+</button>
          <button class="removeBtn" data-rm="${id}" aria-label="Verwijderen">Verwijder</button>
        </div>
      </div>
    `;
  }).join("");

  cartTotal.textContent = euro(total);

  cartItems.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
  cartItems.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.inc, +1)));
  cartItems.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => removeItem(b.dataset.rm)));
}

function setupEvents(){
  search.addEventListener("input", renderGrid);
  filterType.addEventListener("change", renderGrid);
  filterColor.addEventListener("change", renderGrid);

  $("#openCart").addEventListener("click", openCart);

  modal.addEventListener("click", (e) => {
    const el = e.target;
    if(el && el.dataset && el.dataset.close === "true") closeModal();
  });

  cartDrawer.addEventListener("click", (e) => {
    const el = e.target;
    if(el && el.dataset && el.dataset.close === "true") closeCart();
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeModal();
      closeCart();
    }
  });

  $("#themeToggle").addEventListener("click", toggleTheme);

  $("#checkoutBtn").addEventListener("click", () => {
    const cart = getCart();
    const count = Object.values(cart).reduce((s,n) => s+n, 0);
    if(count === 0){
      alert("Je winkelwagen is leeg.");
      return;
    }
    alert("Demo checkout ✅\nKoppel hier later een echte betaalprovider (bv. Stripe).");
  });

  $("#quoteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("#quoteStatus");
    status.textContent = "Dank! Demo: versturen is nog niet gekoppeld (koppel bv. Formspree / Netlify Forms).";
    e.target.reset();
  });

  $("#year").textContent = String(new Date().getFullYear());
}

function init(){
  loadTheme();
  if(!document.documentElement.dataset.theme){
    document.documentElement.dataset.theme = "dark";
  }
  setupEvents();
  renderGrid();
  renderCart();
}

init();