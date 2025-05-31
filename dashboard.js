// Initialize Supabase client
console.log("Dashboard script loaded");
console.log("Supabase available:", typeof supabase !== "undefined");

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
  console.log("Dashboard page DOM loaded");

  // Check if user is logged in
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      window.location.href = "/";
    } else {
      document.getElementById("dashboard-content").style.display = "block";
    }
  });

  // Handle logout
  const logoutButton = document.querySelector(".dashboard-logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      logoutButton.innerHTML = '<span class="logout-spinner"></span>';
      logoutButton.disabled = true;

      await supabaseClient.auth.signOut();
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
      //signupForm.reset();
      emailError.style.display = "none";
      passwordError.style.display = "none";
      confirmPasswordError.style.display = "none";
      successMessage.style.display = "none";
    });
  }

  // Handle signup form submission
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById(
        "signup-confirm-password"
      ).value;

      // Get button element
      const signupButton = document.querySelector(
        ".dashboard-button.dashboard-submit"
      );

      // Show loading spinner on submit
      signupButton.innerHTML = '<span class="signup-spinner"></span>'; // Add spinner
      signupButton.disabled = true; // Disable the button during submission

      // Reset messages
      emailError.style.display = "none";
      passwordError.style.display = "none";
      confirmPasswordError.style.display = "none";
      successMessage.style.display = "none";

      // Client-side validation
      let isValid = true;

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        emailError.textContent = "Email is required";
        emailError.style.display = "block";
        isValid = false;
      } else if (!emailRegex.test(email)) {
        emailError.textContent = "Please enter a valid email format";
        emailError.style.display = "block";
        isValid = false;
      }

      // Validate password
      if (!password) {
        passwordError.textContent = "Password is required";
        passwordError.style.display = "block";
        isValid = false;
      } else if (password.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters";
        passwordError.style.display = "block";
        isValid = false;
      }

      // Validate confirm password
      if (!confirmPassword) {
        confirmPasswordError.textContent = "Please confirm your password";
        confirmPasswordError.style.display = "block";
        isValid = false;
      } else if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match";
        confirmPasswordError.style.display = "block";
        isValid = false;
      }

      if (!isValid) {
        signupButton.innerHTML = "Create Admin";
        signupButton.disabled = false;
        return false;
      }

      try {
        // Proceed with Supabase signup
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.log("Signup error:", error.message);

          // Handle specific errors
          if (error.message.includes("already registered")) {
            emailError.textContent = "This email is already registered";
            emailError.style.display = "block";
          } else {
            emailError.textContent = error.message;
            emailError.style.display = "block";
          }
          // Reset button after error
          signupButton.innerHTML = "Create Admin"; // Reset button text
          signupButton.disabled = false; // Enable button
        } else {
          // Signup successful
          successMessage.textContent = "Admin created successfully!";
          successMessage.style.display = "block";
          signupForm.reset();
          // Reset button after success
          signupButton.innerHTML = "Create Admin"; // Reset button text
          signupButton.disabled = false; // Enable button
        }
      } catch (err) {
        console.error("Signup error:", err);
        emailError.textContent = "An unexpected error occurred";
        emailError.style.display = "block";
        // Reset button after unexpected error
        signupButton.innerHTML = "Create Admin"; // Reset button text
        signupButton.disabled = false; // Enable button
      }
    });
  }
  // Handle reset password
  const resetPasswordButton = document.querySelector(
    ".dashboard-reset-password"
  );
  const resetModal = document.getElementById("dashboard-reset-modal");
  const closeResetModal = document.getElementById("reset-modal-close");
  const resetForm = document.getElementById("dashboard-reset-form");
  const newPasswordError = document.getElementById("reset-new-password-error");
  const confirmNewPasswordError = document.getElementById(
    "reset-confirm-password-error"
  );
  const resetSuccessMessage = document.getElementById("reset-password-success");

  if (resetPasswordButton && resetModal && closeResetModal) {
    // Open modal
    resetPasswordButton.addEventListener("click", () => {
      resetModal.style.display = "block";
    });

    // Close modal
    closeResetModal.addEventListener("click", () => {
      resetModal.style.display = "none";
      //resetForm.reset();
      newPasswordError.style.display = "none";
      confirmNewPasswordError.style.display = "none";
      resetSuccessMessage.style.display = "none";
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const newPassword = document.getElementById("reset-new-password").value;
      const confirmNewPassword = document.getElementById(
        "reset-confirm-password"
      ).value;

      // Get button element
      const resetButton = document.querySelector(
        ".dashboard-button.dashboard-submit"
      );

      // Show loading spinner on submit
      resetButton.innerHTML = '<span class="reset-spinner"></span>'; // Add spinner
      resetButton.disabled = true; // Disable the button during submission

      // Reset messages
      newPasswordError.style.display = "none";
      confirmNewPasswordError.style.display = "none";
      resetSuccessMessage.style.display = "none";

      // Client-side validation
      let isValid = true;

      if (!newPassword) {
        newPasswordError.textContent = "New password is required";
        newPasswordError.style.display = "block";
        isValid = false;
      } else if (newPassword.length < 6) {
        newPasswordError.textContent = "Password must be at least 6 characters";
        newPasswordError.style.display = "block";
        isValid = false;
      }

      if (!confirmNewPassword) {
        confirmNewPasswordError.textContent =
          "Please confirm your new password";
        confirmNewPasswordError.style.display = "block";
        isValid = false;
      } else if (newPassword !== confirmNewPassword) {
        confirmNewPasswordError.textContent = "Passwords do not match";
        confirmNewPasswordError.style.display = "block";
        isValid = false;
      }

      // If validation fails, reset button and exit
      if (!isValid) {
        resetButton.innerHTML = "Update Password"; // Reset button text
        resetButton.disabled = false; // Enable button
        return false;
      }

      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session) {
          newPasswordError.textContent =
            "You need to be logged in to change your password";
          newPasswordError.style.display = "block";
          // Reset button after error
          resetButton.innerHTML = "Update Password"; // Reset button text
          resetButton.disabled = false; // Enable button
          return;
        }

        const { error } = await supabaseClient.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          newPasswordError.textContent = error.message;
          newPasswordError.style.display = "block";
          // Reset button after error
          resetButton.innerHTML = "Update Password"; // Reset button text
          resetButton.disabled = false; // Enable button
        } else {
          resetSuccessMessage.textContent = "Password updated successfully!";
          resetSuccessMessage.style.display = "block";
          resetForm.reset();
          // Reset button after success
          resetButton.innerHTML = "Update Password"; // Reset button text
          resetButton.disabled = false; // Enable button
        }
      } catch (err) {
        newPasswordError.textContent = "An unexpected error occurred";
        newPasswordError.style.display = "block";
        // Reset button after unexpected error
        resetButton.innerHTML = "Update Password"; // Reset button text
        resetButton.disabled = false; // Enable button
      }
    });
  }

  // Handle project creation
  const addProjectButton = document.querySelector(".dashboard-add-project");
  const projectModal = document.getElementById("dashboard-project-modal");
  const closeProjectModal = document.getElementById("project-modal-close");
  const projectForm = document.getElementById("dashboard-project-form");
  const addGalleryButton = document.getElementById("add-gallery-input");
  const galleryInputsContainer = document.getElementById("gallery-inputs");

  // Handle product creation
  const addProductButton = document.querySelector(".dashboard-add-product");
  const productModal = document.getElementById("dashboard-product-modal");
  const closeProductModal = document.getElementById("product-modal-close");
  const productForm = document.getElementById("dashboard-product-form");

  if (addProductButton && productModal && closeProductModal) {
    // Open modal
    addProductButton.addEventListener("click", async () => {
      productModal.style.display = "block";

      // Fetch existing sections
      try {
        const { data: products, error } = await supabaseClient
          .from("products")
          .select("section")
          .not("section", "is", null);

        if (error) throw error;

        // Get unique sections
        const sections = [
          ...new Set(products.map((p) => p.section).filter(Boolean)),
        ];

        // Populate section dropdown
        const sectionSelect = document.getElementById("product-section");
        sectionSelect.innerHTML =
          '<option value="">Select an existing section</option>';
        sections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          sectionSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    });

    // Close modal
    closeProductModal.addEventListener("click", () => {
      productModal.style.display = "none";
      productForm.reset();
      // Reset error messages
      document
        .querySelectorAll(".dashboard-error")
        .forEach((el) => (el.style.display = "none"));
      document.getElementById("product-success").style.display = "none";
      // Reset image preview
      const preview = document.getElementById("product-image-preview");
      preview.classList.remove("visible");
      preview.src = "";
      // Reset file name
      document.querySelector("#product-image-wrapper .file-name").textContent =
        "";
    });
  }

  // Handle product form submission
  if (productForm) {
    productForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("product-title").value.trim();
      const description = document
        .getElementById("product-description")
        .value.trim();
      const price = document.getElementById("product-price").value;
      const image = document.getElementById("product-image").files[0];
      const section = document.getElementById("product-section").value;
      const newSection = document
        .getElementById("new-product-section")
        .value.trim();

      // Get button element
      const submitButton = productForm.querySelector(".dashboard-submit");

      // Show loading spinner on submit
      submitButton.innerHTML = '<span class="submit-spinner"></span>';
      submitButton.disabled = true;

      // Reset messages
      document
        .querySelectorAll(".dashboard-error")
        .forEach((el) => (el.style.display = "none"));
      document.getElementById("product-success").style.display = "none";

      // Client-side validation
      let isValid = true;

      if (!title) {
        document.getElementById("product-title-error").textContent =
          "Title is required";
        document.getElementById("product-title-error").style.display = "block";
        isValid = false;
      }

      if (!description) {
        document.getElementById("product-description-error").textContent =
          "Description is required";
        document.getElementById("product-description-error").style.display =
          "block";
        isValid = false;
      }

      if (!image) {
        document.getElementById("product-image-error").textContent =
          "Product image is required";
        document.getElementById("product-image-error").style.display = "block";
        isValid = false;
      }

      // Validate section selection
      if (section && newSection) {
        document.getElementById("product-section-error").textContent =
          "Please select either an existing section or create a new one, not both";
        document.getElementById("product-section-error").style.display =
          "block";
        isValid = false;
      }

      if (!isValid) {
        submitButton.innerHTML = "Create Product";
        submitButton.disabled = false;
        return;
      }

      try {
        // Check if user is authenticated
        const {
          data: { session },
          error: sessionError,
        } = await supabaseClient.auth.getSession();
        if (sessionError || !session) {
          throw new Error("You must be logged in to create a product");
        }

        // Upload image to Supabase storage
        const imagePath = `project-images/${Date.now()}-${image.name}`;
        const { data: imageData, error: imageError } =
          await supabaseClient.storage
            .from("project-images")
            .upload(imagePath, image, {
              cacheControl: "3600",
              upsert: false,
            });

        if (imageError) {
          console.error("Image upload error:", imageError);
          throw new Error(`Image upload failed: ${imageError.message}`);
        }

        // Insert product into database
        const { data: productData, error: productError } = await supabaseClient
          .from("products")
          .insert([
            {
              title,
              description,
              price: price ? parseFloat(price) : null,
              image: imagePath,
              section: newSection || section || null,
            },
          ])
          .select()
          .single();

        if (productError) {
          console.error("Product insert error:", productError);
          throw new Error(`Product creation failed: ${productError.message}`);
        }

        // Show success message
        document.getElementById("product-success").textContent =
          "Product created successfully!";
        document.getElementById("product-success").style.display = "block";
        productForm.reset();
        // Reset image preview
        const preview = document.getElementById("product-image-preview");
        preview.classList.remove("visible");
        preview.src = "";
        // Reset file name
        document.querySelector(
          "#product-image-wrapper .file-name"
        ).textContent = "";

        // After successful creation, switch to products view and refresh
        const projectsDisplay = document.querySelector(".projects-display");
        const productsDisplay = document.querySelector(".products-display");

        // Switch to products view
        projectsDisplay.style.display = "none";
        productsDisplay.style.display = "block";

        // Update toggle button text
        document.querySelectorAll(".toggle-view-btn").forEach((btn) => {
          btn.textContent = "Show Projects";
        });

        // Close the modal
        document.getElementById("dashboard-product-modal").style.display =
          "none";

        // Refresh products list
        await fetchAndDisplayProducts();
      } catch (error) {
        console.error("Error creating product:", error);
        document.getElementById("product-success").style.display = "none";
        document.getElementById("product-image-error").textContent =
          "Error creating product. Please try again.";
        document.getElementById("product-image-error").style.display = "block";
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = "Create Product";
      }
    });
  }

  // Initialize product image preview
  const productImageInput = document.getElementById("product-image");
  const productImagePreview = document.getElementById("product-image-preview");
  const productFileNameSpan =
    productImageInput.previousElementSibling.querySelector(".file-name");
  handleFileInput(productImageInput, productImagePreview, productFileNameSpan);

  if (addProjectButton && projectModal && closeProjectModal) {
    // Open modal
    addProjectButton.addEventListener("click", async () => {
      projectModal.style.display = "block";

      // Fetch existing sections and subsections
      try {
        const { data: projects, error } = await supabaseClient
          .from("projects")
          .select("section, subsection")
          .not("section", "is", null);

        if (error) throw error;

        // Get unique sections and subsections
        const sections = [
          ...new Set(projects.map((p) => p.section).filter(Boolean)),
        ];
        const subsections = [
          ...new Set(projects.map((p) => p.subsection).filter(Boolean)),
        ];

        // Populate section dropdown
        const sectionSelect = document.getElementById("project-section");
        sectionSelect.innerHTML =
          '<option value="">Select an existing section</option>';
        sections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          sectionSelect.appendChild(option);
        });

        // Populate subsection dropdown
        const subsectionSelect = document.getElementById("project-subsection");
        subsectionSelect.innerHTML =
          '<option value="">Select an existing subsection</option>';
        subsections.forEach((subsection) => {
          const option = document.createElement("option");
          option.value = subsection;
          option.textContent = subsection;
          subsectionSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error fetching sections and subsections:", error);
      }
    });

    // Close modal
    closeProjectModal.addEventListener("click", () => {
      projectModal.style.display = "none";
      projectForm.reset();
      // Reset gallery inputs to just one
      galleryInputsContainer.innerHTML = `
        <div class="gallery-input-container">
          <input type="file" class="gallery-image-input" accept="image/*" />
          <button type="button" class="remove-gallery-btn" style="display: none">&times;</button>
        </div>
      `;
      // Reset error messages
      document
        .querySelectorAll(".dashboard-error")
        .forEach((el) => (el.style.display = "none"));
      document.getElementById("project-success").style.display = "none";
    });
  }

  // Handle adding gallery inputs
  if (addGalleryButton) {
    addGalleryButton.addEventListener("click", () => {
      const newInput = document.createElement("div");
      newInput.className = "gallery-input-container";
      const inputId = `gallery-image-${
        document.querySelectorAll(".gallery-input-container").length
      }`;
      newInput.innerHTML = `
        <div class="file-input-wrapper">
          <label for="${inputId}" class="file-input-label">
            <i class="fas fa-image"></i> Choose Image
            <span class="file-name"></span>
          </label>
          <input type="file" id="${inputId}" class="gallery-image-input" accept="image/*" />
        </div>
        <button type="button" class="remove-gallery-btn">&times;</button>
      `;
      galleryInputsContainer.appendChild(newInput);

      // Initialize the new file input
      const newFileInput = newInput.querySelector(".gallery-image-input");
      const newFileNameSpan = newInput.querySelector(".file-name");
      handleFileInput(newFileInput, null, newFileNameSpan);
    });
  }

  // Handle file input changes and previews
  function handleFileInput(input, preview, fileNameSpan) {
    input.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        fileNameSpan.textContent = file.name;

        // Only show preview for main image
        if (input.id === "project-main-image") {
          const reader = new FileReader();
          reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.add("visible");
          };
          reader.readAsDataURL(file);
        }
      } else {
        fileNameSpan.textContent = "";
        if (input.id === "project-main-image") {
          preview.classList.remove("visible");
        }
      }
    });
  }

  // Initialize file inputs
  const mainImageInput = document.getElementById("project-main-image");
  if (mainImageInput) {
    const mainImagePreview = document.getElementById("main-image-preview");
    const mainFileNameSpan =
      mainImageInput.previousElementSibling.querySelector(".file-name");
    handleFileInput(mainImageInput, mainImagePreview, mainFileNameSpan);
  }

  // Handle gallery file inputs
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-gallery-btn")) {
      e.target.parentElement.remove();
    }
  });

  // Handle existing and new gallery inputs
  function initializeGalleryInputs() {
    document.querySelectorAll(".gallery-image-input").forEach((input) => {
      const preview = input.nextElementSibling;
      const fileNameSpan =
        input.previousElementSibling?.querySelector(".file-name");
      if (fileNameSpan) {
        handleFileInput(input, preview, fileNameSpan);
      }
    });
  }

  // Initialize existing gallery inputs
  initializeGalleryInputs();

  // Add event listeners for toggle view buttons
  document.querySelectorAll(".toggle-view-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const projectsDisplay = document.querySelector(".projects-display");
      const productsDisplay = document.querySelector(".products-display");
      const projectsGrid = document.getElementById("projects-grid");
      const productsGrid = document.getElementById("products-grid");

      if (projectsDisplay.style.display === "none") {
        // Switch to projects view
        projectsDisplay.style.display = "block";
        productsDisplay.style.display = "none";
        // Clear products grid
        productsGrid.innerHTML = "";
        // Fetch and display projects
        fetchAndDisplayProjects();
        // Update button text after state change
        setTimeout(() => {
          document.querySelectorAll(".toggle-view-btn").forEach((btn) => {
            btn.textContent = "Show Products";
          });
        }, 0);
      } else {
        // Switch to products view
        projectsDisplay.style.display = "none";
        productsDisplay.style.display = "block";
        // Clear projects grid
        projectsGrid.innerHTML = "";
        // Fetch and display products
        fetchAndDisplayProducts();
        // Update button text after state change
        setTimeout(() => {
          document.querySelectorAll(".toggle-view-btn").forEach((btn) => {
            btn.textContent = "Show Projects";
          });
        }, 0);
      }
    });
  });

  // Initialize display state
  document.addEventListener("DOMContentLoaded", () => {
    const projectsDisplay = document.querySelector(".projects-display");
    const productsDisplay = document.querySelector(".products-display");

    // Initially show projects
    projectsDisplay.style.display = "block";
    productsDisplay.style.display = "none";

    // Load initial projects
    fetchAndDisplayProjects();
  });

  // Project form submission handler
  document
    .getElementById("dashboard-project-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Project form submitted");

      // Add loading state to submit button
      const submitBtn = e.target.querySelector(".dashboard-submit");
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="submit-spinner"></div>';

      try {
        // Get the selected section or new section
        const sectionSelect = document.getElementById("project-section");
        const newSectionInput = document.getElementById("new-project-section");
        let section = sectionSelect.value;

        if (!section && newSectionInput.value.trim()) {
          section = newSectionInput.value.trim();
        }

        if (!section) {
          const errorElement = document.getElementById("project-section-error");
          errorElement.textContent = "Please select or create a section";
          errorElement.style.display = "block";
          return;
        }

        // Validate gallery images
        const galleryInputs = document.querySelectorAll(
          "#gallery-inputs .gallery-image-input"
        );
        let hasValidImages = false;
        const galleryImages = [];

        for (const input of galleryInputs) {
          if (input.files && input.files[0]) {
            hasValidImages = true;
            const file = input.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
              .toString(36)
              .substring(2)}.${fileExt}`;
            const filePath = `project-images/${fileName}`;

            // Upload image to storage
            const { error: uploadError } = await supabaseClient.storage
              .from("project-images")
              .upload(filePath, file);

            if (uploadError) {
              console.error("Error uploading gallery image:", uploadError);
              throw uploadError;
            }

            galleryImages.push(filePath);
          }
        }

        if (!hasValidImages) {
          const errorElement = document.getElementById("gallery-images-error");
          errorElement.textContent = "Please add at least one gallery image";
          errorElement.style.display = "block";
          return;
        }

        // Create project with just the section
        const { data: project, error: projectError } = await supabaseClient
          .from("projects")
          .insert([
            {
              section: section,
            },
          ])
          .select()
          .single();

        if (projectError) {
          console.error("Error creating project:", projectError);
          throw projectError;
        }

        // Insert gallery images
        const galleryEntries = galleryImages.map((img) => ({
          project_id: project.id,
          img: img,
        }));

        const { error: galleryError } = await supabaseClient
          .from("gallery")
          .insert(galleryEntries);

        if (galleryError) {
          console.error("Error inserting gallery images:", galleryError);
          throw galleryError;
        }

        // Close modal and refresh projects list
        document.getElementById("dashboard-project-modal").style.display =
          "none";
        await fetchAndDisplayProjects();

        console.log("Project created successfully");
      } catch (error) {
        console.error("Error in project form submission:", error);
        alert("Error creating project. Please try again.");
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

  // Update showProjectDetails to store project ID correctly
  async function showProjectDetails(project) {
    try {
      // Fetch gallery images for this project
      const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("gallery")
        .select("*")
        .eq("project_id", project.id);

      if (galleryError) {
        console.error("Error fetching gallery images:", galleryError);
        throw galleryError;
      }

      // Update modal content
      const modal = document.getElementById("project-details-modal");
      const titleElement = modal.querySelector(".project-details-title");
      const sectionElement = modal.querySelector(".project-details-section");
      const mainImageElement = modal.querySelector(
        ".project-details-main-image img"
      );
      const galleryGrid = modal.querySelector(".project-gallery-grid");
      const editButton = modal.querySelector(".project-edit-button");
      const deleteButton = modal.querySelector(".delete-project-btn");

      titleElement.textContent = project.section; // Use section as title
      sectionElement.style.display = "none"; // Hide the duplicate section element
      modal.dataset.projectId = project.id;

      // Set main image to first gallery image if available
      if (galleryImages && galleryImages.length > 0) {
        const mainImagePath = galleryImages[0].img;
        const { data: mainImageUrl } = supabaseClient.storage
          .from("project-images")
          .getPublicUrl(mainImagePath);
        mainImageElement.src = mainImageUrl.publicUrl;
      }

      // Clear and populate gallery grid
      galleryGrid.innerHTML = "";
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((image) => {
          const { data: imageUrl } = supabaseClient.storage
            .from("project-images")
            .getPublicUrl(image.img);

          const galleryItem = document.createElement("div");
          galleryItem.className = "project-gallery-image";
          galleryItem.innerHTML = `
            <img src="${imageUrl.publicUrl}" alt="Gallery image" />
          `;

          // Add click event for full-size view
          galleryItem.addEventListener("click", () => {
            const previewModal = document.getElementById("image-preview-modal");
            const previewImage = previewModal.querySelector(".preview-image");
            previewImage.src = imageUrl.publicUrl;
            previewModal.style.display = "block";
          });

          galleryGrid.appendChild(galleryItem);
        });
      }

      // Show the modal
      modal.style.display = "block";

      // Add event listener for edit button
      editButton.onclick = () => {
        modal.style.display = "none";
        const editModal = document.getElementById("edit-project-modal");
        const editForm = document.getElementById("edit-project-form");
        editForm.dataset.projectId = project.id;

        // Populate edit form
        const sectionSelect = document.getElementById("edit-project-section");
        sectionSelect.innerHTML = ""; // Clear existing options
        const option = document.createElement("option");
        option.value = project.section;
        option.textContent = project.section;
        option.selected = true;
        sectionSelect.appendChild(option);

        // Display current gallery images
        const currentGalleryGrid = document.getElementById(
          "edit-current-gallery"
        );
        currentGalleryGrid.innerHTML = "";

        if (galleryImages && galleryImages.length > 0) {
          galleryImages.forEach((image) => {
            const { data: imageUrl } = supabaseClient.storage
              .from("project-images")
              .getPublicUrl(image.img);

            const galleryItem = document.createElement("div");
            galleryItem.className = "edit-gallery-item";
            galleryItem.dataset.imagePath = image.img;
            galleryItem.innerHTML = `
              <div class="edit-gallery-thumbnail">
                <img src="${imageUrl.publicUrl}" alt="Gallery image" />
              </div>
              <button type="button" class="remove-gallery-image" data-image-path="${image.img}">×</button>
            `;
            currentGalleryGrid.appendChild(galleryItem);
          });
        }

        editModal.style.display = "block";
      };

      // Add event listener for delete button
      deleteButton.onclick = () => {
        const deleteModal = document.getElementById(
          "delete-confirmation-modal"
        );
        const confirmDeleteBtn = deleteModal.querySelector(
          ".confirm-delete-btn"
        );
        const cancelDeleteBtn = deleteModal.querySelector(".cancel-delete-btn");

        deleteModal.style.display = "block";
        modal.style.display = "none";

        const handleConfirm = async () => {
          try {
            // Add loading state to confirm button
            const originalText = confirmDeleteBtn.innerHTML;
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<div class="delete-spinner"></div>';

            // First get the project's gallery images
            const { data: galleryImages, error: galleryError } =
              await supabaseClient
                .from("gallery")
                .select("img")
                .eq("project_id", project.id);

            if (galleryError) {
              console.error("Error fetching gallery images:", galleryError);
              throw galleryError;
            }

            // Delete gallery images from storage if they exist
            if (galleryImages && galleryImages.length > 0) {
              const imagePaths = galleryImages.map((img) => img.img);
              const { error: storageError } = await supabaseClient.storage
                .from("project-images")
                .remove(imagePaths);

              if (storageError) {
                console.error(
                  "Error deleting images from storage:",
                  storageError
                );
                throw storageError;
              }
            }

            // Delete gallery entries from database
            const { error: galleryDeleteError } = await supabaseClient
              .from("gallery")
              .delete()
              .eq("project_id", project.id);

            if (galleryDeleteError) {
              console.error(
                "Error deleting gallery entries:",
                galleryDeleteError
              );
              throw galleryDeleteError;
            }

            // Finally delete the project
            const { error: projectDeleteError } = await supabaseClient
              .from("projects")
              .delete()
              .eq("id", project.id);

            if (projectDeleteError) {
              console.error("Error deleting project:", projectDeleteError);
              throw projectDeleteError;
            }

            // Close all modals
            document.getElementById("project-details-modal").style.display =
              "none";
            deleteModal.style.display = "none";

            // Refresh projects list
            await fetchAndDisplayProjects();
          } catch (error) {
            console.error("Error in delete confirmation:", error);
            // Remove the error alert since deletion is working
          } finally {
            // Reset button state
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = "Delete";
            // Clean up event listeners
            confirmDeleteBtn.removeEventListener("click", handleConfirm);
            cancelDeleteBtn.removeEventListener("click", handleCancel);
          }
        };

        const handleCancel = () => {
          deleteModal.style.display = "none";
          // Clean up event listeners
          confirmDeleteBtn.removeEventListener("click", handleConfirm);
          cancelDeleteBtn.removeEventListener("click", handleCancel);
        };

        confirmDeleteBtn.addEventListener("click", handleConfirm);
        cancelDeleteBtn.addEventListener("click", handleCancel);
      };
    } catch (error) {
      console.error("Error showing project details:", error);
      alert("Error loading project details. Please try again.");
    }
  }

  // Add event listener for edit project button
  document.addEventListener("click", async (e) => {
    // Check if we're in the project details modal and the edit button was clicked
    if (
      e.target.closest(".project-edit-button") &&
      document.getElementById("project-details-modal").style.display === "block"
    ) {
      const detailsModal = document.getElementById("project-details-modal");
      const projectId = detailsModal.dataset.projectId;
      console.log("Edit project button clicked, project ID:", projectId);

      if (!projectId) {
        console.error("No project ID found in project details modal");
        return;
      }

      try {
        // Fetch project data
        const { data: project, error } = await supabaseClient
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
          throw error;
        }

        console.log("Fetched project data:", project);

        // Populate edit form
        document.getElementById("edit-project-section").value = project.section;

        // Populate sections dropdown
        const sectionSelect = document.getElementById("edit-project-section");
        console.log("Fetching sections...");
        const { data: sections, error: sectionsError } = await supabaseClient
          .from("products")
          .select("section")
          .order("section");

        if (sectionsError) {
          console.error("Error fetching sections:", sectionsError);
          throw sectionsError;
        }

        // Get unique sections
        const uniqueSections = [...new Set(sections.map((s) => s.section))];
        console.log("Fetched sections:", uniqueSections);

        sectionSelect.innerHTML =
          '<option value="">Select an existing section</option>';
        uniqueSections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          option.selected = section === project.section;
          sectionSelect.appendChild(option);
        });

        // Show current gallery images
        const galleryGrid = document.getElementById("edit-current-gallery");
        galleryGrid.innerHTML = "";

        if (project.gallery && project.gallery.length > 0) {
          project.gallery.forEach((imagePath) => {
            const { data } = supabaseClient.storage
              .from("project-images")
              .getPublicUrl(imagePath);

            const galleryItem = document.createElement("div");
            galleryItem.className = "edit-gallery-item";
            galleryItem.innerHTML = `
              <div class="edit-gallery-thumbnail">
                <img src="${data.publicUrl}" alt="Gallery image" />
                <button type="button" class="remove-gallery-image" data-image="${imagePath}">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `;
            galleryGrid.appendChild(galleryItem);
          });
        }

        // Show edit modal
        document.getElementById("edit-project-modal").style.display = "block";
      } catch (error) {
        console.error("Error in edit project:", error);
        alert("Error loading project data. Please try again.");
      }
    }
  });

  // Fetch and display products
  async function fetchAndDisplayProducts() {
    try {
      const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const productsGrid = document.getElementById("products-grid");
      productsGrid.innerHTML = "";

      if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-projects">No products found</p>';
        return;
      }

      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "portfolio-project-card";
        productCard.dataset.productId = product.id; // Store ID in dataset

        let imageUrl = "";
        if (product.image) {
          const { data } = supabaseClient.storage
            .from("project-images")
            .getPublicUrl(product.image);
          imageUrl = data.publicUrl;
        }

        productCard.innerHTML = `
          <div class="portfolio-project-image">
            <img src="${imageUrl}" alt="${product.title}" />
          </div>
          <div class="portfolio-project-title">${product.title}</div>
        `;

        productCard.addEventListener("click", () => {
          console.log("Product clicked:", product); // Debug log
          showProductDetails(product);
        });
        productsGrid.appendChild(productCard);
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  // Show product details modal
  async function showProductDetails(product) {
    const modal = document.getElementById("product-details-modal");
    const title = modal.querySelector(".project-details-title");
    const section = modal.querySelector(".project-details-section");
    const description = modal.querySelector(".project-details-description");
    const price = modal.querySelector(".project-details-price");
    const mainImage = modal.querySelector(".project-details-main-image img");

    // Set the product ID in the modal's dataset
    modal.dataset.productId = product.id;
    console.log("Setting product ID in details modal:", product.id); // Debug log

    title.textContent = product.title;
    section.textContent = product.section;
    description.textContent = product.description;
    price.textContent = product.price
      ? `$${product.price}`
      : "Price on request";

    if (product.image) {
      const { data } = supabaseClient.storage
        .from("project-images")
        .getPublicUrl(product.image);
      mainImage.src = data.publicUrl;
      mainImage.style.display = "block";
    } else {
      mainImage.src = "";
      mainImage.style.display = "none";
    }

    modal.style.display = "block";

    // Add click handler for edit button
    const editButton = modal.querySelector(".project-edit-button");
    editButton.onclick = async () => {
      // Hide details modal
      modal.style.display = "none";

      // Show edit modal
      const editModal = document.getElementById("edit-product-modal");
      editModal.style.display = "block";

      // Set product ID in edit form
      const editForm = document.getElementById("edit-product-form");
      editForm.dataset.productId = product.id;

      // Populate form fields
      document.getElementById("edit-product-title").value = product.title;
      document.getElementById("edit-product-description").value =
        product.description;
      document.getElementById("edit-product-price").value = product.price || "";

      // Fetch and populate sections dropdown
      try {
        const { data: products, error } = await supabaseClient
          .from("products")
          .select("section")
          .not("section", "is", null);

        if (error) throw error;

        // Get unique sections
        const sections = [
          ...new Set(products.map((p) => p.section).filter(Boolean)),
        ];

        // Populate section dropdown
        const sectionSelect = document.getElementById("edit-product-section");
        sectionSelect.innerHTML =
          '<option value="">Select an existing section</option>';
        sections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          sectionSelect.appendChild(option);
        });

        // Set current section after populating options
        sectionSelect.value = product.section || "";
      } catch (error) {
        console.error("Error fetching sections:", error);
      }

      // Show current image
      if (product.image) {
        const { data } = supabaseClient.storage
          .from("project-images")
          .getPublicUrl(product.image);
        const preview = document.getElementById("edit-product-image-preview");
        preview.src = data.publicUrl;
        preview.style.display = "block";
      }
    };
  }

  // Close product details modal
  document
    .getElementById("product-details-close")
    .addEventListener("click", () => {
      document.getElementById("product-details-modal").style.display = "none";
    });

  // Close product details modal when clicking outside
  window.addEventListener("click", (e) => {
    const productModal = document.getElementById("product-details-modal");
    if (e.target === productModal) {
      productModal.style.display = "none";
    }
  });

  fetchAndDisplayProjects();
  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init();
  }

  // Handle edit project form submission
  document
    .getElementById("edit-project-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="submit-spinner"></div>';

      try {
        const projectId = this.dataset.projectId;
        const sectionSelect = document.getElementById("edit-project-section");
        const newSectionInput = document.getElementById(
          "edit-new-project-section"
        );

        // Prioritize new section if it has a value, otherwise use current section
        let section = newSectionInput.value.trim() || sectionSelect.value;

        if (!section) {
          throw new Error("Please select or create a section");
        }

        // Get current gallery images that are not marked for deletion
        const currentGalleryGrid = document.getElementById(
          "edit-current-gallery"
        );
        const currentGalleryImages = Array.from(
          currentGalleryGrid.querySelectorAll(
            ".edit-gallery-item:not(.marked-for-deletion)"
          )
        ).map((item) => item.dataset.imagePath);

        // Get new gallery images
        const galleryInputs = document.querySelectorAll(
          "#edit-gallery-inputs input[type='file']"
        );
        const newGalleryFiles = Array.from(galleryInputs).filter(
          (input) => input.files.length > 0
        );

        // Update project section in database
        const { error: updateError } = await supabaseClient
          .from("projects")
          .update({ section: section })
          .eq("id", projectId);

        if (updateError) throw updateError;

        // Handle new gallery images
        if (newGalleryFiles.length > 0) {
          for (const input of newGalleryFiles) {
            const file = input.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${projectId}/${fileName}`;

            // Upload image to storage
            const { error: uploadError } = await supabaseClient.storage
              .from("project-images")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Add image to gallery table
            const { error: galleryError } = await supabaseClient
              .from("gallery")
              .insert([
                {
                  project_id: projectId,
                  img: filePath,
                },
              ]);

            if (galleryError) throw galleryError;
          }
        }

        // Delete marked gallery images
        const markedForDeletion = document.querySelectorAll(
          ".edit-gallery-item.marked-for-deletion"
        );
        for (const item of markedForDeletion) {
          const imagePath = item.dataset.imagePath;
          if (imagePath) {
            // Delete from storage
            const { error: deleteError } = await supabaseClient.storage
              .from("project-images")
              .remove([imagePath]);

            if (deleteError) throw deleteError;

            // Delete from gallery table
            const { error: galleryError } = await supabaseClient
              .from("gallery")
              .delete()
              .eq("project_id", projectId)
              .eq("img", imagePath);

            if (galleryError) throw galleryError;
          }
        }

        // Show success message
        const successMessage = document.getElementById("edit-project-success");
        if (successMessage) {
          successMessage.textContent = "Project updated successfully!";
          successMessage.style.display = "block";
        }

        // Close modals after a short delay
        setTimeout(() => {
          document.getElementById("edit-project-modal").style.display = "none";
          document.getElementById("project-details-modal").style.display =
            "none";

          // Reset form
          this.reset();

          // Reset submit button
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Update Project";

          // Refresh projects list
          fetchAndDisplayProjects();
        }, 1500);
      } catch (error) {
        console.error("Error updating project:", error);
        const errorMessage = document.querySelector(
          "#edit-project-form .dashboard-error"
        );
        if (errorMessage) {
          errorMessage.textContent = `Error updating project: ${error.message}`;
          errorMessage.style.display = "block";
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Update Project";
      }
    });

  // Add event listener for remove gallery image buttons
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-gallery-image")) {
      const galleryItem = e.target.closest(".edit-gallery-item");
      if (galleryItem) {
        galleryItem.classList.add("marked-for-deletion");
        e.target.classList.add("undo-delete");
        e.target.textContent = "↩";

        // Change click handler to undo deletion
        e.target.onclick = function () {
          galleryItem.classList.remove("marked-for-deletion");
          e.target.classList.remove("undo-delete");
          e.target.textContent = "×";
          e.target.onclick = null; // Remove the undo handler
        };
      }
    }
  });

  // Helper function to reset submit button
  function resetSubmitButton(button) {
    button.disabled = false;
    button.innerHTML = "Update Project";
  }

  // Add event listener for edit product modal close
  document
    .getElementById("edit-product-modal-close")
    .addEventListener("click", () => {
      const modal = document.getElementById("edit-product-modal");
      const form = document.getElementById("edit-product-form");
      const successMessage = document.getElementById("edit-product-success");
      const errorMessage = document.getElementById("edit-product-image-error");
      const submitButton = form.querySelector(".dashboard-submit");

      // Reset form
      form.reset();
      document.getElementById("edit-product-image-preview").src = "";
      document.getElementById("edit-product-image-preview").style.display =
        "none";

      // Clear messages
      successMessage.style.display = "none";
      errorMessage.style.display = "none";

      // Reset submit button
      resetSubmitButton(submitButton);

      // Hide modal
      modal.style.display = "none";
    });

  // Handle image preview in edit form
  document
    .getElementById("edit-product-image")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      const fileNameSpan = this.parentElement.querySelector(".file-name");

      if (file) {
        fileNameSpan.textContent = file.name;
      } else {
        fileNameSpan.textContent = "";
      }
    });

  // Fetch and display all projects in the dashboard
  async function fetchAndDisplayProjects() {
    try {
      const { data: projects, error } = await supabaseClient
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return;
      }

      const projectsGrid = document.getElementById("projects-grid");
      if (!projectsGrid) return;
      projectsGrid.innerHTML = "";

      if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = '<p class="no-projects">No projects found</p>';
        return;
      }

      for (const project of projects) {
        // Get first gallery image for this project
        const { data: galleryImages } = await supabaseClient
          .from("gallery")
          .select("img")
          .eq("project_id", project.id)
          .limit(1);

        let imageUrl = "";
        if (galleryImages && galleryImages.length > 0) {
          const { data: imageData } = supabaseClient.storage
            .from("project-images")
            .getPublicUrl(galleryImages[0].img);
          imageUrl = imageData.publicUrl;
        }

        const projectCard = document.createElement("div");
        projectCard.className = "project-card";
        projectCard.innerHTML = `
          <div class="project-card-image">
            <img src="${imageUrl}" alt="${project.section}" />
          </div>
          <div class="project-card-content">
            <h3 class="project-card-title">${project.section}</h3>
          </div>
        `;

        projectCard.addEventListener("click", () =>
          showProjectDetails(project)
        );
        projectsGrid.appendChild(projectCard);
      }
    } catch (error) {
      console.error("Error in fetchAndDisplayProjects:", error);
    }
  }

  // Handle edit product form submission
  document
    .getElementById("edit-product-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="submit-spinner"></div>';

      try {
        const productId = this.dataset.productId;
        const title = document
          .getElementById("edit-product-title")
          .value.trim();
        const description = document
          .getElementById("edit-product-description")
          .value.trim();
        const price = document.getElementById("edit-product-price").value;
        const sectionSelect = document.getElementById("edit-product-section");
        const newSectionInput = document.getElementById(
          "edit-new-product-section"
        );

        // Prioritize new section if it has a value, otherwise use current section
        let section = newSectionInput.value.trim() || sectionSelect.value;

        if (!title) {
          throw new Error("Title is required");
        }

        if (!description) {
          throw new Error("Description is required");
        }

        if (!section) {
          throw new Error("Please select or create a section");
        }

        // Update product in database
        const updateData = {
          title: title,
          description: description,
          section: section,
          price: price ? parseFloat(price) : null,
        };

        // Handle image upload if a new image is selected
        const imageInput = document.getElementById("edit-product-image");
        if (imageInput.files.length > 0) {
          const file = imageInput.files[0];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${productId}/${fileName}`;

          // Upload new image
          const { error: uploadError } = await supabaseClient.storage
            .from("project-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Add new image path to update data
          updateData.image = filePath;
        }

        // Update product in database
        const { error: updateError } = await supabaseClient
          .from("products")
          .update(updateData)
          .eq("id", productId);

        if (updateError) throw updateError;

        // Show success message
        const successMessage = document.getElementById("edit-product-success");
        if (successMessage) {
          successMessage.textContent = "Product updated successfully!";
          successMessage.style.display = "block";
        }

        // Close modals after a short delay
        setTimeout(() => {
          document.getElementById("edit-product-modal").style.display = "none";
          document.getElementById("product-details-modal").style.display =
            "none";

          // Reset form
          this.reset();

          // Reset submit button
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Update Product";

          // Refresh products list
          fetchAndDisplayProducts();
        }, 1500);
      } catch (error) {
        console.error("Error updating product:", error);
        const errorMessage = document.querySelector(
          "#edit-product-form .dashboard-error"
        );
        if (errorMessage) {
          errorMessage.textContent = `Error updating product: ${error.message}`;
          errorMessage.style.display = "block";
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Update Product";
      }
    });

  // Close project details modal
  document
    .getElementById("project-details-close")
    .addEventListener("click", () => {
      document.getElementById("project-details-modal").style.display = "none";
    });

  // Close project details modal when clicking outside
  window.addEventListener("click", (e) => {
    const projectModal = document.getElementById("project-details-modal");
    if (e.target === projectModal) {
      projectModal.style.display = "none";
    }
  });

  // Close edit project modal
  document
    .getElementById("edit-project-modal-close")
    .addEventListener("click", () => {
      document.getElementById("edit-project-modal").style.display = "none";
    });

  // Close edit project modal when clicking outside
  window.addEventListener("click", (e) => {
    const editModal = document.getElementById("edit-project-modal");
    if (e.target === editModal) {
      editModal.style.display = "none";
    }
  });
});
