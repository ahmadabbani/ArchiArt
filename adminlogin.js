// Initialize Supabase client
console.log("Admin login script loaded");
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
  console.log("Admin login page DOM loaded");

  // Check if user is already logged in
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      window.location.href = "/dashboard.html";
    }
  });

  // Get the login form
  const loginForm = document.getElementById("adminlogin-form");

  if (loginForm) {
    const emailError = document.getElementById("adminlogin-email-error");
    const passwordError = document.getElementById("adminlogin-password-error");
    const loginButton = document.querySelector(".adminlogin-button");

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      loginButton.innerHTML = '<span class="login-spinner"></span>';
      loginButton.disabled = true;

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      // Reset error messages
      emailError.style.display = "none";
      passwordError.style.display = "none";

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
      }

      if (!isValid) {
        loginButton.innerHTML = "Sign In";
        loginButton.disabled = false;
        return false;
      }

      try {
        // If validation passes, proceed with Supabase login
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.log("Login error:", error.message);
          loginButton.innerHTML = "Sign In";
          loginButton.disabled = false;
          // Handle specific error codes from Supabase
          if (error.message.includes("Invalid login credentials")) {
            // Show a more accurate message that doesn't mislead
            passwordError.textContent = "Invalid email or password";
            passwordError.style.display = "block";
          } else {
            // Other errors (rate limiting, etc.)
            emailError.textContent = error.message;
            emailError.style.display = "block";
          }
        } else {
          // Login successful
          window.location.href = "/dashboard.html";
        }
      } catch (err) {
        console.error("Login error:", err);
        emailError.textContent = "An unexpected error occurred";
        emailError.style.display = "block";
        loginButton.innerHTML = "Sign In";
        loginButton.disabled = false;
      }

      return false;
    });
  } else {
    console.warn("Login form not found in the DOM");
  }

  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init();
  }
});
