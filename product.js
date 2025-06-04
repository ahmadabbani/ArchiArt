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
} catch (error) {
  console.error("Failed to initialize Supabase:", error.message);
}

async function fetchRelatedProducts(currentProductId, section) {
  try {
    // If no section is provided, return empty array
    if (!section) {
      return [];
    }

    const { data: relatedProducts, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("section", section)
      .neq("id", currentProductId)
      .limit(4);

    if (error) throw error;

    return relatedProducts || [];
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

function createRelatedProductCard(product) {
  const card = document.createElement("div");
  card.className = "singleproduct_related-card";
  card.onclick = () => (window.location.href = `product.html?id=${product.id}`);

  card.innerHTML = `
    <div class="singleproduct_related-image">
      <img src="${
        supabaseClient.storage
          .from("project-images")
          .getPublicUrl(product.image).data.publicUrl
      }" alt="${product.title}">
    </div>
    <div class="singleproduct_related-content">
      <h3 class="singleproduct_related-card-title">${product.title}</h3>
      ${
        product.price
          ? `<p class="singleproduct_related-card-price">$${product.price}</p>`
          : ""
      }
    </div>
  `;

  return card;
}

function displayRelatedProducts(products) {
  // Get the related products section
  const relatedSection = document.querySelector(
    ".singleproduct_related-section"
  );

  // If section doesn't exist, exit early
  if (!relatedSection) return;

  // If no products or empty array, hide the entire section
  if (!products || products.length === 0) {
    relatedSection.style.display = "none";
    return;
  }

  // Show the section and get the grid
  relatedSection.style.display = "block";
  const relatedGrid = document.getElementById("related-products-grid");
  if (!relatedGrid) return;

  // Clear the grid and add products
  relatedGrid.innerHTML = "";
  products.forEach((product) => {
    const card = createRelatedProductCard(product);
    relatedGrid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
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

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "shop.html";
    return;
  }

  try {
    const { data: product, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      window.location.href = "shop.html";
      return;
    }

    if (!product) {
      console.error("Product not found");
      window.location.href = "shop.html";
      return;
    }

    // Update breadcrumb
    const breadcrumbNav = document.querySelector(
      ".singleproduct_breadcrumb-nav"
    );
    breadcrumbNav.innerHTML = `
      <a href="shop.html" class="singleproduct_breadcrumb-link">Shop</a>
      <span class="singleproduct_breadcrumb-separator">/</span>
      ${
        product.parent_section
          ? `
        <span class="singleproduct_breadcrumb-current">${product.parent_section}</span>
        <span class="singleproduct_breadcrumb-separator">/</span>
      `
          : ""
      }
      ${
        product.section
          ? `
        <span class="singleproduct_breadcrumb-current">${product.section}</span>
        <span class="singleproduct_breadcrumb-separator">/</span>
      `
          : ""
      }
      <span class="singleproduct_breadcrumb-current">${product.title}</span>
    `;

    // Update product details
    document.getElementById("product-title").textContent = product.title;
    document.getElementById("product-category").textContent = product.section;
    document.getElementById("product-description").textContent =
      product.description;
    document.getElementById("product-price").textContent = product.price
      ? `$${product.price}`
      : "";

    // Handle image loading
    const productImage = document.getElementById("product-image");
    const placeholder = document.querySelector(
      ".singleproduct_image-placeholder"
    );

    productImage.onload = function () {
      console.log("Image loaded successfully");
      placeholder.style.display = "none";
      productImage.classList.add("loaded");
    };

    productImage.onerror = function () {
      console.error("Error loading image");
      placeholder.style.display = "block";
      productImage.classList.remove("loaded");
    };

    // Get the correct image URL from Supabase storage
    const imageUrl = supabaseClient.storage
      .from("project-images")
      .getPublicUrl(product.image).data.publicUrl;

    console.log("Setting image URL:", imageUrl);
    productImage.src = imageUrl;
    productImage.alt = product.title;

    // Fetch and display related products
    const relatedProducts = await fetchRelatedProducts(
      productId,
      product.section
    );
    displayRelatedProducts(relatedProducts);
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "shop.html";
  }
});

// Handle inquiry modal
const inquiryBtn = document.getElementById("inquiry-btn");
const inquiryModal = document.getElementById("inquiry-modal");
const closeModal = document.querySelector(".singleproduct_modal-close");
const inquiryForm = document.getElementById("inquiry-form");

inquiryBtn.addEventListener("click", () => {
  inquiryModal.style.display = "block";
  // Set default message with product name
  const productName = document.getElementById("product-title").textContent;
  document.getElementById(
    "message"
  ).value = `I'm interested in the ${productName}. Please provide more information.`;
});

closeModal.addEventListener("click", () => {
  inquiryModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === inquiryModal) {
    inquiryModal.style.display = "none";
  }
});

// Handle form submission
inquiryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Here you would typically handle the form submission
  // For now, we'll just close the modal
  inquiryModal.style.display = "none";
  alert("Thank you for your inquiry. We will get back to you soon!");
});
