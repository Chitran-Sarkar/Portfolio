
  // ---- 3. Sidebar toggle functionality for mobile ----
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { 
      elementToggleFunc(sidebar); 
    });
  }
