// Initialize Supabase client
const supabaseUrl = "https://iupipboqnmtzulhvabil.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cGlwYm9xbm10enVsaHZhYmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTI2NDIsImV4cCI6MjA1OTg4ODY0Mn0.nchOl1HSDYHBg_Crzam-DY1ZWop8QC5SNgvuUeADxM4"; // Replace with your actual Supabase key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async function () {
  const portfolioSection = document.querySelector(".portfolio_section");

  // Fetch projects and galleries
  async function fetchProjects() {
    try {
      const { data: projects, error: projectsError } = await supabaseClient
        .from("projects")
        .select("*, gallery(*)");

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        return [];
      }

      return projects;
    } catch (error) {
      console.error("Unexpected error fetching projects:", error);
      return [];
    }
  }

  // Render portfolio layout
  function renderPortfolio(projects) {
    const sections = [
      "All",
      ...new Set(projects.map((p) => p.section || "Others")),
    ];
    // Create section buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "portfolio-buttons";
    sections.forEach((section) => {
      const button = document.createElement("button");
      button.className = "portfolio-button";
      button.textContent = section === null ? "Others" : section;
      button.dataset.section = section;
      if (section === "All") button.classList.add("active");
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".portfolio-button")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        filterProjects(section, projects);
      });
      buttonsContainer.appendChild(button);
    });
    portfolioSection.appendChild(buttonsContainer);

    // Create subsection buttons container
    const subsectionButtonsContainer = document.createElement("div");
    subsectionButtonsContainer.className = "subsection-buttons hide";
    //subsectionButtonsContainer.style.display = "none";
    portfolioSection.appendChild(subsectionButtonsContainer);

    // Create projects container
    const projectsContainer = document.createElement("div");
    projectsContainer.className = "portfolio-projects";
    portfolioSection.appendChild(projectsContainer);

    // Show all projects by default
    filterProjects("All", projects);
  }

  // Filter and display projects
  function filterProjects(section, projects) {
    const projectsContainer = document.querySelector(".portfolio-projects");
    const subsectionButtonsContainer = document.querySelector(
      ".subsection-buttons"
    );
    projectsContainer.innerHTML = "";
    subsectionButtonsContainer.innerHTML = "";
    subsectionButtonsContainer.className = "subsection-buttons hide";

    let filteredProjects;
    if (section === "All") {
      filteredProjects = projects;
    } else {
      filteredProjects = projects.filter(
        (project) =>
          project.section === section ||
          (section === "Others" && !project.section)
      );

      // Check if this section has any subsections
      const subsectionsWithValues = filteredProjects
        .filter((project) => project.subsection)
        .map((project) => project.subsection);

      // Check if there are projects without subsections
      const hasProjectsWithoutSubsection = filteredProjects.some(
        (project) => !project.subsection
      );

      // Create the subsections array
      const subsections = ["All", ...new Set(subsectionsWithValues)];

      // Add "Others" option if needed
      if (hasProjectsWithoutSubsection && subsectionsWithValues.length > 0) {
        subsections.push("Others");
      }

      if (subsections.length > 1) {
        // More than just "All"
        subsectionButtonsContainer.className = "subsection-buttons show";

        // Create subsection buttons
        subsections.forEach((subsection) => {
          const subButton = document.createElement("button");
          subButton.className = "subsection-button";
          subButton.textContent = subsection;
          subButton.dataset.subsection = subsection;
          if (subsection === "All") subButton.classList.add("active");

          subButton.addEventListener("click", () => {
            document
              .querySelectorAll(".subsection-button")
              .forEach((btn) => btn.classList.remove("active"));
            subButton.classList.add("active");

            // Filter projects by subsection
            renderProjectsBySubsection(section, subsection, projects);
          });

          subsectionButtonsContainer.appendChild(subButton);
        });
      }
    }

    // Display projects
    renderProjects(filteredProjects);
  }

  // Render projects by subsection
  function renderProjectsBySubsection(section, subsection, projects) {
    const projectsContainer = document.querySelector(".portfolio-projects");
    projectsContainer.innerHTML = "";

    let filteredProjects;
    if (section === "Others") {
      filteredProjects = projects.filter((project) => !project.section);
    } else {
      filteredProjects = projects.filter(
        (project) => project.section === section
      );
    }

    if (subsection === "All") {
      // Show all projects for this section - no additional filtering
    } else if (subsection === "Others") {
      // Show only projects without a subsection
      filteredProjects = filteredProjects.filter(
        (project) => !project.subsection
      );
    } else {
      // Show projects with the specific subsection
      filteredProjects = filteredProjects.filter(
        (project) => project.subsection === subsection
      );
    }

    renderProjects(filteredProjects);
  }

  // Helper function to render projects
  function renderProjects(projects) {
    const projectsContainer = document.querySelector(".portfolio-projects");

    projects.forEach((project) => {
      const projectCard = document.createElement("div");
      projectCard.className = "portfolio-project-card";
      const mainImageUrl = supabaseClient.storage
        .from("project-images")
        .getPublicUrl(project.image).data.publicUrl;
      projectCard.innerHTML = `
      <img src="${mainImageUrl}" alt="${project.title}" class="portfolio-project-image" />
      <h3 class="portfolio-project-title">${project.title}</h3>
    `;
      projectCard.addEventListener("click", () => showProjectModal(project));
      projectsContainer.appendChild(projectCard);
    });
  }

  // Show project modal
  function showProjectModal(project) {
    // Get the public URL for the main image
    const mainImageUrl = supabaseClient.storage
      .from("project-images")
      .getPublicUrl(project.image).data.publicUrl;

    const modal = document.createElement("div");
    modal.className = "portfolio-modal";
    modal.innerHTML = `
      <div class="portfolio-modal-content">
        <span class="portfolio-modal-close">&times;</span>
        <h2 class='portfolio-modal-title'>${project.title}</h2>
        <p>${project.description}</p>
        <img src="${mainImageUrl}" alt="${
      project.title
    }" class="portfolio-modal-main-image" />
        ${
          project.gallery && project.gallery.length > 0
            ? "<h3>Gallery</h3>"
            : ""
        }
        <div class="portfolio-modal-gallery">
          ${project.gallery
            .map((img) => {
              // Get public URL for each gallery image
              const galleryImageUrl = supabaseClient.storage
                .from("project-images")
                .getPublicUrl(img.img).data.publicUrl;
              return `
                  <img src="${galleryImageUrl}" alt="Gallery Image" class="portfolio-modal-gallery-image" />
                `;
            })
            .join("")}
        </div>
      </div>
    `;

    // Add click event to all gallery images
    modal.querySelectorAll(".portfolio-modal-gallery-image").forEach((img) => {
      img.addEventListener("click", function () {
        showGalleryImageModal(this.src);
      });
    });

    modal
      .querySelector(".portfolio-modal-close")
      .addEventListener("click", () => {
        modal.remove();
      });

    document.body.appendChild(modal);
  }

  // Function to show a full-size gallery image modal
  function showGalleryImageModal(imageSrc) {
    const galleryModal = document.createElement("div");
    galleryModal.className = "portfolio-gallery-modal";
    // Get all gallery images to enable navigation
    const allGalleryImages = Array.from(
      document.querySelectorAll(".portfolio-modal-gallery-image")
    ).map((img) => img.src);
    const currentIndex = allGalleryImages.indexOf(imageSrc);
    galleryModal.innerHTML = `
    <div class="portfolio-gallery-modal-content">
      <span class="portfolio-gallery-modal-close">&times;</span>
      <div class="portfolio-gallery-navigation">
        <button class="gallery-nav-btn prev-btn" ${
          currentIndex === 0 ? "disabled" : ""
        }><i class="fas fa-chevron-left"></i></button>
        <img src="${imageSrc}" alt="Full size gallery image" class="portfolio-gallery-modal-image" />
        <button class="gallery-nav-btn next-btn" ${
          currentIndex === allGalleryImages.length - 1 ? "disabled" : ""
        }><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="gallery-counter">${currentIndex + 1} / ${
      allGalleryImages.length
    }</div>
    </div>
  `;

    galleryModal
      .querySelector(".portfolio-gallery-modal-close")
      .addEventListener("click", () => {
        galleryModal.remove();
      });

    // Handle previous button click
    const prevBtn = galleryModal.querySelector(".prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          galleryModal.remove();
          showGalleryImageModal(allGalleryImages[currentIndex - 1]);
        }
      });
    }

    // Handle next button click
    const nextBtn = galleryModal.querySelector(".next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < allGalleryImages.length - 1) {
          galleryModal.remove();
          showGalleryImageModal(allGalleryImages[currentIndex + 1]);
        }
      });
    }

    // Also close modal when clicking outside the image
    galleryModal.addEventListener("click", (e) => {
      if (e.target === galleryModal) {
        galleryModal.remove();
      }
    });

    document.body.appendChild(galleryModal);
  }
  // Fetch and render projects
  const projects = await fetchProjects();
  renderPortfolio(projects);
});
