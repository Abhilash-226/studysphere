// Clear all browser storage and force logout
const clearAllData = () => {
  console.log("🧹 Clearing all browser data...");

  // Clear localStorage
  localStorage.clear();
  console.log("✅ localStorage cleared");

  // Clear sessionStorage
  sessionStorage.clear();
  console.log("✅ sessionStorage cleared");

  // Clear cookies (if any)
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  console.log("✅ Cookies cleared");

  console.log("🎉 All browser data cleared! Please refresh the page.");

  // Redirect to home page
  window.location.href = "/";
};

// Run the cleanup
clearAllData();
