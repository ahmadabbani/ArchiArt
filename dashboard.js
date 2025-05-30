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

        // If products view is currently visible, refresh the products list
        if (productsDisplay.style.display !== "none") {
          await fetchAndDisplayProducts();
        }
      } catch (error) {
        console.error("Error creating product:", error);
        document.getElementById("product-image-error").textContent =
          error.message || "An error occurred while creating the product";
        document.getElementById("product-image-error").style.display = "block";
      } finally {
        submitButton.innerHTML = "Create Product";
        submitButton.disabled = false;
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
  const mainImagePreview = document.getElementById("main-image-preview");
  const mainFileNameSpan =
    mainImageInput.previousElementSibling.querySelector(".file-name");
  handleFileInput(mainImageInput, mainImagePreview, mainFileNameSpan);

  // Handle gallery file inputs
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-gallery-btn")) {
      e.target.parentElement.remove();
    }
  });

  // Handle existing and new gallery inputs
  function initializeGalleryInputs() {
    document
      .querySelectorAll(".gallery-image-input")
      .forEach((input, index) => {
        const preview = input.nextElementSibling;
        const fileNameSpan =
          input.previousElementSibling.querySelector(".file-name");
        handleFileInput(input, preview, fileNameSpan);
      });
  }

  // Initialize existing gallery inputs
  initializeGalleryInputs();

  // Handle project form submission
  if (projectForm) {
    projectForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("project-title").value.trim();
      const description = document
        .getElementById("project-description")
        .value.trim();
      const mainImage = document.getElementById("project-main-image").files[0];
      const galleryImages = Array.from(
        document.querySelectorAll(".gallery-image-input")
      )
        .map((input) => input.files[0])
        .filter(Boolean);

      // Get button element
      const submitButton = projectForm.querySelector(".dashboard-submit");

      // Show loading spinner on submit
      submitButton.innerHTML = '<span class="submit-spinner"></span>';
      submitButton.disabled = true;

      // Reset messages
      document
        .querySelectorAll(".dashboard-error")
        .forEach((el) => (el.style.display = "none"));
      document.getElementById("project-success").style.display = "none";

      // Client-side validation
      let isValid = true;

      if (!title) {
        document.getElementById("project-title-error").textContent =
          "Title is required";
        document.getElementById("project-title-error").style.display = "block";
        isValid = false;
      }

      if (!description) {
        document.getElementById("project-description-error").textContent =
          "Description is required";
        document.getElementById("project-description-error").style.display =
          "block";
        isValid = false;
      }

      if (!mainImage) {
        document.getElementById("project-main-image-error").textContent =
          "Main image is required";
        document.getElementById("project-main-image-error").style.display =
          "block";
        isValid = false;
      }

      if (!isValid) {
        submitButton.innerHTML = "Create Project";
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
          throw new Error("You must be logged in to create a project");
        }

        // Upload main image to Supabase storage
        const mainImagePath = `project-images/${Date.now()}-${mainImage.name}`;
        const { data: mainImageData, error: mainImageError } =
          await supabaseClient.storage
            .from("project-images")
            .upload(mainImagePath, mainImage, {
              cacheControl: "3600",
              upsert: false,
            });

        if (mainImageError) {
          console.error("Main image upload error:", mainImageError);
          throw new Error(
            `Main image upload failed: ${mainImageError.message}`
          );
        }

        // Insert project into database
        const { data: projectData, error: projectError } = await supabaseClient
          .from("projects")
          .insert([
            {
              title,
              description,
              image: mainImagePath,
              section: document.getElementById("project-section").value,
              subsection: document.getElementById("project-subsection").value,
            },
          ])
          .select()
          .single();

        if (projectError) {
          console.error("Project insert error:", projectError);
          throw new Error(`Project creation failed: ${projectError.message}`);
        }

        // If there are gallery images, upload them and insert into gallery table
        if (galleryImages.length > 0) {
          const galleryPromises = galleryImages.map(async (image) => {
            const galleryImagePath = `project-images/${Date.now()}-${
              image.name
            }`;
            const { error: uploadError } = await supabaseClient.storage
              .from("project-images")
              .upload(galleryImagePath, image, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              console.error("Gallery image upload error:", uploadError);
              throw new Error(
                `Gallery image upload failed: ${uploadError.message}`
              );
            }

            return {
              project_id: projectData.id,
              img: galleryImagePath,
            };
          });

          const galleryItems = await Promise.all(galleryPromises);

          const { error: galleryError } = await supabaseClient
            .from("gallery")
            .insert(galleryItems);

          if (galleryError) {
            console.error("Gallery insert error:", galleryError);
            throw new Error(`Gallery creation failed: ${galleryError.message}`);
          }
        }

        // Show success message
        document.getElementById("project-success").textContent =
          "Project created successfully!";
        document.getElementById("project-success").style.display = "block";
        projectForm.reset();
        // Reset gallery inputs to just one
        galleryInputsContainer.innerHTML = `
          <div class="gallery-input-container">
            <input type="file" class="gallery-image-input" accept="image/*" />
            <button type="button" class="remove-gallery-btn">&times;</button>
          </div>
        `;
        await fetchAndDisplayProjects(); // Refresh the projects list
      } catch (error) {
        console.error("Error creating project:", error);
        document.getElementById("project-main-image-error").textContent =
          error.message || "An error occurred while creating the project";
        document.getElementById("project-main-image-error").style.display =
          "block";
      } finally {
        submitButton.innerHTML = "Create Project";
        submitButton.disabled = false;
      }
    });
  }

  // Fetch and display projects
  async function fetchAndDisplayProjects() {
    try {
      console.log("Starting to fetch projects...");

      // First, fetch all projects
      const { data: projects, error: projectsError } = await supabaseClient
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }

      console.log("Projects fetched:", projects);

      const projectsGrid = document.getElementById("projects-grid");
      if (!projectsGrid) {
        console.error("Projects grid element not found");
        return;
      }

      projectsGrid.innerHTML = "";

      if (!projects || projects.length === 0) {
        console.log("No projects found");
        projectsGrid.innerHTML =
          '<p class="no-projects">No projects available</p>';
        return;
      }

      // For each project, fetch its gallery images
      for (const project of projects) {
        console.log("Processing project:", project);

        // Get the main image URL
        const mainImageUrl = supabaseClient.storage
          .from("project-images")
          .getPublicUrl(project.image).data.publicUrl;

        console.log("Main image URL:", mainImageUrl);

        // Create project card
        const projectCard = document.createElement("div");
        projectCard.className = "project-card";
        projectCard.dataset.projectId = project.id;

        projectCard.innerHTML = `
          <img src="${mainImageUrl}" alt="${project.title}" class="project-card-image" />
          <div class="project-card-content">
            <h3 class="project-card-title">${project.title}</h3>
            <p class="project-card-description">${project.description}</p>
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

  // Show project details modal
  async function showProjectDetails(project) {
    try {
      console.log("Showing details for project:", project);

      // Store the current project ID for deletion
      const projectDetailsModal = document.getElementById(
        "project-details-modal"
      );
      projectDetailsModal.dataset.projectId = project.id;

      // Fetch gallery images for this project
      const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("gallery")
        .select("img")
        .eq("project_id", project.id);

      if (galleryError) {
        console.error("Error fetching gallery images:", galleryError);
        throw galleryError;
      }

      const title = projectDetailsModal.querySelector(".project-details-title");
      const description = projectDetailsModal.querySelector(
        ".project-details-description"
      );
      const mainImage = projectDetailsModal.querySelector(
        ".project-details-main-image img"
      );
      const galleryGrid = projectDetailsModal.querySelector(
        ".project-gallery-grid"
      );

      // Set project details
      title.textContent = project.title;
      description.textContent = project.description;

      // Set main image
      const mainImageUrl = supabaseClient.storage
        .from("project-images")
        .getPublicUrl(project.image).data.publicUrl;
      mainImage.src = mainImageUrl;

      // Clear and populate gallery
      galleryGrid.innerHTML = "";
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((galleryItem) => {
          const galleryImage = document.createElement("img");
          const imageUrl = supabaseClient.storage
            .from("project-images")
            .getPublicUrl(galleryItem.img).data.publicUrl;

          galleryImage.src = imageUrl;
          galleryImage.className = "project-gallery-image";
          galleryImage.addEventListener("click", () =>
            showImagePreview(imageUrl)
          );
          galleryGrid.appendChild(galleryImage);
        });
      }

      // Show modal
      projectDetailsModal.style.display = "block";
    } catch (error) {
      console.error("Error in showProjectDetails:", error);
    }
  }

  // Show image preview modal
  function showImagePreview(imageUrl) {
    const modal = document.getElementById("image-preview-modal");
    const previewImage = modal.querySelector(".preview-image");

    previewImage.src = imageUrl;
    modal.style.display = "block";
  }

  // Close modals
  document
    .getElementById("project-details-close")
    .addEventListener("click", () => {
      document.getElementById("project-details-modal").style.display = "none";
    });

  document
    .getElementById("image-preview-close")
    .addEventListener("click", () => {
      document.getElementById("image-preview-modal").style.display = "none";
    });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    const projectModal = document.getElementById("project-details-modal");
    const imageModal = document.getElementById("image-preview-modal");

    if (e.target === projectModal) {
      projectModal.style.display = "none";
    }
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });

  // Initialize event listeners for deletion
  const projectDetailsModal = document.getElementById("project-details-modal");
  const productDetailsModal = document.getElementById("product-details-modal");
  const deleteConfirmationModal = document.getElementById(
    "delete-confirmation-modal"
  );
  const deleteProjectBtn = projectDetailsModal.querySelector(
    ".delete-project-btn"
  );
  const deleteProductBtn = productDetailsModal.querySelector(
    ".delete-product-btn"
  );
  const cancelDeleteBtn =
    deleteConfirmationModal.querySelector(".cancel-delete-btn");
  const confirmDeleteBtn = deleteConfirmationModal.querySelector(
    ".confirm-delete-btn"
  );

  // Show confirmation modal when delete button is clicked
  if (deleteProjectBtn) {
    deleteProjectBtn.addEventListener("click", () => {
      console.log("Delete project button clicked");
      deleteConfirmationModal.dataset.deleteType = "project";
      document.getElementById("delete-confirmation-text").textContent =
        "Are you sure you want to delete this project? This action cannot be undone.";
      deleteConfirmationModal.style.display = "block";
    });
  }

  if (deleteProductBtn) {
    deleteProductBtn.addEventListener("click", () => {
      console.log("Delete product button clicked");
      deleteConfirmationModal.dataset.deleteType = "product";
      document.getElementById("delete-confirmation-text").textContent =
        "Are you sure you want to delete this product? This action cannot be undone.";
      deleteConfirmationModal.style.display = "block";
    });
  }

  // Cancel deletion
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteConfirmationModal.style.display = "none";
      deleteConfirmationModal.dataset.deleteType = "";
    });
  }

  // Confirm deletion
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const deleteType = deleteConfirmationModal.dataset.deleteType;
      const projectId = projectDetailsModal.dataset.projectId;
      const productId = productDetailsModal.dataset.productId;

      // Show loading spinner
      confirmDeleteBtn.innerHTML = '<span class="delete-spinner"></span>';
      confirmDeleteBtn.disabled = true;

      try {
        if (deleteType === "project" && projectId) {
          await deleteProject(projectId);
        } else if (deleteType === "product" && productId) {
          await deleteProduct(productId);
        }
      } catch (error) {
        console.error("Error during deletion:", error);
      } finally {
        // Reset button state
        confirmDeleteBtn.innerHTML = "Delete";
        confirmDeleteBtn.disabled = false;
        // Close the confirmation modal
        deleteConfirmationModal.style.display = "none";
        deleteConfirmationModal.dataset.deleteType = "";
      }
    });
  }

  // Delete project function
  async function deleteProject(projectId) {
    try {
      // Get the project to find its image path
      const { data: project, error: fetchError } = await supabaseClient
        .from("projects")
        .select("image")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the main image from storage
      if (project.image) {
        const { error: imageError } = await supabaseClient.storage
          .from("project-images")
          .remove([project.image]);

        if (imageError) throw imageError;
      }

      // Get gallery images
      const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("gallery")
        .select("img")
        .eq("project_id", projectId);

      if (galleryError) throw galleryError;

      // Delete gallery images from storage
      if (galleryImages && galleryImages.length > 0) {
        const imagePaths = galleryImages.map((img) => img.img);
        const { error: galleryImageError } = await supabaseClient.storage
          .from("project-images")
          .remove(imagePaths);

        if (galleryImageError) throw galleryImageError;
      }

      // Delete gallery entries
      const { error: deleteGalleryError } = await supabaseClient
        .from("gallery")
        .delete()
        .eq("project_id", projectId);

      if (deleteGalleryError) throw deleteGalleryError;

      // Delete the project
      const { error: deleteError } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (deleteError) throw deleteError;

      // Close the project details modal
      document.getElementById("project-details-modal").style.display = "none";

      // Refresh the projects list
      await fetchAndDisplayProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  // Delete product function
  async function deleteProduct(productId) {
    try {
      // Get the product to find its image path
      const { data: product, error: fetchError } = await supabaseClient
        .from("products")
        .select("image")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the image from storage
      if (product.image) {
        const { error: imageError } = await supabaseClient.storage
          .from("project-images")
          .remove([product.image]);

        if (imageError) throw imageError;
      }

      // Delete the product
      const { error: deleteError } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);

      if (deleteError) throw deleteError;

      // Close the product details modal
      document.getElementById("product-details-modal").style.display = "none";

      // Refresh the products list
      await fetchAndDisplayProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // Handle toggle between projects and products
  const toggleButtons = document.querySelectorAll(".toggle-view-btn");
  const projectsDisplay = document.querySelector(".projects-display");
  const productsDisplay = document.querySelector(".products-display");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (projectsDisplay.style.display !== "none") {
        // Switch to products view
        projectsDisplay.style.display = "none";
        productsDisplay.style.display = "block";
        fetchAndDisplayProducts();
      } else {
        // Switch to projects view
        productsDisplay.style.display = "none";
        projectsDisplay.style.display = "block";
        fetchAndDisplayProjects();
      }
    });
  });

  // Fetch and display products
  async function fetchAndDisplayProducts() {
    try {
      console.log("Starting to fetch products...");

      const { data: products, error: productsError } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }

      console.log("Products fetched:", products);

      const productsGrid = document.getElementById("products-grid");
      if (!productsGrid) {
        console.error("Products grid element not found");
        return;
      }

      productsGrid.innerHTML = "";

      if (!products || products.length === 0) {
        console.log("No products found");
        productsGrid.innerHTML =
          '<p class="no-projects">No products available</p>';
        return;
      }

      for (const product of products) {
        console.log("Processing product:", product);

        const mainImageUrl = supabaseClient.storage
          .from("project-images")
          .getPublicUrl(product.image).data.publicUrl;

        console.log("Main image URL:", mainImageUrl);

        const productCard = document.createElement("div");
        productCard.className = "project-card";
        productCard.dataset.productId = product.id;

        productCard.innerHTML = `
          <img src="${mainImageUrl}" alt="${
          product.title
        }" class="project-card-image" />
          <div class="project-card-content">
            <h3 class="project-card-title">${product.title}</h3>
            <p class="project-card-description">${product.description}</p>
            ${
              product.price
                ? `<p class="project-card-price">$${product.price}</p>`
                : ""
            }
          </div>
        `;

        productCard.addEventListener("click", () =>
          showProductDetails(product)
        );
        productsGrid.appendChild(productCard);
      }
    } catch (error) {
      console.error("Error in fetchAndDisplayProducts:", error);
    }
  }

  // Show product details modal
  async function showProductDetails(product) {
    try {
      console.log("Showing details for product:", product);

      const productDetailsModal = document.getElementById(
        "product-details-modal"
      );
      productDetailsModal.dataset.productId = product.id;

      const title = productDetailsModal.querySelector(".project-details-title");
      const description = productDetailsModal.querySelector(
        ".project-details-description"
      );
      const price = productDetailsModal.querySelector(".project-details-price");
      const section = productDetailsModal.querySelector(
        ".project-details-section"
      );
      const mainImage = productDetailsModal.querySelector(
        ".project-details-main-image img"
      );

      // Set product details
      title.textContent = product.title;
      description.textContent = product.description;
      price.textContent = product.price ? `$${product.price}` : "";
      section.textContent = product.section || "";

      // Set main image
      const mainImageUrl = supabaseClient.storage
        .from("project-images")
        .getPublicUrl(product.image).data.publicUrl;
      mainImage.src = mainImageUrl;

      // Show modal
      productDetailsModal.style.display = "block";
    } catch (error) {
      console.error("Error in showProductDetails:", error);
    }
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
});
