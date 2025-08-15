document.addEventListener("DOMContentLoaded", () => {
  const viewCartItems = document.getElementById("view-cart-items");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const proceedToCheckoutBtn = document.getElementById("proceed-to-checkout");
  const cartCountSpan = document.querySelector(".cart-count");
  const cartModalItems = document.getElementById("cart-items");
  const cartModalTotal = document.getElementById("cart-total");
  const cartModal = document.getElementById("cart-modal");
  const cartIconBtn = document.querySelector(".cart-icon-btn");
  const cartModalClose = document.querySelector(".cart-modal-close");

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Update cart count
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
  }

  // Calculate totals
  function calculateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;

    // Enable/disable checkout button based on cart items
    proceedToCheckoutBtn.classList.toggle("disabled", cart.length === 0);
    if (cart.length === 0) {
      proceedToCheckoutBtn.removeAttribute("href");
    } else {
      proceedToCheckoutBtn.href = "checkout.html";
    }
  }

  // Render cart items in the main view
  function renderCartItems() {
    if (cart.length === 0) {
      viewCartItems.innerHTML =
        '<p class="cart-empty-message">Your cart is empty.</p>';
      return;
    }

    viewCartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="view-cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${
          item.title
        }" class="view-cart-item-image">
        <div class="view-cart-item-details">
          <h3 class="view-cart-item-title">${item.title}</h3>
          <p class="view-cart-item-price">$${item.price.toFixed(2)}</p>
          <div class="view-cart-item-quantity">
            <button class="quantity-decrease" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="view-cart-item-remove" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
      )
      .join("");
  }

  // Render cart items in the modal
  function renderCartModalItems() {
    // Refresh cart data from localStorage
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      cartModalItems.innerHTML =
        '<p class="cart-empty-message">Your cart is empty.</p>';
      cartModalTotal.textContent = "0.00";
      return;
    }

    cartModalItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.title}</h4>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          <div class="cart-item-quantity-controls">
            <button class="quantity-decrease" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      </div>
    `
      )
      .join("");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartModalTotal.textContent = total.toFixed(2);
  }

  // Handle quantity changes and item removal
  function updateQuantity(id, change) {
    const item = cart.find((item) => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        removeFromCart(id);
      } else {
        updateCart();
      }
    }
  }

  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    updateCart();
  }

  // Update cart in localStorage and UI
  function updateCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartItems();
    renderCartModalItems();
    calculateTotals();
    updateCartCount();
  }

  // Event delegation for cart item controls in main view
  viewCartItems.addEventListener("click", (e) => {
    const target = e.target;
    // Get the ID from either the button or its icon
    const id = parseInt(
      target.dataset.id || target.closest("[data-id]")?.dataset.id
    );

    if (
      target.classList.contains("quantity-decrease") ||
      target.closest(".quantity-decrease")
    ) {
      updateQuantity(id, -1);
    } else if (
      target.classList.contains("quantity-increase") ||
      target.closest(".quantity-increase")
    ) {
      updateQuantity(id, 1);
    } else if (
      target.classList.contains("view-cart-item-remove") ||
      target.closest(".view-cart-item-remove")
    ) {
      removeFromCart(id);
    }
  });

  // Event delegation for cart item controls in modal
  cartModalItems.addEventListener("click", (e) => {
    const target = e.target;
    // Get the ID from either the button or its icon
    const id = parseInt(
      target.dataset.id || target.closest("[data-id]")?.dataset.id
    );

    if (
      target.classList.contains("quantity-decrease") ||
      target.closest(".quantity-decrease")
    ) {
      updateQuantity(id, -1);
    } else if (
      target.classList.contains("quantity-increase") ||
      target.closest(".quantity-increase")
    ) {
      updateQuantity(id, 1);
    } else if (
      target.classList.contains("cart-item-remove") ||
      target.closest(".cart-item-remove")
    ) {
      removeFromCart(id);
    }
  });

  // Cart modal open/close handlers
  cartIconBtn.addEventListener("click", () => {
    renderCartModalItems(); // Update modal content when opened
    cartModal.classList.add("active");
  });

  cartModalClose.addEventListener("click", () => {
    cartModal.classList.remove("active");
  });

  // Close modal when clicking outside
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove("active");
    }
  });

  // Handle proceed to checkout
  proceedToCheckoutBtn.addEventListener("click", () => {
    // For now, just show a notification
    showNotification("Checkout functionality is not yet implemented.", "info");
  });

  // Initialize the page
  renderCartItems();
  renderCartModalItems();
  calculateTotals();
  updateCartCount();
});
