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

  if (addProjectButton && projectModal && closeProjectModal) {
    // Open modal
    addProjectButton.addEventListener("click", () => {
      projectModal.style.display = "block";
    });

    // Add this function to fetch sections
    async function fetchProjectSections() {
      try {
        const { data: sections, error } = await supabaseClient
          .from("projects")
          .select("section")
          .not("section", "is", null);

        if (error) throw error;

        // Get unique sections
        const uniqueSections = [
          ...new Set(sections.map((item) => item.section).filter(Boolean)),
        ];

        // Populate the dropdown
        const sectionDropdown = document.getElementById("project-section");
        // Clear previous options except the first one
        sectionDropdown.innerHTML =
          '<option value="">Select an existing section</option>';

        // Add options for each section
        uniqueSections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          sectionDropdown.appendChild(option);
        });
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    }

    // Modify your modal open event listener
    addProjectButton.addEventListener("click", () => {
      projectModal.style.display = "block";
      fetchProjectSections(); // Fetch sections when opening the modal
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
      // Add these lines to reset section fields
      document.getElementById("project-section").value = "";
      document.getElementById("new-project-section").value = "";
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

      // Section validation
      const sectionDropdown = document.getElementById("project-section");
      const newSection = document
        .getElementById("new-project-section")
        .value.trim();

      if (sectionDropdown.value && newSection) {
        document.getElementById("project-section-error").textContent =
          "Please choose either an existing section or create a new one, not both";
        document.getElementById("project-section-error").style.display =
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
        // Add this code here - determine which section to use
        const sectionToUse =
          document.getElementById("project-section").value ||
          document.getElementById("new-project-section").value.trim() ||
          null;
        // Insert project into database
        const { data: projectData, error: projectError } = await supabaseClient
          .from("projects")
          .insert([
            {
              title,
              description,
              image: mainImagePath,
              section: sectionToUse, // Add this line to include the section
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

        document.getElementById("project-section").value = "";
        document.getElementById("new-project-section").value = "";

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
      const sectionElement = projectDetailsModal.querySelector(
        ".project-details-section"
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

      // Add this code to display the section
      if (project.section) {
        sectionElement.textContent = `in ${project.section}`;
        sectionElement.style.display = "block";
      } else {
        sectionElement.style.display = "none";
      }

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
  const deleteConfirmationModal = document.getElementById(
    "delete-confirmation-modal"
  );
  const deleteProjectBtn = projectDetailsModal.querySelector(
    ".delete-project-btn"
  );
  const cancelDeleteBtn =
    deleteConfirmationModal.querySelector(".cancel-delete-btn");
  const confirmDeleteBtn = deleteConfirmationModal.querySelector(
    ".confirm-delete-btn"
  );

  // Show confirmation modal when delete button is clicked
  if (deleteProjectBtn) {
    deleteProjectBtn.addEventListener("click", () => {
      console.log("Delete button clicked");
      deleteConfirmationModal.style.display = "block";
    });
  }

  // Cancel deletion
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteConfirmationModal.style.display = "none";
    });
  }

  // Confirm deletion
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const projectId = projectDetailsModal.dataset.projectId;
      if (projectId) {
        await deleteProject(projectId);
      }
    });
  }

  // Close confirmation modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === deleteConfirmationModal) {
      deleteConfirmationModal.style.display = "none";
    }
  });

  // Handle project deletion
  async function deleteProject(projectId) {
    const confirmDeleteBtn = document.querySelector(".confirm-delete-btn");
    const originalBtnText = confirmDeleteBtn.innerHTML;

    try {
      console.log("Starting deletion process for project:", projectId);

      // Show spinner on delete button
      confirmDeleteBtn.innerHTML = '<span class="delete-spinner"></span>';
      confirmDeleteBtn.disabled = true;

      // First, get the project to get the main image path
      const { data: project, error: projectFetchError } = await supabaseClient
        .from("projects")
        .select("image")
        .eq("id", projectId)
        .single();

      if (projectFetchError) {
        console.error("Error fetching project:", projectFetchError);
        throw new Error(
          `Failed to fetch project: ${projectFetchError.message}`
        );
      }

      // Get all gallery images for this project
      const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("gallery")
        .select("img")
        .eq("project_id", projectId);

      if (galleryError) {
        console.error("Error fetching gallery images:", galleryError);
        throw new Error(
          `Failed to fetch gallery images: ${galleryError.message}`
        );
      }

      console.log("Found gallery images:", galleryImages);

      // Delete main project image from storage
      if (project.image) {
        console.log("Deleting main project image from storage:", project.image);
        const { error: mainImageDeleteError } = await supabaseClient.storage
          .from("project-images")
          .remove([project.image]);

        if (mainImageDeleteError) {
          console.error("Error deleting main image:", mainImageDeleteError);
          throw new Error(
            `Failed to delete main image: ${mainImageDeleteError.message}`
          );
        }
      }

      // Delete all gallery images from storage
      if (galleryImages && galleryImages.length > 0) {
        console.log("Deleting gallery images from storage...");
        const deletePromises = galleryImages.map((image) => {
          console.log("Deleting image:", image.img);
          return supabaseClient.storage
            .from("project-images")
            .remove([image.img]);
        });

        const results = await Promise.all(deletePromises);
        console.log("Storage deletion results:", results);
      }

      // Delete gallery entries from database
      console.log("Deleting gallery entries from database...");
      const { error: galleryDeleteError } = await supabaseClient
        .from("gallery")
        .delete()
        .eq("project_id", projectId);

      if (galleryDeleteError) {
        console.error("Error deleting gallery entries:", galleryDeleteError);
        throw new Error(
          `Failed to delete gallery entries: ${galleryDeleteError.message}`
        );
      }

      // Delete the project from the database
      console.log("Deleting project from database...");
      const { error: projectError } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectError) {
        console.error("Error deleting project:", projectError);
        throw new Error(`Failed to delete project: ${projectError.message}`);
      }

      console.log("Project deleted successfully");

      // Close both modals
      projectDetailsModal.style.display = "none";
      deleteConfirmationModal.style.display = "none";

      // Refresh the projects list
      await fetchAndDisplayProjects();
    } catch (error) {
      console.error("Detailed error in deleteProject:", error);
      alert(`Error deleting project: ${error.message}`);
    } finally {
      // Restore button state
      confirmDeleteBtn.innerHTML = originalBtnText;
      confirmDeleteBtn.disabled = false;
    }
  }

  fetchAndDisplayProjects();
  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init();
  }
});
