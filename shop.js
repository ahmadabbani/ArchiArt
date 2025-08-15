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
  const brandsContainer = document.querySelector(".shop_brands");
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
  let brands = new Set();
  let selectedBrands = new Set(["all"]);
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

  // Function to get URL parameters
  function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Function to set initial category from URL
  function setInitialCategoryFromURL() {
    const categoryParam = getURLParameter("category");
    if (categoryParam) {
      selectedCategories.clear();
      selectedCategories.add(categoryParam);
      console.log("Setting initial category from URL:", categoryParam);
    }
  }

  // Function to update category checkboxes based on selected categories
  function updateCategoryCheckboxes() {
    // First, uncheck all checkboxes
    document
      .querySelectorAll('.shop_category input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    // Then check the selected categories
    selectedCategories.forEach((category) => {
      const checkbox = document.querySelector(
        `.shop_category input[value="${category}"]`
      );
      if (checkbox) {
        checkbox.checked = true;

        // If it's a child category, also expand its parent
        const parentCategory = checkbox.closest(".shop_category");
        if (parentCategory && parentCategory.classList.contains("child")) {
          const parentGroup = parentCategory.closest(".shop_category-group");
          if (parentGroup) {
            const subcategories = parentGroup.querySelector(
              ".shop_subcategories"
            );
            const dropdown = parentGroup.querySelector(
              ".shop_category-dropdown"
            );
            if (subcategories && dropdown) {
              subcategories.style.display = "flex";
              dropdown.style.transform = "rotate(180deg)";
            }
          }
        }
      }
    });
  }

  // Function to populate brands in the filter
  function populateBrands() {
    brands.clear();
    products.forEach((product) => {
      if (product.branding) {
        brands.add(product.branding);
      }
    });

    let brandsHTML = `
      <label class="shop_brand">
        <input type="checkbox" value="all" ${
          selectedBrands.has("all") ? "checked" : ""
        }>
        <span>All</span>
      </label>
    `;

    brandsHTML += Array.from(brands)
      .map(
        (brand) => `
        <label class="shop_brand">
          <input type="checkbox" value="${brand}" ${
          selectedBrands.has(brand) ? "checked" : ""
        }>
          <span>${brand}</span>
        </label>
      `
      )
      .join("");

    brandsContainer.innerHTML = brandsHTML;

    document.querySelectorAll(".shop_brand input").forEach((checkbox) => {
      checkbox.addEventListener("change", handleBrandChange);
    });
  }

  // Handle brand selection change
  function handleBrandChange(e) {
    const checkbox = e.target;
    const brand = checkbox.value;

    if (brand === "all") {
      if (checkbox.checked) {
        selectedBrands.clear();
        selectedBrands.add("all");
        document
          .querySelectorAll('.shop_brand input[type="checkbox"]')
          .forEach((cb) => {
            if (cb !== checkbox) cb.checked = false;
          });
      }
    } else {
      if (checkbox.checked) {
        selectedBrands.delete("all");
        document.querySelector(
          '.shop_brand input[value="all"]'
        ).checked = false;
        selectedBrands.add(brand);
      } else {
        selectedBrands.delete(brand);
        if (selectedBrands.size === 0) {
          selectedBrands.add("all");
          document.querySelector(
            '.shop_brand input[value="all"]'
          ).checked = true;
        }
      }
    }

    currentPage = 1;
    displayProducts();
  }

  // Fetch and display products
  async function fetchAndDisplayProducts() {
    const loadingElement = document.querySelector(".shop_loading");
    try {
      loadingElement.classList.add("active");
      const { data: fetchedProducts, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      products = (fetchedProducts || []).filter((p) => p.available !== false);

      // Set initial category from URL before populating categories
      setInitialCategoryFromURL();

      populateCategories();
      populateBrands();

      // Update checkboxes to reflect URL-based selection
      updateCategoryCheckboxes();

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

  // handleCategoryChange:

  function handleCategoryChange(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    const isParent = checkbox
      .closest(".shop_category")
      .classList.contains("parent");
    const isChild = checkbox
      .closest(".shop_category")
      .classList.contains("child");

    if (value === "all") {
      if (checkbox.checked) {
        // Clear all selections and select "all"
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
        checkbox.checked = true; // Prevent unchecking "all" if nothing else is selected
      }
    } else {
      if (checkbox.checked) {
        // CLEAR ALL PREVIOUS SELECTIONS
        selectedCategories.clear();

        // Uncheck ALL other checkboxes (including "all")
        document
          .querySelectorAll('.shop_category input[type="checkbox"]')
          .forEach((cb) => {
            if (cb !== checkbox) {
              cb.checked = false;
            }
          });

        // Add only the newly selected category
        selectedCategories.add(value);

        console.log(
          "Selected category:",
          value,
          "isParent:",
          isParent,
          "isChild:",
          isChild
        );
      } else {
        // If unchecking the currently selected item, go back to "all"
        selectedCategories.clear();
        selectedCategories.add("all");
        document.querySelector('input[value="all"]').checked = true;
      }
    }

    console.log("Current selected categories:", Array.from(selectedCategories));
    currentPage = 1; // Reset to first page when filters change
    displayProducts();
  }

  // --- Simple Search Feature ---
  let searchQuery = "";
  const searchInput = document.getElementById("shop-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = this.value.trim().toLowerCase();
      displayProducts();
    });
  }

  // Reset button for search
  const searchResetBtn = document.getElementById("shop-search-reset");
  if (searchResetBtn && searchInput) {
    searchResetBtn.addEventListener("click", function () {
      searchInput.value = "";
      searchQuery = "";
      displayProducts();
      searchInput.focus();
    });
  }

  // Patch displayProducts to include search filtering
  const originalDisplayProducts = displayProducts;
  displayProducts = function () {
    let filteredProducts = products;
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((product) => {
        const title = (product.title || "").toLowerCase();
        if (searchQuery.length === 1) {
          return title.startsWith(searchQuery);
        } else {
          return title.includes(searchQuery);
        }
      });
    }
    // Use the rest of the original displayProducts logic
    // Temporarily replace products with filteredProducts
    const oldProducts = products;
    products = filteredProducts;
    originalDisplayProducts();
    products = oldProducts;
  };

  // Display filtered products
  function displayProducts() {
    const filteredProducts = products.filter((product) => {
      // Only show available products
      if (product.available === false) return false;

      // Price filtering
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      // Brand filtering
      const matchesBrand =
        selectedBrands.has("all") ||
        (product.branding && selectedBrands.has(product.branding));

      // Category filtering - SIMPLIFIED LOGIC
      let matchesCategory = false;

      if (selectedCategories.has("all")) {
        // Show all products
        matchesCategory = true;
      } else {
        // Get the single selected category
        const selectedCategory = Array.from(selectedCategories)[0];

        // Check if the selected category is a parent section
        const isSelectedParent = document.querySelector(
          `.shop_category.parent input[value="${selectedCategory}"]`
        );

        if (isSelectedParent) {
          // If parent is selected, show all products from that parent section
          matchesCategory = product.parent_section === selectedCategory;
          console.log(
            "Filtering by parent:",
            selectedCategory,
            "Product parent:",
            product.parent_section,
            "Match:",
            matchesCategory
          );
        } else {
          // If child section is selected, show only products from that specific section
          matchesCategory = product.section === selectedCategory;
          console.log(
            "Filtering by section:",
            selectedCategory,
            "Product section:",
            product.section,
            "Match:",
            matchesCategory
          );
        }
      }

      return matchesCategory && matchesPrice && matchesBrand;
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

    console.log("Filtered products count:", filteredProducts.length);

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
          }'">Details</button>
        </div>
        <div class="shop_product-content">
          <h3 class="shop_product-title">${product.title}</h3>
          ${
            product.instock === false
              ? '<span class="shop_outofstock-label">Out of Stock</span>'
              : ""
          }
          ${
            product.section
              ? `<p class="shop_product-category">${product.section}</p>`
              : ""
          }
          <p class="shop_product-description">${product.description}</p>
          ${
            product.price
              ? `<p class="shop_product-price">$${product.price}</p>
              <button class="shop_add-to-cart-btn ${
                product.instock === false ? "disabled" : ""
              }" 
                data-product='${JSON.stringify(product).replace(
                  /'/g,
                  "&apos;"
                )}' 
                ${product.instock === false ? "disabled" : ""}>
                <span class="material-symbols-outlined">shopping_cart</span>
              </button>`
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners for add to cart buttons
    document.querySelectorAll(".shop_add-to-cart-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const productData = JSON.parse(
          e.target
            .closest(".shop_add-to-cart-btn")
            .dataset.product.replace(/&apos;/g, "'")
        );
        window.addToCart(productData);
      });
    });

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

  // Get the image URL from Supabase storage
  const imageUrl = supabaseClient.storage
    .from("project-images")
    .getPublicUrl(product.image).data.publicUrl;

  card.innerHTML = `
    <div class="shop_product-image">
      <img src="${imageUrl}" alt="${product.title}">
      <button class="shop_read-more-btn" onclick="event.stopPropagation(); window.location.href='product.html?id=${
        product.id
      }'">Details</button>
    </div>
    <div class="shop_product-content">
      <h3 class="shop_product-title">${product.title}</h3>
      ${
        product.instock === false
          ? '<span class="shop_outofstock-label">Out of Stock</span>'
          : ""
      }
      ${
        product.section
          ? `<p class="shop_product-category">${product.section}</p>`
          : ""
      }
      <p class="shop_product-description">${product.description}</p>
      ${
        product.price
          ? `<p class="shop_product-price">$${product.price}</p>
        <button class="shop_add-to-cart-btn ${
          product.instock === false ? "disabled" : ""
        }" 
          data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' 
          ${product.instock === false ? "disabled" : ""}>
          <span class="material-symbols-outlined">shopping_cart</span>
        </button>`
          : ""
      }
    </div>
  `;

  // Add click event listener to redirect to product page
  card.addEventListener("click", () => {
    window.location.href = `product.html?id=${product.id}`;
  });

  // Add event listener for add to cart button
  const addToCartBtn = card.querySelector(".shop_add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productData = JSON.parse(
        e.target
          .closest(".shop_add-to-cart-btn")
          .dataset.product.replace(/&apos;/g, "'")
      );
      window.addToCart(productData);
    });
  }

  return card;
}
