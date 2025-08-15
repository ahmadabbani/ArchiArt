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

    return supabaseClient
      .from("products")
      .select("*")
      .eq("section", section)
      .neq("id", currentProductId)
      .limit(4)
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      })
      .catch((error) => {
        console.error("Error fetching related products:", error);
        return [];
      });
  } catch (error) {
    console.error("Unexpected error in fetchRelatedProducts:", error);
    return Promise.resolve([]);
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

document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu functionality
  const mobileToggle = document.querySelector(".header_mobile-toggle");
  const nav = document.querySelector(".header_nav");
  const navLinks = document.querySelectorAll(".header_nav-link");

  // Product Details Elements
  const productImage = document.getElementById("product-image");
  const productTitle = document.getElementById("product-title");
  const productCategory = document.getElementById("product-category");
  const productDescription = document.getElementById("product-description");
  const priceElement = document.getElementById("product-price");
  const inquiryBtn = document.getElementById("inquiry-btn");
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const breadcrumbProductName = document.getElementById(
    "breadcrumb-product-name"
  );
  const inquiryModal = document.getElementById("inquiry-modal");
  const inquiryMessage = inquiryModal.querySelector("#message");
  const inquiryForm = document.getElementById("inquiry-form");

  let currentProduct = null;

  // Mobile menu toggle
  mobileToggle.addEventListener("click", function () {
    nav.classList.toggle("header_open");
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

  async function initializeProductPage() {
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
  ${
    product.parent_section
      ? `
    <span class="singleproduct_breadcrumb-separator">/</span>
    <a href="shop.html?category=${encodeURIComponent(product.parent_section)}" 
       class="singleproduct_breadcrumb-link">${product.parent_section}</a>
  `
      : ""
  }
  ${
    product.section
      ? `
    <span class="singleproduct_breadcrumb-separator">/</span>
    <a href="shop.html?category=${encodeURIComponent(product.section)}" 
       class="singleproduct_breadcrumb-link">${product.section}</a>
  `
      : ""
  }
 
  <span class="singleproduct_breadcrumb-separator">/</span>
  <span class="singleproduct_breadcrumb-current">${product.title}</span>
`;

      // Update product details
      productTitle.textContent = product.title;
      productCategory.textContent = product.section;
      // Set in-stock indicator
      const instockIndicator = document.getElementById(
        "product-instock-indicator"
      );
      if (instockIndicator) {
        if (product.instock === false) {
          instockIndicator.innerHTML =
            '<span class="instock-dot out"></span> <span class="instock-text">Out of Stock</span>';
        } else {
          instockIndicator.innerHTML =
            '<span class="instock-dot in"></span> <span class="instock-text">In Stock</span>';
        }
      }
      productDescription.textContent = product.description;

      // Handle subdescription
      const productSubdescription = document.getElementById(
        "product-subdescription"
      );
      if (productSubdescription) {
        if (product.subdescription) {
          productSubdescription.textContent = product.subdescription;
          productSubdescription.style.display = "block";
        } else {
          productSubdescription.style.display = "none";
        }
      }

      priceElement.textContent = product.price ? `$${product.price}` : "";

      // Handle image loading
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

      // Update currentProduct with the full image URL before setting it
      currentProduct = {
        ...product,
        image: imageUrl, // Overwrite with the public URL
      };

      // Back button event listener
      const backBtn = document.querySelector(".singleproduct-back-btn");
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          // Use parent_section as category if it exists, otherwise fallback to section
          const category = product.section || product.parent_section || "";
          const categoryParam = encodeURIComponent(category);
          window.location.href = `shop.html?category=${categoryParam}`;
        });
      }

      // Fetch and display related products
      fetchRelatedProducts(productId, currentProduct.section).then(
        (relatedProducts) => {
          displayRelatedProducts(relatedProducts);
        }
      );

      // Handle price-based button visibility
      if (product.price) {
        priceElement.textContent = `$${product.price}`;
        inquiryBtn.style.display = "none"; // Hide inquiry button if price exists
        addToCartBtn.style.display = "block"; // Show add to cart button

        // Disable add to cart button if out of stock
        if (product.instock === false) {
          addToCartBtn.disabled = true;
          addToCartBtn.classList.add("disabled");
        }

        // Set up add to cart button click listener with the updated currentProduct
        addToCartBtn.addEventListener("click", () => {
          console.log("Add to Cart button clicked on product page.");
          console.log(
            "Adding product to cart from product.html:",
            currentProduct
          );
          console.log("Product image being passed:", currentProduct.image);
          window.addToCart(currentProduct);
        });
      } else {
        priceElement.textContent = "Price available upon request";
        inquiryBtn.style.display = "block"; // Show inquiry button if no price
        addToCartBtn.style.display = "none"; // Hide add to cart button

        // Disable inquiry button if out of stock
        if (product.instock === false) {
          inquiryBtn.disabled = true;
          inquiryBtn.classList.add("disabled");
        }
      }

      // Handle inquiry button click
      inquiryBtn.addEventListener("click", () => {
        inquiryMessage.value = `I'm interested in the following product:\n\nProduct: ${product.title}\n\nPlease provide more information about this product.`;
        inquiryModal.style.display = "block";
      });

      // Close inquiry modal
      document
        .querySelector(".singleproduct_modal-close")
        .addEventListener("click", () => {
          inquiryModal.style.display = "none";
        });

      // Handle inquiry form submission
      inquiryForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Basic validation
        if (!name) {
          window.showNotification("Please enter your name", "error");
          return;
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          window.showNotification(
            "Please enter a valid email address",
            "error"
          );
          return;
        }

        // Format WhatsApp message
        const whatsappMessage = encodeURIComponent(
          `*New Quote Request*\n\nName: ${name}\nEmail: ${email}\n\n${message}`
        );
        const whatsappNumber = "96181882662"; // Your WhatsApp business number
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, "_blank");

        // Close modal and reset form
        inquiryModal.style.display = "none";
        inquiryForm.reset();
      });
    } catch (error) {
      console.error("Error initializing product page:", error);
      window.location.href = "shop.html";
    }
  }

  initializeProductPage();
});
