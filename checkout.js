document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutItems = document.getElementById("checkout-items");
  const subtotalElement = document.getElementById("checkout-subtotal");
  const shippingElement = document.getElementById("checkout-shipping");
  const totalElement = document.getElementById("checkout-total");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const deliveryNote = document.getElementById("delivery-note");
  const localPickup = document.getElementById("localPickup");
  const delivery = document.getElementById("delivery");
  const cartCountSpan = document.querySelector(".cart-count");

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "checkout-custom-notification";
  document.body.appendChild(notification);

  // Show notification function
  function showNotification(message, type = "info") {
    notification.textContent = message;
    notification.className = `checkout-custom-notification ${type} show`;

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if cart is empty and redirect if needed
  if (cart.length === 0) {
    window.location.href = "shop.html";
    return;
  }

  // Update cart count
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
  }

  // Render checkout items
  function renderCheckoutItems() {
    checkoutItems.innerHTML = cart
      .map(
        (item) => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${
          item.title
        }" class="checkout-item-image">
        <div class="checkout-item-details">
          <h3 class="checkout-item-title">${item.title}</h3>
          <p class="checkout-item-price">$${item.price.toFixed(2)}</p>
          <p class="checkout-item-quantity">Quantity: ${item.quantity}</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Calculate totals
  function calculateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = delivery.checked ? 5 : 0;
    const total = subtotal + shipping;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = `$${shipping.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;

    // Show/hide delivery note
    deliveryNote.style.display = delivery.checked ? "block" : "none";
  }

  // Handle shipping option changes
  localPickup.addEventListener("change", calculateTotals);
  delivery.addEventListener("change", calculateTotals);

  // Handle place order button click
  placeOrderBtn.addEventListener("click", () => {
    // Validate form
    if (!checkoutForm.checkValidity()) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Get form data
    const formData = new FormData(checkoutForm);
    const orderData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      company: formData.get("company"),
      country: formData.get("country"),
      address: formData.get("address"),
      apartment: formData.get("apartment"),
      city: formData.get("city"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      notes: formData.get("notes"),
      shipping: formData.get("shipping"),
      items: cart,
    };

    // Calculate totals
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = orderData.shipping === "delivery" ? 5 : 0;
    const total = subtotal + shipping;

    // Create WhatsApp message
    let message = `New Order from ${orderData.firstName} ${orderData.lastName}\n\n`;
    message += `Contact: ${orderData.phone}\n`;
    message += `Email: ${orderData.email}\n\n`;
    message += `Shipping Address:\n`;
    message += `${orderData.address}\n`;
    if (orderData.apartment) message += `${orderData.apartment}\n`;
    message += `${orderData.city}, ${orderData.country}\n\n`;
    message += `Order Items:\n`;
    cart.forEach((item) => {
      message += `${item.title} x${item.quantity} - $${(
        item.price * item.quantity
      ).toFixed(2)}\n`;
    });
    message += `\nSubtotal: $${subtotal.toFixed(2)}\n`;
    message += `Shipping: $${shipping.toFixed(2)}\n`;
    message += `Total: $${total.toFixed(2)}\n\n`;
    if (orderData.notes) message += `Order Notes: ${orderData.notes}\n`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "+96181882662"; // Replace with your WhatsApp number
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Clear cart from localStorage
    localStorage.removeItem("cart");

    // Show success notification
    showNotification(
      "Thank you for your purchase! You’ll be redirected to WhatsApp to send your order.",
      "success"
    );

    // Redirect to WhatsApp after a short delay
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 2500);
  });

  // Initialize the page
  renderCheckoutItems();
  calculateTotals();
  updateCartCount();
});
