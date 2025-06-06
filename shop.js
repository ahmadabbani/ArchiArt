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
  let currentPage = 1;
  const itemsPerPage = 12;

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
    const loadingElement = document.querySelector(".shop_loading");
    try {
      loadingElement.classList.add("active");
      const { data: fetchedProducts, error } = await supabaseClient
        .from("products")
        .select("*");

      if (error) throw error;

      products = fetchedProducts || [];
      populateCategories();
      displayProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      loadingElement.classList.remove("active");
    }
  }

  // Populate categories in the filter
  function populateCategories() {
    // Extract unique categories and parent sections from products
    const sections = new Set();
    const parentSections = new Set();
    const sectionToParent = new Map();

    products.forEach((product) => {
      if (product.section) {
        sections.add(product.section);
        if (product.parent_section) {
          parentSections.add(product.parent_section);
          sectionToParent.set(product.section, product.parent_section);
        }
      }
    });

    // Create HTML for categories
    let categoriesHTML = `
      <label class="shop_category">
        <input type="checkbox" value="all" ${
          selectedCategories.has("all") ? "checked" : ""
        }>
        <span>All</span>
      </label>
    `;

    // Add parent sections with their subsections
    parentSections.forEach((parentSection) => {
      const subsections = Array.from(sections).filter(
        (section) => sectionToParent.get(section) === parentSection
      );

      categoriesHTML += `
        <div class="shop_category-group">
          <label class="shop_category parent">
            <input type="checkbox" value="${parentSection}" ${
        selectedCategories.has(parentSection) ? "checked" : ""
      }>
            <span>${parentSection}</span>
            <i class="fas fa-chevron-down shop_category-dropdown"></i>
          </label>
          <div class="shop_subcategories" style="display: none;">
            ${subsections
              .map(
                (subsection) => `
              <label class="shop_category child">
                <input type="checkbox" value="${subsection}" ${
                  selectedCategories.has(subsection) ? "checked" : ""
                }>
                <span>${subsection}</span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    });

    // Add sections without parents
    const sectionsWithoutParents = Array.from(sections).filter(
      (section) => !sectionToParent.has(section)
    );
    if (sectionsWithoutParents.length > 0) {
      categoriesHTML += sectionsWithoutParents
        .map(
          (section) => `
        <label class="shop_category">
          <input type="checkbox" value="${section}" ${
            selectedCategories.has(section) ? "checked" : ""
          }>
          <span>${section}</span>
        </label>
      `
        )
        .join("");
    }

    categoriesContainer.innerHTML = categoriesHTML;

    // Add event listeners to category checkboxes
    document.querySelectorAll(".shop_category input").forEach((checkbox) => {
      checkbox.addEventListener("change", handleCategoryChange);
    });

    // Add event listeners for dropdown toggles
    document.querySelectorAll(".shop_category-dropdown").forEach((dropdown) => {
      dropdown.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parentLabel = dropdown.closest(".shop_category");
        const subcategories = parentLabel.nextElementSibling;
        const isExpanded = subcategories.style.display !== "none";

        subcategories.style.display = isExpanded ? "none" : "block";
        dropdown.style.transform = isExpanded
          ? "rotate(0deg)"
          : "rotate(180deg)";
      });
    });
  }

  // Handle category selection
  function handleCategoryChange(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    const isParent = checkbox
      .closest(".shop_category")
      .classList.contains("parent");
    const isChild = checkbox
      .closest(".shop_category")
      .classList.contains("child");
    const isStandalone = !isParent && !isChild;

    if (value === "all") {
      if (checkbox.checked) {
        selectedCategories.clear();
        selectedCategories.add("all");
        // Uncheck all other checkboxes
        document
          .querySelectorAll(
            '.shop_category input[type="checkbox"]:not([value="all"])'
          )
          .forEach((cb) => {
            cb.checked = false;
          });
      } else {
        checkbox.checked = true; // Prevent unchecking "all"
      }
    } else {
      if (checkbox.checked) {
        selectedCategories.delete("all");
        selectedCategories.add(value);

        // If selecting a standalone section, uncheck all parent sections and their subsections
        if (isStandalone) {
          document
            .querySelectorAll('.shop_category.parent input[type="checkbox"]')
            .forEach((cb) => {
              cb.checked = false;
              selectedCategories.delete(cb.value);
            });
          document
            .querySelectorAll('.shop_category.child input[type="checkbox"]')
            .forEach((cb) => {
              cb.checked = false;
              selectedCategories.delete(cb.value);
            });
        }

        // Uncheck "all" checkbox
        document.querySelector('input[value="all"]').checked = false;
      } else {
        selectedCategories.delete(value);

        if (selectedCategories.size === 0) {
          selectedCategories.add("all");
          document.querySelector('input[value="all"]').checked = true;
        }
      }
    }

    currentPage = 1; // Reset to first page when filters change
    displayProducts();
  }

  // Display filtered products
  function displayProducts() {
    const filteredProducts = products.filter((product) => {
      // Check if any parent section is selected
      const selectedParentSections = Array.from(selectedCategories).filter(
        (category) => {
          const checkbox = document.querySelector(
            `.shop_category.parent input[value="${category}"]`
          );
          return checkbox && checkbox.checked;
        }
      );

      // Price filtering
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      // If a parent section is selected, show all products from that parent
      if (selectedParentSections.length > 0) {
        const matchesParent = selectedParentSections.some(
          (parentSection) => product.parent_section === parentSection
        );
        if (matchesParent) {
          // If no subsections are selected, show all products from this parent
          const selectedSubsections = Array.from(selectedCategories).filter(
            (category) => {
              const checkbox = document.querySelector(
                `.shop_category.child input[value="${category}"]`
              );
              return checkbox && checkbox.checked;
            }
          );

          if (selectedSubsections.length === 0) {
            return matchesPrice; // Only check price filter for parent category
          }

          // If subsections are selected, only show products from those subsections
          return selectedSubsections.includes(product.section) && matchesPrice;
        }
        return false; // Don't show products that don't match parent category
      }

      // If no parent section is selected, use normal category filtering
      const matchesCategory =
        selectedCategories.has("all") ||
        selectedCategories.has(product.section || "Others");

      return matchesCategory && matchesPrice;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Ensure current page is valid
    if (currentPage > totalPages) {
      currentPage = totalPages || 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Update products grid
    productsGrid.innerHTML = paginatedProducts
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
            <button class="shop_read-more-btn" onclick="event.stopPropagation(); window.location.href='product.html?id=${
              product.id
            }'">Read More</button>
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

    // Update pagination
    updatePagination(totalPages);
  }

  function updatePagination(totalPages) {
    const paginationNumbers = document.getElementById("pagination-numbers");
    const prevButton = document.getElementById("pagination-prev");
    const nextButton = document.getElementById("pagination-next");

    // Update prev/next buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    let paginationHTML = "";
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      paginationHTML += `<span class="shop_pagination-number" data-page="1">1</span>`;
      if (startPage > 2) {
        paginationHTML += `<span class="shop_pagination-ellipsis">...</span>`;
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<span class="shop_pagination-number ${
        i === currentPage ? "active" : ""
      }" data-page="${i}">${i}</span>`;
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="shop_pagination-ellipsis">...</span>`;
      }
      paginationHTML += `<span class="shop_pagination-number" data-page="${totalPages}">${totalPages}</span>`;
    }

    paginationNumbers.innerHTML = paginationHTML;

    // Add click event listeners
    document.querySelectorAll(".shop_pagination-number").forEach((button) => {
      button.addEventListener("click", () => {
        currentPage = parseInt(button.dataset.page);
        displayProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // Add event listeners for pagination buttons
  document.getElementById("pagination-prev").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.getElementById("pagination-next").addEventListener("click", () => {
    const totalPages = Math.ceil(
      products.filter(
        (product) =>
          (selectedCategories.has("all") ||
            selectedCategories.has(product.section || "Others")) &&
          (!product.price ||
            (product.price >= minPrice && product.price <= maxPrice))
      ).length / itemsPerPage
    );

    if (currentPage < totalPages) {
      currentPage++;
      displayProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

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
    const minValue = parseInt(priceMinInput.value) || 0;
    const maxValue = parseInt(priceMaxInput.value) || 1000;

    // Ensure min doesn't exceed max
    if (minValue > maxValue) {
      priceMinInput.value = maxValue;
      priceMinRange.value = maxValue;
    }

    // Ensure max doesn't go below min
    if (maxValue < minValue) {
      priceMaxInput.value = minValue;
      priceMaxRange.value = minValue;
    }

    minPrice = parseInt(priceMinInput.value) || 0;
    maxPrice = parseInt(priceMaxInput.value) || 1000;
    currentPage = 1; // Reset to first page when filters change
    displayProducts();
  }

  // Event Listeners
  priceMinInput.addEventListener("input", handlePriceChange);
  priceMaxInput.addEventListener("input", handlePriceChange);
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
