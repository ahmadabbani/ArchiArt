// cart.js
document.addEventListener("DOMContentLoaded", () => {
  const cartIconBtn = document.querySelector(".cart-icon-btn");
  const cartModal = document.getElementById("cart-modal");
  const cartModalClose = document.querySelector(".cart-modal-close");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalSpan = document.getElementById("cart-total");
  const cartCountSpan = document.querySelector(".cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Custom notification element
  let notificationTimeout;
  const notificationContainer = document.createElement("div");
  notificationContainer.id = "custom-notification";
  document.body.appendChild(notificationContainer);

  function showNotification(message, type = "success") {
    notificationContainer.textContent = message;
    notificationContainer.className = `custom-notification ${type} show`;

    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      notificationContainer.classList.remove("show");
    }, 3000);
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
  }

  function renderCartItems() {
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="cart-empty-message">Your cart is empty.</p>';
      cartTotalSpan.textContent = "0.00";
      checkoutBtn.disabled = true;
      return;
    }

    let total = 0;
    cart.forEach((item) => {
      const cartItemEl = document.createElement("div");
      cartItemEl.classList.add("cart-item");
      cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${
        item.title
      }" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity-controls">
                        <button class="quantity-decrease" data-id="${
                          item.id
                        }">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-increase" data-id="${
                          item.id
                        }">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${
                  item.id
                }">&times;</button>
            `;
      cartItemsContainer.appendChild(cartItemEl);
      total += item.price * item.quantity;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
  }

  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      // Determine the correct image URL.
      // If product.image is already a full URL (e.g., from product.js),
      // use it directly. Otherwise, get the public URL from Supabase storage.
      let finalImageUrl = product.image;
      if (
        !product.image.startsWith("http://") &&
        !product.image.startsWith("https://")
      ) {
        finalImageUrl = supabaseClient.storage
          .from("project-images")
          .getPublicUrl(product.image).data.publicUrl;
      }
      cart.push({ ...product, quantity: 1, image: finalImageUrl });
    }
    saveCart();
    showNotification(`${product.title} has been added to your cart!`);
  }

  function removeFromCart(id) {
    console.log("Attempting to remove item with ID:", id);
    console.log("Cart before removal:", JSON.parse(JSON.stringify(cart))); // Deep copy for logging
    cart = cart.filter((item) => item.id !== id);
    console.log("Cart after removal filter:", JSON.parse(JSON.stringify(cart))); // Deep copy for logging
    saveCart();
    showNotification(`Item removed from cart!`);
  }

  function updateQuantity(id, change) {
    console.log("Attempting to update quantity for ID:", id, "Change:", change);
    const item = cart.find((item) => item.id === id);
    if (item) {
      console.log("Item found. Current quantity:", item.quantity);
      item.quantity += change;
      console.log("New quantity:", item.quantity);
      if (item.quantity <= 0) {
        console.log("Quantity is 0 or less, removing item.");
        removeFromCart(id);
      } else {
        saveCart();
        console.log("Quantity updated, cart saved.");
      }
    }
  }

  // Event Listeners
  cartIconBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Cart icon clicked.");
    cartModal.style.display = "block";
    renderCartItems();
  });

  cartModalClose.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = "none";
    }
  });

  // Event delegation for cart item controls
  cartItemsContainer.addEventListener("click", (e) => {
    const target = e.target;
    const id = parseInt(target.dataset.id); // Parse ID to integer

    console.log("Cart item clicked:", target.classList, "ID:", id, "(parsed)");

    if (target.classList.contains("quantity-decrease")) {
      console.log("Decreasing quantity for ID:", id);
      updateQuantity(id, -1);
    } else if (target.classList.contains("quantity-increase")) {
      console.log("Increasing quantity for ID:", id);
      updateQuantity(id, 1);
    } else if (target.classList.contains("cart-item-remove")) {
      console.log("Removing item with ID:", id);
      removeFromCart(id);
    }
  });

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showNotification("Your cart is empty", "error");
      return;
    }
    window.location.href = "checkout.html";
  });

  // Make addToCart accessible globally
  window.addToCart = addToCart;

  // Initial render (only update count, don't open modal)
  updateCartCount();
});
