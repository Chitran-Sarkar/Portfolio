
// ---- 7. Page Navigation logic ----
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
    // Reset sub-filter navigation state when switching tabs
    subFilterModeActive = false;
    // Find the currently active page
    let currentIndex = -1;
    let oldPage = null;
    pages.forEach((page, idx) => {
      if (page.classList.contains("active")) {
        currentIndex = idx;
        oldPage = page;
      }
    });

    const targetPage = this.innerHTML.toLowerCase();
    let targetIndex = -1;
    pages.forEach((page, idx) => {
      if (targetPage === page.dataset.page) {
        targetIndex = idx;
      }
    });

    // Only run if transitioning to a different tab
    if (targetIndex !== -1 && targetIndex !== currentIndex) {
      // Clean up previous transition classes from all pages
      pages.forEach(p => {
        p.classList.remove("turn-next", "turn-prev", "exit-next", "exit-prev");
      });

      // Handle the leaving page exit animation
      if (oldPage) {
        const isNext = targetIndex > currentIndex;
        const exitClass = isNext ? "exit-next" : "exit-prev";
        const tempOldPage = oldPage; // closure reference
        
        tempOldPage.classList.remove("active");
        tempOldPage.classList.add(exitClass);
        
        // Hide the leaving page after the animation duration (600ms)
        setTimeout(() => {
          tempOldPage.classList.remove(exitClass);
        }, 600);
      }

      // Handle the entering page enter animation
      const newPage = pages[targetIndex];
      const enterClass = targetIndex > currentIndex ? "turn-next" : "turn-prev";
      newPage.classList.add(enterClass, "active");

      // Update navbar links active styling
      navigationLinks.forEach((lnk, idx) => {
        if (idx === targetIndex) {
          lnk.classList.add("active");
        } else {
          lnk.classList.remove("active");
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update underline and trigger tab specific transitions
      updateUnderline();
      setTimeout(applyBreatheAnimation, 100);

      // If navigating to Contact tab, invalidate map size to ensure correct rendering
      if (targetPage === 'contact' && mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
          mapInstance.setView([22.447137, 88.429729], 15, { animate: true });
        }, 150);
      }

      // If navigating to Skills, reset filters to show all sections with Technical active
      if (targetPage === 'skills') {
        // Dispatch custom event to immediately wake up physics
        window.dispatchEvent(new Event('skills-tab-change'));

        if (skillFilterButtons && skillFilterButtons.length > 0) {
          // Set default active skill filter button (Technical) and apply its filter
          if (skillFilterButtons.length > 0) {
            const defaultBtn = skillFilterButtons[0];
            skillFilterButtons.forEach(btn => btn.classList.remove('active'));
            defaultBtn.classList.add('active');
            const defaultFilter = defaultBtn.getAttribute('data-skill-filter');
            applySkillFilter(defaultFilter);
          }
        }
      }

      // If navigating to Project tab, reset project filters to default (All)
      if (targetPage === 'project') {
        if (filterBtn && filterBtn.length > 0) {
          filterBtn.forEach(btn => {
            if (btn.innerText.toLowerCase() === 'all') {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
          if (selectValue) {
            selectValue.innerText = "All";
          }
          filterFunc('all');
        }
      }
    }
  });
});

  // Initial breathe state call
  applyBreatheAnimation();
