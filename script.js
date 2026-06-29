const products = [
  {
    id: "set-boca-nino",
    name: "Set Boca nino",
    category: "Conjuntos",
    tags: ["Clubes", "Boca"],
    description: "Camiseta, short y medias.",
    price: 42900,
    image: "assets/set-boca-nino.jpg",
  },
  {
    id: "conjunto-boca-azul",
    name: "Conjunto Boca azul",
    category: "Conjuntos",
    tags: ["Clubes", "Boca"],
    description: "Campera con capucha y pantalon.",
    price: 54900,
    image: "assets/conjunto-boca-azul.jpg",
  },
  {
    id: "set-river-nino",
    name: "Set River nino",
    category: "Conjuntos",
    tags: ["Clubes", "River"],
    description: "Camiseta, short y medias.",
    price: 42900,
    image: "assets/set-river-nino.jpg",
  },
  {
    id: "conjunto-boca-blanco",
    name: "Conjunto Boca blanco",
    category: "Conjuntos",
    tags: ["Clubes", "Boca"],
    description: "Campera clara y pantalon deportivo.",
    price: 54900,
    image: "assets/conjunto-boca-blanco.jpg",
  },
  {
    id: "set-racing-nino",
    name: "Set Racing nino",
    category: "Conjuntos",
    tags: ["Clubes", "Racing"],
    description: "Camiseta, short y medias.",
    price: 42900,
    image: "assets/set-racing-nino.jpg",
  },
  {
    id: "set-al-nassr-nino",
    name: "Set Al Nassr nino",
    category: "Conjuntos",
    tags: ["Clubes", "Al Nassr"],
    description: "Camiseta, short y medias.",
    price: 42900,
    image: "assets/set-al-nassr-nino.jpg",
  },
  {
    id: "camiseta-argentina-10",
    name: "Camiseta Argentina 10",
    category: "Camisetas",
    tags: ["Selecciones", "Argentina"],
    description: "Modelo titular celeste y blanco.",
    price: 34900,
    image: "assets/camiseta-argentina-10.jpg",
  },
  {
    id: "camiseta-argentina-negra",
    name: "Camiseta Argentina negra",
    category: "Camisetas",
    tags: ["Selecciones", "Argentina"],
    description: "Modelo alternativo con detalles azules.",
    price: 34900,
    image: "assets/camiseta-argentina-negra.jpg",
  },
  {
    id: "camiseta-argentina-stock",
    name: "Camiseta Argentina stock",
    category: "Camisetas",
    tags: ["Selecciones", "Argentina"],
    description: "Pack disponible con etiqueta.",
    price: 34900,
    image: "assets/camiseta-argentina-stock.jpg",
  },
  {
    id: "camiseta-portugal-7",
    name: "Camiseta Portugal 7",
    category: "Camisetas",
    tags: ["Selecciones", "Portugal"],
    description: "Modelo rojo con detalles verdes.",
    price: 34900,
    image: "assets/camiseta-portugal-7.jpg",
  },
];

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const cartPanel = document.querySelector(".cart-panel");
const mobileMenu = document.querySelector(".mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
const closeMenuButton = document.querySelector(".close-menu");
const overlay = document.querySelector(".overlay");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");

let cart = JSON.parse(localStorage.getItem("ayre-cart") || "[]");

function saveCart() {
  localStorage.setItem("ayre-cart", JSON.stringify(cart));
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      category === "Todos" || product.category === category || product.tags.includes(category);
    const matchesQuery = [product.name, product.category, product.description, ...product.tags]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesCategory && matchesQuery;
  });

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-state">No encontramos productos con esos filtros.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-visual" src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-info">
            <div class="product-meta">
              <div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
              </div>
              <span class="price">${formatter.format(product.price)}</span>
            </div>
            <button class="add-button" type="button" data-product-id="${product.id}">Agregar</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(productId, change) {
  cart = cart
    .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + change } : item))
    .filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function renderCart() {
  const detailedCart = cart
    .map((item) => ({ ...products.find((product) => product.id === item.id), quantity: item.quantity }))
    .filter((item) => item.id);

  const quantity = detailedCart.reduce((sum, item) => sum + item.quantity, 0);
  const total = detailedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = quantity;
  cartTotal.textContent = formatter.format(total);

  if (!detailedCart.length) {
    cartItems.innerHTML = '<p class="empty-state">Tu carrito esta vacio.</p>';
    return;
  }

  cartItems.innerHTML = detailedCart
    .map(
      (item) => `
        <article class="cart-line">
          <div>
            <h3>${item.name}</h3>
            <p>${formatter.format(item.price)} x ${item.quantity}</p>
            <div class="qty-controls" aria-label="Cantidad de ${item.name}">
              <button type="button" data-decrease="${item.id}" aria-label="Restar">-</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-increase="${item.id}" aria-label="Sumar">+</button>
            </div>
          </div>
          <strong>${formatter.format(item.price * item.quantity)}</strong>
        </article>
      `,
    )
    .join("");
}

function openCart() {
  document.body.classList.add("cart-open");
  cartPanel.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  if (!mobileMenu.classList.contains("is-open")) {
    overlay.hidden = true;
  }
}

function openMenu() {
  document.body.classList.add("menu-open");
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  overlay.hidden = false;
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  if (!cartPanel.classList.contains("is-open")) {
    overlay.hidden = true;
  }
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (button) addToCart(button.dataset.productId);
});

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  if (increase) updateQuantity(increase.dataset.increase, 1);
  if (decrease) updateQuantity(decrease.dataset.decrease, -1);
});

document.querySelector(".cart-toggle").addEventListener("click", openCart);
document.querySelector(".close-cart").addEventListener("click", closeCart);
menuToggle.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
document.querySelectorAll(".mobile-links a").forEach((link) => link.addEventListener("click", closeMenu));
overlay.addEventListener("click", () => {
  closeCart();
  closeMenu();
});
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
});

renderProducts();
renderCart();
