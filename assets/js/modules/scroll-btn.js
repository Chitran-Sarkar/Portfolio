
  // ---- 20. Floating Scroll Progress & Navigation Button ----
  const scrollBtn = document.getElementById('scroll-nav-btn');
  const scrollIcon = document.getElementById('scroll-arrow-icon');
  const progressBar = scrollBtn ? scrollBtn.querySelector('.progress-bar') : null;
  const themeToggle = document.getElementById('theme-toggle');
  let lastScrollY = window.scrollY || document.documentElement.scrollTop;

  let targetPercent = 0;
  let currentPercent = 0;
  let animFrameId = null;

  function drawProgress() {
    if (!scrollBtn || !progressBar) return;

    // Buttery-smooth linear interpolation (lerp) towards target scroll position
    const diff = targetPercent - currentPercent;
    if (Math.abs(diff) > 0.0002) {
      currentPercent += diff * 0.16; // 0.16 lerp factor provides snappy but highly responsive easing
      animFrameId = requestAnimationFrame(drawProgress);
    } else {
      currentPercent = targetPercent;
      animFrameId = null;
    }

    // Update progress bar stroke-dashoffset (radius is 24px, circumference is 150.8px)
    const r = 24;
    const circumference = 2 * Math.PI * r; // 150.8
    const offset = circumference - (currentPercent * circumference);
    progressBar.style.strokeDashoffset = offset;
  }

  function updateScrollProgress() {
    // Hide and disable both buttons while the scrolly canvas intro is active
    const isIntroActive = !mainEl || (!mainEl.classList.contains('reveal-active') && !mainEl.classList.contains('intro-done'));

    if (isIntroActive) {
      if (scrollBtn) {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.pointerEvents = 'none';
      }
      if (themeToggle) {
        themeToggle.style.opacity = '0';
        themeToggle.style.pointerEvents = 'none';
      }
      return;
    } else {
      if (scrollBtn) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.pointerEvents = 'auto';
      }
      if (themeToggle) {
        themeToggle.style.opacity = '1';
        themeToggle.style.pointerEvents = 'auto';
      }
    }

    if (!scrollBtn || !progressBar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Set target percentage (0 to 1)
    targetPercent = docHeight > 0 ? scrollTop / docHeight : 0;
    targetPercent = Math.max(0, Math.min(1, targetPercent));

    // Kick off animation loop if not already running
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(drawProgress);
    }

    // Detect scroll direction and boundaries
    if (scrollTop <= 5) {
      // Force DOWN arrow at the very top of the page
      scrollBtn.classList.add('scroll-down');
      scrollBtn.classList.remove('scroll-up');
      if (scrollIcon) {
        scrollIcon.className = 'fa-solid fa-chevron-down';
      }
    } else if (scrollTop >= docHeight - 5) {
      // Force UP arrow at the very bottom of the page
      scrollBtn.classList.add('scroll-up');
      scrollBtn.classList.remove('scroll-down');
      if (scrollIcon) {
        scrollIcon.className = 'fa-solid fa-chevron-up';
      }
    } else {
      // General scroll direction detection
      if (scrollTop > lastScrollY) {
        // Scrolling DOWN
        scrollBtn.classList.add('scroll-down');
        scrollBtn.classList.remove('scroll-up');
        if (scrollIcon) {
          scrollIcon.className = 'fa-solid fa-chevron-down';
        }
      } else if (scrollTop < lastScrollY) {
        // Scrolling UP
        scrollBtn.classList.add('scroll-up');
        scrollBtn.classList.remove('scroll-down');
        if (scrollIcon) {
          scrollIcon.className = 'fa-solid fa-chevron-up';
        }
      }
    }
    
    lastScrollY = scrollTop;
  }

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const isUp = scrollBtn.classList.contains('scroll-up');
      if (isUp) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }
    });

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    
    // Run initially to set starting state
    updateScrollProgress();
  }
