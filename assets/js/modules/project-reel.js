
  // ---- 15. Serpentine Project Reel Animation ----
  function initProjectReelAnimation() {
    const container = document.querySelector('.project-list');
    if (!container) return;

    // Set container styles to allow custom layout positioning
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.width = '100%';
    container.style.display = 'block';

    let isPaused = false;
    // Pause animation when hovering or touching a project item itself
    const projectItems = container.querySelectorAll('.project-item');
    projectItems.forEach(item => {
      item.addEventListener('mouseenter', () => { isPaused = true; });
      item.addEventListener('mouseleave', () => { isPaused = false; });
      item.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
      item.addEventListener('touchend', () => { isPaused = false; });
    });

    let activeItems = [];
    let itemPositions = []; // Array of { element: HTMLElement, progress: number }
    const speed = 0.55; // Pixels per frame
    let lastWidth = 0;

    function update() {
      // Check if project (portfolio) tab is active
      const portfolioPage = document.querySelector('article[data-page="project"]');
      if (!portfolioPage || !portfolioPage.classList.contains('active')) {
        requestAnimationFrame(update);
        return;
      }

      // Query currently active items, excluding any cloned items
      const currentActiveItems = Array.from(container.querySelectorAll('.project-item.active:not(.project-item-clone)'));
      if (currentActiveItems.length === 0) {
        requestAnimationFrame(update);
        return;
      }

      const W = container.getBoundingClientRect().width;

      // Determine max rows and card width based on screen size
      const isDesktop = window.innerWidth >= 1024;
      const gap = 20;
      const rowGap = 20;
      
      // Optimize cardWidth to scale smoothly across different device sizes
      // (Desktop: 260px - 320px, Mobile/Tablet: 180px - 260px)
      const cardWidth = isDesktop 
        ? Math.max(260, Math.min(320, (W - 2 * gap) / 3.25)) 
        : Math.max(180, Math.min(260, (W - gap) / 1.8));

      // Target gap for spacing between cards (larger on mobile to prevent overlapping)
      const targetGap = isDesktop ? 35 : 55;
      const minGap = 20;

      // Single row track length formula (preliminary, using cardWidth)
      const tempR = W + cardWidth + 2 * gap;

      // Adjust rows dynamically: calculate the required rows so that all active elements
      // can be distributed along the serpentine path without overlapping.
      const n = currentActiveItems.length;
      let numRows = Math.max(1, Math.round(n * (cardWidth + targetGap) / tempR));
      const minRows = Math.ceil(n * (cardWidth + minGap) / tempR);
      numRows = Math.max(numRows, minRows);
      const maxAllowedRows = isDesktop ? 3 : 4;
      numRows = Math.min(maxAllowedRows, numRows);

      // Track length with preliminary cardWidth
      const L_prelim = numRows * tempR;
      const maxSpacing = L_prelim / n;

      // Calculate final card dimensions to guarantee no overlap
      const renderCardWidth = Math.min(cardWidth, maxSpacing - minGap);
      
      // Preserve aspect ratio but give slightly more height to cards on mobile
      // to prevent text overlap if project titles wrap to multiple lines.
      const renderCardHeight = isDesktop ? renderCardWidth * 0.98 : renderCardWidth * 1.1;
      const renderImgHeight = renderCardWidth * 0.72;

      // Final track metrics using renderCardWidth
      const x_min = -renderCardWidth - gap;
      const x_max = W + gap;
      const R = x_max - x_min; // Single row track length
      const L = numRows * R;   // Total serpentine length

      const totalHeight = numRows * renderCardHeight + (numRows - 1) * rowGap;
      container.style.height = `${totalHeight}px`;

      // Check if set of active items has changed or container width changed
      const widthChanged = Math.abs(W - lastWidth) > 5;
      const activeIdsChanged = currentActiveItems.length !== activeItems.length ||
                               currentActiveItems.some((item, i) => item !== activeItems[i]) ||
                               widthChanged;

      if (activeIdsChanged) {
        // Clean up any leftover clones from previous logic
        container.querySelectorAll('.project-item-clone').forEach(el => el.remove());

        activeItems = currentActiveItems;
        lastWidth = W;

        // Perfectly uniform spacing along the loop track
        const spacing = L / n;

        // Offset so items start on-screen in the visible portion of row 0
        const visibleStart = renderCardWidth + gap;

        itemPositions = activeItems.map((element, index) => ({
          element,
          progress: (visibleStart + index * spacing) % L
        }));

        // Hide any inactive items completely
        const allItems = Array.from(container.querySelectorAll('.project-item:not(.project-item-clone)'));
        allItems.forEach(item => {
          if (!item.classList.contains('active')) {
            item.style.position = 'absolute';
            item.style.left = '-9999px';
            item.style.top = '-9999px';
          }
        });
      }

      // Update positions
      const modalElement = document.getElementById('projectModalContainer');
      const isModalOpen = modalElement && modalElement.classList.contains('active');
      if (!isPaused && !isModalOpen && itemPositions.length > 0) {
        itemPositions.forEach(item => {
          item.progress = (item.progress + speed) % L;
        });
      }

      // Render items
      itemPositions.forEach(item => {
        const el = item.element;
        el.style.position = 'absolute';
        el.style.width = `${renderCardWidth}px`;
        el.style.height = `${renderCardHeight}px`;
        el.style.margin = '0';

        const d = item.progress;
        const rowIndex = Math.floor(d / R);
        const progressInRow = d % R;

        let x = 0;
        let y = rowIndex * (renderCardHeight + rowGap);

        // Alternating row directions:
        // Row 1 (even index): Left to Right
        // Row 2 (odd index): Right to Left
        // Row 3 (even index): Left to Right
        if (rowIndex % 2 === 0) {
          x = x_min + progressInRow;
        } else {
          x = x_max - progressInRow;
        }

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Scale inner images to fit the new card boundaries
        const img = el.querySelector('.project-img');
        if (img) {
          img.style.height = `${renderImgHeight}px`;
          img.style.marginBottom = '10px';
        }
      });

      requestAnimationFrame(update);
    }

    update();
  }
  initProjectReelAnimation();
