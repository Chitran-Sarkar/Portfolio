
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
