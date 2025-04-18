document.addEventListener("DOMContentLoaded", function () {
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

  const serviceItems = document.querySelectorAll(".services_item");

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
  });

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
  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("enquiry-name");
    const emailInput = document.getElementById("enquiry-email");
    const phoneInput = document.getElementById("enquiry-phone");
    const descriptionInput = document.getElementById("enquiry-description");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
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

    // If valid, show success message
    if (isValid) {
      const successMessage = document.createElement("p");
      successMessage.textContent = "Enquiry submitted successfully!";
      successMessage.classList.add("enquiry-success");
      enquiryForm.appendChild(successMessage);
      enquiryForm.reset();
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
});
