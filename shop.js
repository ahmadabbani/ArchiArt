// Initialize Supabase client
let supabaseClient;
try {
  if (typeof supabase === "undefined") {
    throw new Error("Supabase library not loaded");
  }

  const supabaseUrl = "https://iupipboqnmtzulhvabil.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cGlwYm9xbm10enVsaHZhYmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTI2NDIsImV4cCI6MjA1OTg4ODY0Mn0.nchOl1HSDYHBg_Crzam-DY1ZWop8QC5SNgvuUeADxM4";

  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  console.log("Supabase initialized:", supabaseClient);
} catch (error) {
  console.error("Failed to initialize Supabase:", error.message);
}

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const productsGrid = document.getElementById("products-grid");
  const categoriesContainer = document.querySelector(".shop_categories");
  const priceMinInput = document.getElementById("min-price");
  const priceMaxInput = document.getElementById("max-price");
  const priceMinRange = document.getElementById("price-min");
  const priceMaxRange = document.getElementById("price-max");
  const productDetailsModal = document.getElementById("product-details-modal");
  const inquiryModal = document.getElementById("inquiry-modal");
  const inquiryForm = document.getElementById("inquiry-form");
  const inquiryMessage = document.getElementById("inquiry-message");

  // State
  let products = [];
  let categories = new Set();
  let selectedCategories = new Set(["all"]);
  let minPrice = 0;
  let maxPrice = 1000;

  // Mobile menu functionality
  const mobileToggle = document.querySelector(".header_mobile-toggle");
  const nav = document.querySelector(".header_nav");
  const navLinks = document.querySelectorAll(".header_nav-link");

  // Mobile menu toggle
  mobileToggle.addEventListener("click", function () {
    nav.classList.toggle("header_open");

    // Update icons visibility
    const menuIcon = document.querySelector(".header_menu-icon");
    const closeIcon = document.querySelector(".header_close-icon");

    if (nav.classList.contains("header_open")) {
      menuIcon.style.display = "none";
      closeIcon.style.display = "block";
    } else {
      menuIcon.style.display = "block";
      closeIcon.style.display = "none";
    }
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      nav.classList.remove("header_open");
      const menuIcon = document.querySelector(".header_menu-icon");
      const closeIcon = document.querySelector(".header_close-icon");
      menuIcon.style.display = "block";
      closeIcon.style.display = "none";
    });
  });

  // Fetch and display products
  async function fetchAndDisplayProducts() {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      products = data;

      // Extract unique categories
      categories = new Set(
        products
          .map((product) => product.section)
          .filter(Boolean)
          .concat("Others")
      );

      // Populate categories
      populateCategories();

      // Display products
      displayProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // Populate categories in the filter
  function populateCategories() {
    const categoriesHTML = Array.from(categories)
      .map(
        (category) => `
        <label class="shop_category">
          <input type="checkbox" value="${category}" ${
          selectedCategories.has(category) ? "checked" : ""
        }>
          <span>${category}</span>
        </label>
      `
      )
      .join("");

    categoriesContainer.innerHTML = `
      <label class="shop_category">
        <input type="checkbox" value="all" ${
          selectedCategories.has("all") ? "checked" : ""
        }>
        <span>All Products</span>
      </label>
      ${categoriesHTML}
    `;

    // Add event listeners to category checkboxes
    document.querySelectorAll(".shop_category input").forEach((checkbox) => {
      checkbox.addEventListener("change", handleCategoryChange);
    });
  }

  // Handle category selection
  function handleCategoryChange(e) {
    const value = e.target.value;

    if (value === "all") {
      if (e.target.checked) {
        selectedCategories = new Set(["all"]);
        document.querySelectorAll(".shop_category input").forEach((input) => {
          if (input.value !== "all") input.checked = false;
        });
      }
    } else {
      if (e.target.checked) {
        selectedCategories.delete("all");
        selectedCategories.add(value);
        document.querySelector(
          '.shop_category input[value="all"]'
        ).checked = false;
      } else {
        selectedCategories.delete(value);
        if (selectedCategories.size === 0) {
          selectedCategories.add("all");
          document.querySelector(
            '.shop_category input[value="all"]'
          ).checked = true;
        }
      }
    }

    displayProducts();
  }

  // Display filtered products
  function displayProducts() {
    const filteredProducts = products.filter((product) => {
      const matchesCategory =
        selectedCategories.has("all") ||
        selectedCategories.has(product.section || "Others");
      const matchesPrice =
        (!product.price || product.price >= minPrice) &&
        (!product.price || product.price <= maxPrice);

      return matchesCategory && matchesPrice;
    });

    productsGrid.innerHTML = filteredProducts
      .map(
        (product) => `
        <div class="shop_product-card" data-product-id="${
          product.id
        }" onclick="window.location.href='product.html?id=${product.id}'">
          <div class="shop_product-image">
            <img src="${
              supabaseClient.storage
                .from("project-images")
                .getPublicUrl(product.image).data.publicUrl
            }" alt="${product.title}">
          </div>
          <div class="shop_product-content">
            <h3 class="shop_product-title">${product.title}</h3>
            ${
              product.section
                ? `<p class="shop_product-category">${product.section}</p>`
                : ""
            }
            <p class="shop_product-description">${product.description}</p>
            ${
              product.price
                ? `<p class="shop_product-price">$${product.price}</p>`
                : ""
            }
          </div>
        </div>
      `
      )
      .join("");
  }

  // Show product details
  function showProductDetails(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modal = productDetailsModal;
    const image = modal.querySelector(".shop_product-image img");
    const title = modal.querySelector(".shop_product-title");
    const category = modal.querySelector(".shop_product-category");
    const description = modal.querySelector(".shop_product-description");
    const price = modal.querySelector(".shop_product-price");

    image.src = supabaseClient.storage
      .from("project-images")
      .getPublicUrl(product.image).data.publicUrl;
    title.textContent = product.title;
    category.textContent = product.section || "Others";
    description.textContent = product.description;
    price.textContent = product.price ? `$${product.price}` : "";

    modal.style.display = "block";
  }

  // Handle price range changes
  function handlePriceChange() {
    minPrice = parseInt(priceMinInput.value);
    maxPrice = parseInt(priceMaxInput.value);

    // Ensure min doesn't exceed max
    if (minPrice > maxPrice) {
      minPrice = maxPrice;
      priceMinInput.value = minPrice;
    }

    // Update range inputs
    priceMinRange.value = minPrice;
    priceMaxRange.value = maxPrice;

    displayProducts();
  }

  // Event Listeners
  priceMinInput.addEventListener("change", handlePriceChange);
  priceMaxInput.addEventListener("change", handlePriceChange);
  priceMinRange.addEventListener("input", (e) => {
    priceMinInput.value = e.target.value;
    handlePriceChange();
  });
  priceMaxRange.addEventListener("input", (e) => {
    priceMaxInput.value = e.target.value;
    handlePriceChange();
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === productDetailsModal) {
      productDetailsModal.style.display = "none";
    }
    if (e.target === inquiryModal) {
      inquiryModal.style.display = "none";
    }
  });

  // Close modals when clicking close button
  document.querySelectorAll(".shop_modal-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      productDetailsModal.style.display = "none";
      inquiryModal.style.display = "none";
    });
  });

  // Handle inquiry button click
  document.querySelector(".shop_inquiry-btn").addEventListener("click", () => {
    const productTitle = document.querySelector(
      ".shop_product-title"
    ).textContent;
    inquiryMessage.value = `I'm interested in the following product:\n\nProduct: ${productTitle}\n\nPlease provide more information about this product.`;
    productDetailsModal.style.display = "none";
    inquiryModal.style.display = "block";
  });

  // Handle inquiry form submission
  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    // For now, we'll just close the modal
    inquiryModal.style.display = "none";
    inquiryForm.reset();
  });

  // Initialize
  fetchAndDisplayProducts();
});

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "shop_product-card";
  card.innerHTML = `
        <div class="shop_product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="shop_product-content">
            <h3 class="shop_product-title">${product.name}</h3>
            ${
              product.section
                ? `<p class="shop_product-category">${product.section}</p>`
                : ""
            }
            <p class="shop_product-description">${product.description}</p>
            ${
              product.price
                ? `<p class="shop_product-price">$${product.price}</p>`
                : ""
            }
        </div>
    `;

  // Add click event listener to redirect to product page
  card.addEventListener("click", () => {
    window.location.href = `/product.html?id=${product.id}`;
  });

  return card;
}
