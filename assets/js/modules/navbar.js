/**
 * ============================================================
 *  modules/navbar.js — Navbar Underline Pill Setup
 * ============================================================
 *  Creates and appends the .navbar-underline <div> element
 *  that slides beneath the active nav link.
 *  The actual position update is handled by updateUnderline()
 *  in globals.js, which reads the underline and navbar refs
 *  set here.
 *
 *  Sets on window:
 *    • navbar     – .navbar DOM element
 *    • underline  – .navbar-underline DOM element
 *
 *  Depends on: globals.js (navbar + underline global vars)
 * ============================================================
 */

// ---- 2. Navbar sliding underline setup ----
  navbar = document.querySelector('.navbar');
  if (navbar) {
    underline = document.createElement('div');
    underline.className = 'navbar-underline';
    navbar.appendChild(underline);
  }