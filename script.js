document.addEventListener("DOMContentLoaded", function () {
  // Variables
  const header = document.querySelector(".header_container");
  const mobileToggle = document.querySelector(".header_mobile-toggle");
  const nav = document.querySelector(".header_nav");
  const navLinks = document.querySelectorAll(".header_nav-link");
  const sections = document.querySelectorAll("section");

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

  // Highlight active section in navigation
  window.addEventListener("scroll", function () {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("header_active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("header_active");
      }
    });
  });
  // Function to check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Counter animation function
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"));
    const duration = 2000; // Animation duration in milliseconds
    const step = target / (duration / 16); // Roughly 60fps
    let current = 0;
    // Store the suffix element separately before we start changing content
    const suffixElement = el.querySelector(".aboutus_stat-plus");
    const suffixText = suffixElement ? suffixElement.textContent : "";
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        // For the final value, set the number and add the suffix
        el.innerHTML =
          target + '<span class="aboutus_stat-plus">' + suffixText + "</span>";
        clearInterval(timer);
      } else {
        el.innerHTML =
          Math.floor(current) +
          '<span class="aboutus_stat-plus">' +
          suffixText +
          "</span>";
      }
    }, 16);
  }

  // Track whether animation has run
  let animationTriggered = false;

  // Function to start animations if elements are in viewport
  function checkAndAnimate() {
    if (animationTriggered) return;

    const statsSection = document.querySelector(".aboutus_stats");
    if (statsSection && isInViewport(statsSection)) {
      const counters = document.querySelectorAll(".aboutus_stat-number");
      counters.forEach((counter) => {
        animateCounter(counter);
      });
      animationTriggered = true;
      // Remove scroll listener after animation triggered
      window.removeEventListener("scroll", checkAndAnimate);
    }
  }

  // Check on scroll and initial page load
  window.addEventListener("scroll", checkAndAnimate);
  checkAndAnimate(); // Check on load in case section is already visible

  const faqItems = document.querySelectorAll(".faq_item");

  faqItems.forEach((item) => {
    const questionContainer = item.querySelector(".faq_question-container");

    questionContainer.addEventListener("click", () => {
      // Check if current item is active
      const isActive = item.classList.contains("active");

      // Close all items
      faqItems.forEach((faq) => {
        faq.classList.remove("active");
      });

      // If clicked item wasn't active before, make it active
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // Select all service items
  const serviceItems = document.querySelectorAll(".services_item");

  // Define descriptions for each service
  const descriptions = {
    "01": "Posters, flyers, business cards, custom notebooks, mugs...",
    "02": "Bulk copying, Color copies",
    "03": "Logos, full marketing materials",
    "04": "Billboards, wall murals, car wraps, Signs, cold neon, flex ...",
    "05": "WOOD, PLEXI, ALOUCOBOND, ALUMINIUM ...",
  };

  // Add event listeners to each service item
  serviceItems.forEach((item) => {
    const titleElement = item.querySelector(".services_title");
    const numberElement = item.querySelector(".services_number");
    const originalHTML = titleElement.innerHTML;
    const serviceNumber = numberElement.textContent;

    item.addEventListener("mouseenter", () => {
      titleElement.innerHTML = descriptions[serviceNumber];
    });

    item.addEventListener("mouseleave", () => {
      titleElement.innerHTML = originalHTML;
    });
  });

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
    for (let i = 0; i < uniqueItemCount; i++) {
      const dot = document.createElement("div");
      dot.classList.add("clients_dot");
      if (i === currentIndex) dot.classList.add("active");

      dot.addEventListener("click", () => {
        if (!isTransitioning) {
          moveToSlide(i);
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
      dot.classList.toggle("active", i === currentIndex);
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
