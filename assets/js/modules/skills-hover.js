
  // ---- 18. Loop progress bar animation on hover ----
  function initSkillsHoverAnimation() {
    const skillsItems = document.querySelectorAll('.skills-item');
    skillsItems.forEach(item => {
      const progressBar = item.querySelector('.skill-progress-fill div');
      const progressPercentage = item.querySelector('.title-wrapper data');
      if (!progressBar || !progressPercentage) return;

      const target = parseInt(progressPercentage.getAttribute('value')) || 0;
      let hoverInterval = null;
      let hoverTimeout = null;

      item.addEventListener('mouseenter', () => {
        // Clear any global tab load intervals for this bar to prevent conflicts
        const barId = progressBar.id;
        if (barId && progressIntervals[barId]) {
          clearInterval(progressIntervals[barId]);
          progressIntervals[barId] = null;
        }

        function startFillAnimation() {
          let width = 0;
          progressBar.style.width = '0%';
          progressPercentage.textContent = '0%';
          progressPercentage.style.left = '0%';

          if (hoverInterval) clearInterval(hoverInterval);
          hoverInterval = setInterval(() => {
            if (width >= target) {
              clearInterval(hoverInterval);
              hoverInterval = null;
              // Wait for 1.2 seconds, then restart the animation loop
              hoverTimeout = setTimeout(startFillAnimation, 1200);
            } else {
              width++;
              progressBar.style.width = width + '%';
              progressPercentage.textContent = width + '%';
              progressPercentage.style.left = width + '%';
            }
          }, 12);
        }

        startFillAnimation();
      });

      item.addEventListener('mouseleave', () => {
        if (hoverInterval) clearInterval(hoverInterval);
        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverInterval = null;
        hoverTimeout = null;

        // Restore to target value instantly & smoothly
        progressBar.style.width = target + '%';
        progressPercentage.textContent = target + '%';
        progressPercentage.style.left = target + '%';
      });
    });
  }
  initSkillsHoverAnimation();
