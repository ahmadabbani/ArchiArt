// Initialize Supabase client
const supabaseClient = supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.key
);

document.addEventListener("DOMContentLoaded", async function () {
  AOS.init({
    // Global settings
    startEvent: "DOMContentLoaded",
    offset: 120, // Offset (in px) from the original trigger point
    easing: "ease",
    once: false, // Whether animation should happen only once
    mirror: false,
  });
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

  const portfolioSection = document.querySelector(".portfolio_section");
  // Add this line to show the loading indicator
  const loadingElement = document.createElement("div");
  loadingElement.className = "portfolio-loading-container";
  loadingElement.innerHTML = "Loading...";
  portfolioSection.appendChild(loadingElement);

  // Fetch projects and galleries
  async function fetchProjects() {
    try {
      // First fetch all projects
      const { data: projects, error: projectsError } = await supabaseClient
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // For each project, fetch its gallery images
      const projectsWithImages = await Promise.all(
        projects.map(async (project) => {
          const { data: galleryImages, error: galleryError } =
            await supabaseClient
              .from("gallery")
              .select("img")
              .eq("project_id", project.id);

          if (galleryError) throw galleryError;

          // Get all image URLs for the project
          const imageUrls = galleryImages.map((img) => {
            const { data } = supabaseClient.storage
              .from("project-images")
              .getPublicUrl(img.img);
            return data.publicUrl;
          });

          return {
            ...project,
            images: imageUrls,
          };
        })
      );

      return projectsWithImages;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  // Render portfolio layout
  function renderPortfolio(projects) {
    // Add this line to remove the loading element
    document.querySelector(".portfolio-loading-container")?.remove();
    const sections = [...new Set(projects.map((project) => project.section))];

    // Create section buttons
    const sectionButtons = document.createElement("div");
    sectionButtons.className = "portfolio-buttons";

    // Add "All" button
    const allButton = document.createElement("button");
    allButton.className = "portfolio-button active";
    allButton.textContent = "All";
    allButton.onclick = () => {
      // Update active button
      document
        .querySelectorAll(".portfolio-button")
        .forEach((btn) => btn.classList.remove("active"));
      allButton.classList.add("active");
      renderProjects(projects);
    };
    sectionButtons.appendChild(allButton);

    // Add section buttons
    sections.forEach((section) => {
      const button = document.createElement("button");
      button.className = "portfolio-button";
      button.textContent = section;
      button.onclick = () => {
        // Update active button
        document
          .querySelectorAll(".portfolio-button")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Filter and render projects for this section
        const sectionProjects = projects.filter(
          (project) => project.section === section
        );
        renderProjects(sectionProjects);
      };
      sectionButtons.appendChild(button);
    });

    // Clear and update portfolio section while preserving the title
    const portfolioSection = document.querySelector(".portfolio_section");
    const title = portfolioSection.querySelector(".portfolio_main-title");
    portfolioSection.innerHTML = "";
    portfolioSection.appendChild(title);
    portfolioSection.appendChild(sectionButtons);

    // Initial render of all projects
    renderProjects(projects);
  }

  // Helper function to render projects
  function renderProjects(projects) {
    const portfolioSection = document.querySelector(".portfolio_section");
    const projectsContainer = document.createElement("div");
    projectsContainer.className = "portfolio-projects";

    // Create a grid container
    const grid = document.createElement("div");
    grid.className = "portfolio-grid";

    projects.forEach((project) => {
      // Create a card for each image in the project
      project.images.forEach((imageUrl, index) => {
        const projectCard = document.createElement("div");
        projectCard.className = "portfolio-project-card";

        // Determine size based on image dimensions with more granular control
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;

          if (aspectRatio > 2.5) {
            projectCard.classList.add("size-panoramic"); // Ultra-wide
          } else if (aspectRatio > 1.8) {
            projectCard.classList.add("size-wide"); // Wide landscape
          } else if (aspectRatio > 1.2) {
            projectCard.classList.add("size-landscape"); // Standard landscape
          } else if (aspectRatio > 0.8) {
            projectCard.classList.add("size-square"); // Square-ish
          } else if (aspectRatio > 0.5) {
            projectCard.classList.add("size-portrait"); // Portrait
          } else {
            projectCard.classList.add("size-tall"); // Very tall
          }
        };
        img.src = imageUrl;

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "portfolio-project-image";

        const displayImg = document.createElement("img");
        displayImg.src = imageUrl;
        displayImg.alt = project.section;
        displayImg.loading = "lazy";

        // Add click handler to show gallery with the clicked image index
        imageWrapper.onclick = () => showGallery(project, index);

        imageWrapper.appendChild(displayImg);
        projectCard.appendChild(imageWrapper);
        grid.appendChild(projectCard);
      });
    });

    projectsContainer.appendChild(grid);

    // Remove existing projects container if any
    const existingContainer = portfolioSection.querySelector(
      ".portfolio-projects"
    );
    if (existingContainer) {
      existingContainer.remove();
    }

    portfolioSection.appendChild(projectsContainer);
  }

  function showGallery(project, clickedImageIndex = 0) {
    const modal = document.createElement("div");
    modal.className = "portfolio-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "portfolio-modal-content";

    // Create close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "portfolio-modal-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      modal.remove();
      document.body.style.overflow = "auto";
    };

    // Create main image
    const mainImage = document.createElement("img");
    mainImage.className = "portfolio-modal-main-image";
    mainImage.src = project.images[clickedImageIndex];
    mainImage.alt = project.section;

    // Create gallery grid
    const galleryGrid = document.createElement("div");
    galleryGrid.className = "portfolio-modal-gallery";

    // Add all images to gallery
    project.images.forEach((imageUrl, index) => {
      const galleryImage = document.createElement("img");
      galleryImage.className = "portfolio-modal-gallery-image";
      galleryImage.src = imageUrl;
      galleryImage.alt = `${project.section} - Image ${index + 1}`;
      if (index === clickedImageIndex) {
        galleryImage.classList.add("active");
      }
      galleryImage.onclick = () => {
        mainImage.src = imageUrl;
        // Update active state
        galleryGrid
          .querySelectorAll(".portfolio-modal-gallery-image")
          .forEach((img) => {
            img.classList.remove("active");
          });
        galleryImage.classList.add("active");
      };
      galleryGrid.appendChild(galleryImage);
    });

    // Assemble modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(mainImage);
    modalContent.appendChild(galleryGrid);
    modal.appendChild(modalContent);

    // Add modal to body and prevent scrolling
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    // Show modal with animation
    requestAnimationFrame(() => {
      modal.style.display = "block";
    });

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = "auto";
      }
    };

    // Close modal with Escape key
    document.addEventListener("keydown", function closeOnEscape(e) {
      if (e.key === "Escape") {
        modal.remove();
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", closeOnEscape);
      }
    });
  }

  // Fetch and render projects
  const projects = await fetchProjects();
  renderPortfolio(projects);
  const carousel = document.querySelector(".clients_logo-carousel");
  const wrapper = document.querySelector(".clients_logo-wrapper");
  const allItems = document.querySelectorAll(".clients_logo-item");
  const uniqueItemCount = allItems.length / 2; // Original items without duplicates
  const prevBtn = document.querySelector(".clients_prev-btn");
  const nextBtn = document.querySelector(".clients_next-btn");
  const dotsContainer = document.querySelector(".clients_dots");

  let currentIndex = 0;
  let itemWidth = 0;
  let itemsPerView = 4;
  let isTransitioning = false;

  function setupCarousel() {
    const wrapperWidth = wrapper.offsetWidth;

    // Determine items per view based on screen size
    if (window.innerWidth > 992) {
      itemsPerView = 4;
    } else if (window.innerWidth > 768) {
      itemsPerView = 3;
    } else if (window.innerWidth > 480) {
      itemsPerView = 2;
    } else {
      itemsPerView = 1;
    }

    itemWidth = wrapperWidth / itemsPerView;

    // Size all items
    allItems.forEach((item) => {
      item.style.minWidth = `${itemWidth}px`;
      item.style.maxWidth = `${itemWidth}px`;
    });

    // Create or update dots
    dotsContainer.innerHTML = "";
    const totalDots = Math.ceil(uniqueItemCount / itemsPerView);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("div");
      dot.classList.add("clients_dot");
      if (i === currentIndex) dot.classList.add("active");

      dot.addEventListener("click", () => {
        if (!isTransitioning) {
          moveToSlide(i * itemsPerView);
        }
      });

      dotsContainer.appendChild(dot);
    }

    // Apply initial position
    updateCarouselPosition(false);
  }

  function moveToSlide(targetIndex) {
    // Prevent rapid clicks
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex = targetIndex;
    updateCarouselPosition(true);

    // Reset transition lock after animation completes
    setTimeout(() => {
      isTransitioning = false;
    }, 500);
  }

  function updateCarouselPosition(animate) {
    // Apply the transform
    const offset = -currentIndex * itemWidth;
    carousel.style.transition = animate ? "transform 0.5s ease" : "none";
    carousel.style.transform = `translateX(${offset}px)`;

    // Update dots
    document.querySelectorAll(".clients_dot").forEach((dot, i) => {
      dot.classList.toggle(
        "active",
        i === Math.floor(currentIndex / itemsPerView)
      );
    });
  }

  function nextSlide() {
    if (isTransitioning) return;

    currentIndex++;
    // If we're about to show the duplicated items, instead reset to beginning
    if (currentIndex >= uniqueItemCount) {
      currentIndex = 0;
    }
    moveToSlide(currentIndex);
  }

  function prevSlide() {
    if (isTransitioning) return;

    currentIndex--;
    // If we go before the first item, go to the last real item
    if (currentIndex < 0) {
      currentIndex = uniqueItemCount - 1;
    }
    moveToSlide(currentIndex);
  }

  // Button listeners
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  // Auto slide every 5 seconds
  let autoSlideTimer = setInterval(nextSlide, 3000);

  // Pause autoSlide on hover
  wrapper.addEventListener("mouseenter", () => {
    clearInterval(autoSlideTimer);
  });

  wrapper.addEventListener("mouseleave", () => {
    autoSlideTimer = setInterval(nextSlide, 3000);
  });

  // Initialize and handle resize
  setupCarousel();
  window.addEventListener("resize", setupCarousel);
});
