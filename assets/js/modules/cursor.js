
/**
 * ============================================================
 *  modules/cursor.js — Custom Cursor Controller
 * ============================================================
 *  Creates a custom cursor <div> and tracks its position.
 *  The cursor changes state based on what element the user
 *  hovers (pointer, text, grab). Only active on desktop
 *  (cursor is hidden on touch/mobile via CSS).
 *
 *  States managed:
 *    • Default    – Small dot
 *    • .cursor-pointer – Enlarged on buttons/links
 *    • .cursor-text    – I-beam on inputs
 *    • .cursor-grab    – Open hand on draggable elements
 *    • .cursor-blink   – Click pulse flash
 *
 *  Depends on: none
 * ============================================================
 */

  // Sidebar fullscreen intro animation disabled – sidebar remains static.

  // ---- 9. Custom cursor logic ----
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.style.opacity = '0';
  document.body.appendChild(cursor);

  let cursorInitialized = false;

  document.addEventListener('mousemove', (e) => {
    if (!cursorInitialized) {
      cursor.style.opacity = '1';
      cursorInitialized = true;
    }
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorInitialized) {
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mousedown', (e) => {
    cursor.classList.add('cursor-blink');
    setTimeout(() => {
      cursor.classList.remove('cursor-blink');
    }, 200);

    if (e.target.closest('.leaflet-container, .global-physics-canvas canvas') && !e.target.closest('.leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-interactive, .leaflet-control-attribution a')) {
      cursor.classList.add('cursor-grabbing');
      cursor.classList.remove('cursor-grab');
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.target.closest('.leaflet-container, .global-physics-canvas canvas')) {
      if (e.target.closest('.leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-interactive, .leaflet-control-attribution a')) {
        cursor.classList.remove('cursor-grab', 'cursor-grabbing');
        cursor.classList.add('cursor-pointer');
      } else {
        cursor.classList.add('cursor-grab');
        cursor.classList.remove('cursor-grabbing', 'cursor-pointer');
      }
    } else {
      cursor.classList.remove('cursor-grab', 'cursor-grabbing');
    }
  });

  // Use event delegation to handle hover states dynamically and consistently
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    const isPointer = target.closest('a, button, [role="button"], select, option, .project-item, .skills-filter-btn, [data-select], [data-sidebar-btn], .avatar-box, .name, .filter-item, [data-skill-select-item], [data-select-item], canvas.physics-hover, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-interactive, .leaflet-control-attribution a');
    const isText = target.closest('input[type="text"], input[type="email"], input[type="tel"], input[type="search"], textarea');
    const isMap = target.closest('.leaflet-container, .global-physics-canvas canvas');

    if (isPointer) {
      cursor.classList.add('cursor-pointer');
      cursor.classList.remove('cursor-text', 'cursor-grab', 'cursor-grabbing');
    } else if (isText) {
      cursor.classList.add('cursor-text');
      cursor.classList.remove('cursor-pointer', 'cursor-grab', 'cursor-grabbing');
    } else if (isMap) {
      cursor.classList.remove('cursor-pointer', 'cursor-text');
      if (e.buttons === 1) { // Left mouse button is held down
        cursor.classList.add('cursor-grabbing');
        cursor.classList.remove('cursor-grab');
      } else {
        cursor.classList.add('cursor-grab');
        cursor.classList.remove('cursor-grabbing');
      }
    } else {
      cursor.classList.remove('cursor-pointer', 'cursor-text', 'cursor-grab', 'cursor-grabbing');
    }
  });