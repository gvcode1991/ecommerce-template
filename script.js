const products = [
  {
    id: "camisa-lino",
    name: "Camisa de lino Alba",
    category: "Indumentaria",
    description: "Lino liviano con caida relajada.",
    price: 42900,
    colors: ["#d8dbd2", "#315c4e"],
  },
  {
    id: "bolso-rio",
    name: "Bolso Rio",
    category: "Accesorios",
    description: "Tote amplio de lona y cuero vegetal.",
    price: 38500,
    colors: ["#b85c38", "#f1d8bd"],
  },
  {
    id: "vaso-ceramica",
    name: "Set ceramica Nube",
    category: "Casa",
    description: "Dos piezas esmaltadas a mano.",
    price: 24800,
    colors: ["#dce8ec", "#ffffff"],
  },
  {
    id: "pantalon-savia",
    name: "Pantalon Savia",
    category: "Indumentaria",
    description: "Sastrero suave para uso diario.",
    price: 52400,
    colors: ["#315c4e", "#9da891"],
  },
  {
    id: "lentes-sol",
    name: "Lentes Clara",
    category: "Accesorios",
    description: "Marco liviano con filtro UV.",
    price: 31600,
    colors: ["#171717", "#d7b996"],
  },
  {
    id: "manta-casa",
    name: "Manta Brisa",
    category: "Casa",
    description: "Algodon tejido con textura suave.",
    price: 46200,
    colors: ["#f2dfce", "#7c8f99"],
  },
  {
    id: "top-aire",
    name: "Top Aire",
    category: "Indumentaria",
    description: "Basico fresco de punto fino.",
    price: 28900,
    colors: ["#ffffff", "#b85c38"],
  },
  {
    id: "bandeja-raiz",
    name: "Bandeja Raiz",
    category: "Casa",
    description: "Madera clara para mesa o escritorio.",
    price: 33400,
    colors: ["#c69a6b", "#315c4e"],
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
    const matchesCategory = category === "Todos" || product.category === category;
    const matchesQuery = [product.name, product.category, product.description]
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
          <div class="product-visual" style="--visual-main:${product.colors[0]};--visual-accent:${product.colors[1]}"></div>
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
  overlay.hidden = true;
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
overlay.addEventListener("click", closeCart);
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
});

renderProducts();
renderCart();
