/**
 * ============================================================
 *  modules/theme-toggle.js — Dark / Light Theme Toggle Logic
 * ============================================================
 *  Persists the user's preferred theme in localStorage and
 *  applies it on load (preventing flash of wrong theme).
 *  Also fires a custom 'theme-change' event so other modules
 *  (e.g. physics canvas, Leaflet map) can react to the switch.
 *
 *  Storage key: 'portfolio-theme'  (values: 'dark' | 'light')
 *  DOM target:  document.documentElement [data-theme] attribute
 *
 *  Dispatches: CustomEvent('theme-change', { detail: { theme } })
 *
 *  Depends on: none
 * ============================================================
 */

  // ---- 16. Theme Toggle (Dark ↔ Light) ----
  function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Apply saved theme (also prevents flash – see inline script in head)
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);

      // Dispatch custom event so other systems (e.g. physics canvas, leaflet) can react
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
    });
  }
  initThemeToggle();