/**
 * ============================================================
 *  modules/sidebar.js — Sidebar Toggle (Mobile)
 * ============================================================
 *  Attaches a click listener to the sidebar expand button
 *  so users can show/hide the full sidebar panel on mobile.
 *  Uses elementToggleFunc() from globals.js.
 *
 *  Depends on: globals.js (elementToggleFunc)
 * ============================================================
 */

// ---- 3. Sidebar toggle functionality for mobile ----
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { 
      elementToggleFunc(sidebar); 
    });
  }