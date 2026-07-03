
  // ---- 17. Resume Timeline Comet & Glow Animation ----
  function initTimelineCometGlow() {
    const duration = 4000; // Loop duration in ms

    function updateComet(timestamp) {
      const resumeTab = document.querySelector('article.resume');
      if (!resumeTab || !resumeTab.classList.contains('active')) {
        requestAnimationFrame(updateComet);
        return;
      }

      const list = document.querySelector('.timeline-list');
      const iconBox = document.querySelector('.timeline .title-wrapper .icon-box');
      if (!list || !iconBox) {
        requestAnimationFrame(updateComet);
        return;
      }

      const listRect = list.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024;
      const lineTopOffset = isDesktop ? -49 : -40;
      const bottomOffset = listRect.height - 15;
      const lineHeight = bottomOffset - lineTopOffset;

      // Calculate comet progress through the 4s cycle
      const timeInCycle = timestamp % duration;
      const progress = timeInCycle / duration;

      // Comet moves from top of line (lineTopOffset - 120) to bottom (bottomOffset + 120)
      // relative to line's top (0px). In list-relative space, it moves from lineTopOffset - 120 to bottomOffset + 120.
      const startCometY = lineTopOffset - 120;
      const endCometY = bottomOffset + 120;
      const cometYListSpace = startCometY + progress * (endCometY - startCometY);

      // Set CSS variable --comet-y on the list relative to the line element (which is positioned at lineTopOffset).
      // Since background-position of the line is relative to itself, the comet position relative to the line is:
      const cometYLineSpace = cometYListSpace - lineTopOffset;
      list.style.setProperty('--comet-y', `${cometYLineSpace}px`);

      // Comet center in list-relative space (brightest part of comet gradient is ~80px from top of its 120px height)
      const cometCenterListY = cometYListSpace + 80;

      // 1. Calculate and apply glow for Icon Box
      const iconBoxRect = iconBox.getBoundingClientRect();
      const iconBoxY = iconBoxRect.top - listRect.top + iconBoxRect.height / 2;
      const distToIcon = Math.abs(cometCenterListY - iconBoxY);
      const intensityIcon = Math.max(0, 1 - distToIcon / 55); // 55px active fade radius
      iconBox.style.setProperty('--glow-intensity', intensityIcon);

      // 2. Calculate and apply glow for Timeline Dots
      const items = list.querySelectorAll('.timeline-item');
      items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        // Dot center is 5px from item top + half dot size (3px on mobile, 4px on desktop)
        const dotY = itemRect.top - listRect.top + 5 + (isDesktop ? 4 : 3);
        const distToDot = Math.abs(cometCenterListY - dotY);
        const intensityDot = Math.max(0, 1 - distToDot / 45); // 45px active fade radius
        item.style.setProperty('--glow-intensity', intensityDot);
      });

      requestAnimationFrame(updateComet);
    }

    requestAnimationFrame(updateComet);
  }
  function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
initTimelineCometGlow();
