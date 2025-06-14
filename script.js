document.addEventListener("DOMContentLoaded", function () {
  // Mouse movement effect for hero section
  const hero = document.querySelector(".hero_section");

  if (hero) {
    hero.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = hero.getBoundingClientRect();

      // Calculate mouse position relative to the center of the hero
      const x = (clientX - left - width / 2) / (width / 2);
      const y = (clientY - top - height / 2) / (height / 2);

      // Update CSS variables for rotation
      hero.style.setProperty("--mouse-x", `${x * 10}deg`);
      hero.style.setProperty("--mouse-y", `${y * -10}deg`);
    });

    // Reset transform when mouse leaves
    hero.addEventListener("mouseleave", () => {
      hero.style.setProperty("--mouse-x", "0deg");
      hero.style.setProperty("--mouse-y", "0deg");
    });
  }

  // Mouse trail effect
  const trailContainer = document.createElement("div");
  trailContainer.className = "mouse-trail";
  document.body.appendChild(trailContainer);

  let mouseX = 0;
  let mouseY = 0;
  let lastX = 0;
  let lastY = 0;
  let speed = 0;
  let lastTime = Date.now();
  let lastParticleTime = 0;
  const minParticleInterval = 5;

  function createParticle(x, y, speed, isCurrent = false) {
    const particle = document.createElement("div");
    particle.className = `trail-particle${isCurrent ? " current" : ""}`;

    // Size based on speed and time
    const size = isCurrent ? 2.5 : 1.5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Position with wider offset for more natural distribution
    const offsetX = (Math.random() - 0.5) * 4;
    const offsetY = (Math.random() - 0.5) * 4;
    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;

    // More varied movement for drawing effect
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    const distance1 = Math.random() * 15; // Increased spread
    const distance2 = Math.random() * 20; // Increased spread

    const tx = Math.cos(angle1) * distance1;
    const ty = Math.sin(angle1) * distance1;
    const tx2 = Math.cos(angle2) * distance2;
    const ty2 = Math.sin(angle2) * distance2;

    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    particle.style.setProperty("--tx2", `${tx2}px`);
    particle.style.setProperty("--ty2", `${ty2}px`);

    // Opacity based on speed
    const opacity = isCurrent ? 1 : Math.min(0.9, 0.3 + speed * 0.5);
    particle.style.opacity = opacity;

    trailContainer.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, 2000);
  }

  function updateMousePosition(e) {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;

    // Calculate speed
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    speed = Math.sqrt(dx * dx + dy * dy) / deltaTime;

    // Update positions
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = currentTime;

    // Create particles with time-based spacing
    if (currentTime - lastParticleTime >= minParticleInterval) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Adjust particle count based on speed to prevent line-like appearance
      const baseCount = Math.min(12, Math.max(4, Math.floor(distance / 4)));
      const particleCount = Math.min(baseCount, Math.floor(8 + speed * 2));

      // Create current position particle
      createParticle(mouseX, mouseY, speed, true);

      // Create trail particles with more spread
      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        // Add some randomness to the position
        const randomOffset = (Math.random() - 0.5) * 8;
        const x = lastX + dx * t + randomOffset;
        const y = lastY + dy * t + randomOffset;
        createParticle(x, y, speed);
      }

      lastParticleTime = currentTime;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
  }

  // Start the effect
  if (hero) {
    hero.addEventListener("mousemove", updateMousePosition);
    animate();
  }

  // Initialize AOS
  AOS.init({
    // Global settings
    startEvent: "DOMContentLoaded",
    offset: 120, // Offset (in px) from the original trigger point
    easing: "ease",
    once: false, // Whether animation should happen only once
    mirror: false,
  });

  // Variables
  const header = document.querySelector(".header_container");

  // Set initial header style for index.html
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === "" ||
    window.location.pathname.endsWith("/")
  ) {
    header.classList.add("header_transparent");
  }

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

    // Change header style on scroll for index.html
    if (
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname === "" ||
      window.location.pathname.endsWith("/")
    ) {
      if (window.scrollY > 400) {
        header.classList.remove("header_transparent");
      } else {
        header.classList.add("header_transparent");
      }
    }
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

  // Modal functionality
  const modal = document.querySelector(".services_modal");
  const modalContent = document.querySelector(".services_modal_content");
  const modalClose = document.querySelector(".services_modal_close");
  const modalTitle = document.querySelector(".services_modal_title");
  const modalBody = document.querySelector(".services_modal_body");
  const modalIcon = document.querySelector(".services_modal_icon");
  const serviceItems = document.querySelectorAll(".services_item");

  // Service data
  const servicesData = {
    "vehicle-branding": {
      title: "Vehicle Branding",
      icon: "car-icon.png",
      description:
        "We transform cars into moving billboards, whether full car wraps, window see-through graphics, or partial vinyl cast.",
      services: [
        {
          name: "Car Wrapping",
          description: "Full vehicle wraps with custom designs",
        },
        {
          name: "Car Wrap Printing",
          description: "High-quality vinyl prints for vehicle exteriors",
        },
        {
          name: "Window Graphics",
          description: "See-through window graphics for maximum visibility",
        },
        {
          name: "Partial Branding",
          description:
            "Strategic placement of cast vinyl for targeted messaging",
        },
      ],
    },
    signage: {
      title: "Signage & Outdoor Advertising",
      icon: "signage-icon.png",
      description:
        "We print and produce everything you need to be seen. Flex billboards, cold neon signs, flags, and vinyl cutouts.",
      services: [
        {
          name: "Flex Billboards",
          description: "Large format outdoor advertising displays",
        },
        {
          name: "Flags",
          description: "Custom printed flags for events and storefronts",
        },
        {
          name: "Cold Neon",
          description: "Energy-efficient LED neon-like signage",
        },
        {
          name: "Signs",
          description: "Professional business and directional signage",
        },
        {
          name: "Vinyl Cut",
          description: "Precision cut vinyl lettering and graphics",
        },
        {
          name: "Sand Blasting",
          description: "Etched glass and surface designs",
        },
        {
          name: "Door & Wall Printing",
          description: "Custom graphics for interior and exterior surfaces",
        },
      ],
    },
    printing: {
      title: "Printing Services",
      icon: "printing-icon.png",
      description:
        "We handle a wide range of printing needs with advanced techniques like UV DTF, photo paper prints, and sticker creation. From custom canvas pieces and pillows to professional business cards and napkins.",
      services: [
        {
          name: "UV DTF Printing",
          description: "Direct-to-film printing with UV protection",
        },
        {
          name: "UV Stickers",
          description: "Durable stickers with UV-resistant inks",
        },
        {
          name: "Canvas Printing",
          description: "High-quality art reproduction on canvas",
        },
        {
          name: "Pillow Printing",
          description: "Custom designs on decorative pillows",
        },
        {
          name: "Business Cards",
          description: "Professional card printing with premium finishes",
        },
        {
          name: "Napkin Printing",
          description: "Custom printed napkins for events and businesses",
        },
        {
          name: "Custom QR Code & Barcode Printing",
          description: "Scannable codes for marketing and inventory",
        },
        {
          name: "Photo Paper Printing",
          description: "High-resolution photo reproduction",
        },
      ],
    },
    engraving: {
      title: "Engraving & Cutting",
      icon: "laser-icon.jpeg",
      description:
        "We offer precise engraving and cutting on materials such as wood, plexiglass, alucobond, PVC, and foamboard. Perfect for custom signs, branding pieces, and high-end visual elements.",
      services: [
        {
          name: "Laser Cutting",
          description: "Precision cutting for intricate designs",
        },
        {
          name: "Router Cutting",
          description: "CNC routing for thicker materials",
        },
        {
          name: "Wood Engraving",
          description: "Custom wood signs and decorative elements",
        },
        {
          name: "Plexi Engraving",
          description: "Clear and colored plexiglass engraving",
        },
        {
          name: "Alucobond Engraving",
          description: "Aluminum composite panel customization",
        },
        {
          name: "PVC Engraving",
          description: "Durable plastic signage and displays",
        },
        {
          name: "Foamboard Cutting",
          description: "Lightweight displays and presentation materials",
        },
      ],
    },
    gadgets: {
      title: "Customized Gadgets",
      icon: "gadget-icon.jpg",
      description:
        "Personalize items from tote bags and notebooks to water bottles and rubber bracelets. We help you create branded merchandise and giveaways that leave a lasting impression.",
      services: [
        {
          name: "Water Bottle Printing",
          description: "Custom designs on reusable water bottles",
        },
        {
          name: "Tote Bag Printing",
          description: "Eco-friendly branded shopping bags",
        },
        {
          name: "Notebook Printing",
          description: "Personalized notebooks and journals",
        },
        {
          name: "Customized Rubber Bracelets",
          description: "Silicone wristbands with custom messaging",
        },
        {
          name: "Danglers",
          description: "Hanging promotional pieces for retail environments",
        },
      ],
    },
    educational: {
      title: "Educational & Office Essentials",
      icon: "archisrt_icon_50.jpg",
      description:
        "We supply notebooks, folders, name tags, and more. Functional and beautifully designed to enhance any educational environment.",
      services: [
        {
          name: "School Stationery",
          description: "Complete range of educational supplies",
        },
        {
          name: "Library Essentials",
          description:
            "Organization and identification materials for libraries",
        },
        {
          name: "Name Tags",
          description: "Professional identification badges",
        },
        {
          name: "Folders & Binders",
          description: "Customized organizational tools",
        },
      ],
    },
    branding: {
      title: "Branding & Graphic Design",
      icon: "design-icon.png",
      description:
        "Our design team provides offline campaign materials for municipalities, events, and institutions looking for impactful, large-scale communication.",
      services: [
        {
          name: "Business Branding",
          description: "Complete visual identity development",
        },
        {
          name: "Graphic Design",
          description: "Professional design services for print and display",
        },
        {
          name: "Municipality Campaigns",
          description: "Large-scale public information campaigns",
        },
        {
          name: "Offline Materials",
          description: "Printed collateral for marketing efforts",
        },
        {
          name: "Signage Solutions",
          description: "Integrated visual communication systems",
        },
      ],
    },
  };

  // Open modal when clicking on a service item
  serviceItems.forEach((item) => {
    item.addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      const serviceData = servicesData[category];

      // Set modal content
      modalTitle.textContent = serviceData.title;
      modalIcon.innerHTML = `<img src="images/${serviceData.icon}" alt="${serviceData.title} Icon">`;

      // Generate modal body content
      let modalHtml = `
          <div class="services_description">${serviceData.description}</div>
          <h4 class="services_list_title">Our ${serviceData.title} Services:</h4>
          <div class="services_list">
        `;

      serviceData.services.forEach((service) => {
        modalHtml += `
            <div class="services_list_item">
              <div class="services_list_item_icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L9 16L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="services_list_item_text">
                <strong>${service.name}</strong> - ${service.description}
              </div>
            </div>
          `;
      });

      modalHtml += `</div>`;
      modalBody.innerHTML = modalHtml;

      // Reset any previous animations
      modalContent.style.animation = "";

      // Show modal with animation
      setTimeout(() => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling

        // Add entrance animation
        modalContent.style.animation = "modalEnter 0.4s forwards";
      }, 10);
    });
  });

  // Close modal
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  function closeModal() {
    // First remove the active class after animation completes
    modalContent.style.animation = "modalExit 0.3s forwards";

    setTimeout(() => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }, 300); // Match the animation duration
  }

  // Add hover effects with JS for additional interactivity
  serviceItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      const number = this.querySelector(".services_number");
      number.style.animation = "pulse 1s infinite";
    });

    item.addEventListener("mouseleave", function () {
      const number = this.querySelector(".services_number");
      number.style.animation = "";
    });
  });

  // Add animations
  const style = document.createElement("style");
  style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes modalEnter {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes modalExit {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(30px); opacity: 0; }
      }
      
      .services_item {
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    `;
  document.head.appendChild(style);

  /*const serviceItems = document.querySelectorAll(".services_item");

  const descriptions = {
    "01": "Posters, flyers, business cards, custom notebooks, mugs...",
    "02": "Bulk copying, Color copies",
    "03": "Logos, full marketing materials",
    "04": "Billboards, wall murals, car wraps, Signs, cold neon, flex ...",
    "05": "WOOD, PLEXI, ALOUCOBOND, ALUMINIUM ...",
  };

  serviceItems.forEach((item) => {
    const titleElement = item.querySelector(".services_title");
    const numberElement = item.querySelector(".services_number");
    const serviceNumber = numberElement.textContent;
    const originalHTML = titleElement.innerHTML;

    if (window.innerWidth <= 992) {
      item.classList.add("active");
      titleElement.innerHTML = descriptions[serviceNumber];
    } else {
      item.addEventListener("mouseenter", () => {
        titleElement.innerHTML = descriptions[serviceNumber];
      });

      item.addEventListener("mouseleave", () => {
        titleElement.innerHTML = originalHTML;
      });
    }
  }); */

  /*document.addEventListener("DOMContentLoaded", function () {
    const leaderItems = document.querySelectorAll(".ourleaders_item");

    // Mouse follow effect for leader items
    leaderItems.forEach((item) => {
      item.addEventListener("mousemove", function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;

        this.style.transform = `translateY(${
          this.classList.contains("ourleaders_owner") ? "-15px" : "-10px"
        }) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
      });

      item.addEventListener("mouseleave", function () {
        if (this.classList.contains("ourleaders_owner")) {
          this.style.transform = "translateY(-5px) rotateX(0) rotateY(0)";
        } else {
          this.style.transform = "translateY(0) rotateX(0) rotateY(0)";
        }
        setTimeout(() => {
          this.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
        }, 100);
      });

      item.addEventListener("mouseenter", function () {
        this.style.transition = "transform 0.1s ease, box-shadow 0.4s ease";
      });
    });
  }); */
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

  // Handle dashboard page
  if (window.location.pathname === "/dashboard") {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Not logged in, redirect to home
        window.location.href = "/";
      }
    });

    // Handle logout
    const logoutButton = document.querySelector(".dashboard-logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      });
    }

    // Handle signup modal
    const createAdminButton = document.querySelector(".dashboard-create-admin");
    const signupModal = document.getElementById("dashboard-signup-modal");
    const closeModal = document.getElementById("dashboard-modal-close");
    const signupForm = document.getElementById("dashboard-signup-form");
    const emailError = document.getElementById("dashboard-email-error");
    const passwordError = document.getElementById("dashboard-password-error");
    const confirmPasswordError = document.getElementById(
      "dashboard-confirm-password-error"
    );
    const successMessage = document.getElementById("dashboard-signup-success");

    if (createAdminButton && signupModal && closeModal) {
      // Open modal
      createAdminButton.addEventListener("click", () => {
        signupModal.style.display = "block";
      });

      // Close modal
      closeModal.addEventListener("click", () => {
        signupModal.style.display = "none";
        // Reset form and messages
        signupForm.reset();
        emailError.style.display = "none";
        passwordError.style.display = "none";
        confirmPasswordError.style.display = "none";
        successMessage.style.display = "none";
      });

      // Close modal when clicking outside
      window.addEventListener("click", (e) => {
        if (e.target === signupModal) {
          signupModal.style.display = "none";
          signupForm.reset();
          emailError.style.display = "none";
          passwordError.style.display = "none";
          confirmPasswordError.style.display = "none";
          successMessage.style.display = "none";
        }
      });
    }

    // Handle signup form submission
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById(
          "signup-confirm-password"
        ).value;

        // Reset messages
        emailError.style.display = "none";
        passwordError.style.display = "none";
        confirmPasswordError.style.display = "none";
        successMessage.style.display = "none";

        // Client-side validation
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
          emailError.textContent = "Email is required";
          emailError.style.display = "block";
          isValid = false;
        } else if (!emailRegex.test(email)) {
          emailError.textContent = "Please enter a valid email";
          emailError.style.display = "block";
          isValid = false;
        }

        if (!password) {
          passwordError.textContent = "Password is required";
          passwordError.style.display = "block";
          isValid = false;
        } else if (password.length < 6) {
          passwordError.textContent = "Password must be at least 6 characters";
          passwordError.style.display = "block";
          isValid = false;
        }

        if (!confirmPassword) {
          confirmPasswordError.textContent = "Please confirm your password";
          confirmPasswordError.style.display = "block";
          isValid = false;
        } else if (password !== confirmPassword) {
          confirmPasswordError.textContent = "Passwords do not match";
          confirmPasswordError.style.display = "block";
          isValid = false;
        }

        if (!isValid) return;

        // Proceed with Supabase signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          emailError.textContent = error.message; // Show Supabase errors under email
          emailError.style.display = "block";
        } else {
          successMessage.textContent = "Admin created successfully!";
          successMessage.style.display = "block";
          signupForm.reset();
        }
      });
    }
  }
  const enquiryModal = document.getElementById("enquiry-modal");
  const enquiryModalClose = document.getElementById("enquiry-modal-close");
  const enquiryButtons = document.querySelectorAll(
    ".hero_right_buttons button:nth-child(2), .cta_buttons .cta_button"
  );
  const enquiryForm = document.getElementById("enquiry-modal-form");

  // Open modal
  enquiryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      enquiryModal.style.display = "flex";
      enquiryForm
        .querySelectorAll(".enquiry-success")
        .forEach((el) => el.remove());
    });
  });

  // Close modal
  enquiryModalClose.addEventListener("click", () => {
    enquiryModal.style.display = "none";
    enquiryForm
      .querySelectorAll(".enquiry-success")
      .forEach((el) => el.remove());
  });

  // Form validation
  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("enquiry-name");
    const emailInput = document.getElementById("enquiry-email");
    const companyInput = document.getElementById("enquiry-company");
    const phoneInput = document.getElementById("enquiry-phone");
    const descriptionInput = document.getElementById("enquiry-description");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const company = companyInput.value.trim();
    const phone = phoneInput.value.trim();
    const description = descriptionInput.value.trim();

    // Remove all previous error messages
    enquiryForm.querySelectorAll(".enquiry-error").forEach((el) => el.remove());
    enquiryForm
      .querySelectorAll(".enquiry-success")
      .forEach((el) => el.remove());

    let isValid = true;

    // Validate name
    if (!name) {
      const error = document.createElement("p");
      error.textContent = "Name is required.";
      error.classList.add("enquiry-error");
      nameInput.parentElement.appendChild(error);
      isValid = false;
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = document.createElement("p");
      error.textContent = "Please enter a valid email address.";
      error.classList.add("enquiry-error");
      emailInput.parentElement.appendChild(error);
      isValid = false;
    }

    // Validate phone
    if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
      const error = document.createElement("p");
      error.textContent = "Please enter a valid phone number.";
      error.classList.add("enquiry-error");
      phoneInput.parentElement.appendChild(error);
      isValid = false;
    }

    // Validate description
    if (!description) {
      const error = document.createElement("p");
      error.textContent = "Description is required.";
      error.classList.add("enquiry-error");
      descriptionInput.parentElement.appendChild(error);
      isValid = false;
    }

    // If valid, submit the form
    if (isValid) {
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("company", company);
        formData.append("phone", phone);
        formData.append("description", description);

        const response = await fetch("send_enquiry.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const successMessage = document.createElement("p");
          successMessage.textContent = result.message;
          successMessage.classList.add("enquiry-success");
          enquiryForm.appendChild(successMessage);
          enquiryForm.reset();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent =
          error.message || "Failed to send enquiry. Please try again later.";
        errorMessage.classList.add("enquiry-error");
        enquiryForm.appendChild(errorMessage);
      }
    }
  });

  // Remove error message dynamically when input is corrected
  enquiryForm.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      const error = input.parentElement.querySelector(".enquiry-error");
      if (error) {
        error.remove();
      }
    });
  });

  // Clear success message when modal is reopened
  enquiryModal.addEventListener("click", (event) => {
    if (event.target === enquiryModalClose) {
      // Only close when clicking the close button
      enquiryModal.style.display = "none";
      enquiryForm
        .querySelectorAll(".enquiry-success")
        .forEach((el) => el.remove());
    }
  });

  // Initialize Supabase client
  const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
  );
});
