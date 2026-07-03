
  // ---- 10. Accessibility Arrow Key Tab & Sub-Filter Navigation ----
  document.addEventListener('keydown', (e) => {
    const activeArticle = document.querySelector('article.active');
    if (!activeArticle) return;
    
    const pageName = activeArticle.getAttribute('data-page'); // 'skills', 'project', 'about', etc.
    
    // Collect sub-filter buttons if present on the active page
    let subFilterButtons = [];
    if (pageName === 'skills') {
      subFilterButtons = Array.from(activeArticle.querySelectorAll('.skills-filter-btn[data-skill-filter]'));
    } else if (pageName === 'project') {
      subFilterButtons = Array.from(activeArticle.querySelectorAll('.skills-filter-btn[data-filter-btn]'));
    }

    const hasSubFilters = subFilterButtons.length > 0;

    if (!subFilterModeActive) {
      // Tab Navigation Mode
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeLink = document.querySelector('.navbar-link.active');
        if (!activeLink) return;
        
        const links = Array.from(navigationLinks);
        let index = links.indexOf(activeLink);
        
        if (e.key === 'ArrowLeft') {
          index = (index - 1 + links.length) % links.length;
        } else {
          index = (index + 1) % links.length;
        }
        
        links[index].click();
        links[index].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowDown' && hasSubFilters) {
        // Enter sub-filter navigation mode
        subFilterModeActive = true;
        // Focus either the currently active filter, or the first one
        const activeFilterBtn = subFilterButtons.find(btn => btn.classList.contains('active')) || subFilterButtons[0];
        if (activeFilterBtn) {
          activeFilterBtn.focus();
        }
        e.preventDefault();
      }
    } else {
      // Sub-Filter Navigation Mode
      if (e.key === 'ArrowUp') {
        // Return to main tab navigation
        subFilterModeActive = false;
        const activeLink = document.querySelector('.navbar-link.active');
        if (activeLink) {
          activeLink.focus();
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (hasSubFilters) {
          const focusedElement = document.activeElement;
          let currentIndex = subFilterButtons.indexOf(focusedElement);
          
          // Fallback to active button index if focus is lost
          if (currentIndex === -1) {
            const activeBtn = subFilterButtons.find(btn => btn.classList.contains('active')) || subFilterButtons[0];
            currentIndex = subFilterButtons.indexOf(activeBtn);
          }

          if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + subFilterButtons.length) % subFilterButtons.length;
          } else {
            currentIndex = (currentIndex + 1) % subFilterButtons.length;
          }

          const targetBtn = subFilterButtons[currentIndex];
          if (targetBtn) {
            targetBtn.click();
            targetBtn.focus();
          }
          e.preventDefault();
        }
      } else if (e.key === 'ArrowDown') {
        // Prevent browser scrolling while navigating sub-filters
        e.preventDefault();
      }
    }
  });
