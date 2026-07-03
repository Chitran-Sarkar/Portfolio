
// ---- 1b. Scrolly Canvas Logic ----
const canvas = document.getElementById('scrolly-canvas');
const scrollyContainer = document.getElementById('scrolly-container');
const mainEl = document.querySelector('main');

if (canvas && scrollyContainer) {
  const ctx = canvas.getContext('2d');
  let currentFrameIndex = 0;
  let introFinished = false;
  
  window.initializeScrollyCanvas = function() {
    resizeCanvas();
    drawFrame(0);
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrameIndex);
  }

  function drawFrame(index) {
    const img = preloadedFrames[index];
    if (!img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  const sec1 = document.getElementById('sec-1');
  const sec2 = document.getElementById('sec-2');
  const sec3 = document.getElementById('sec-3');

  function getInterpolatedStyle(progress, startFadeIn, endFadeIn, startFadeOut, endFadeOut) {
    let opacity = 0;
    let translateY = 50;

    if (progress >= startFadeIn && progress <= endFadeOut) {
      if (progress < endFadeIn) {
        const p = (progress - startFadeIn) / (endFadeIn - startFadeIn);
        opacity = p;
        translateY = 50 * (1 - p);
      } else if (progress > startFadeOut) {
        const p = (progress - startFadeOut) / (endFadeOut - startFadeOut);
        opacity = 1 - p;
        translateY = -50 * p;
      } else {
        opacity = 1;
        translateY = 0;
      }
    } else if (progress > endFadeOut) {
      opacity = 0;
      translateY = -50;
    }

    return { opacity, translateY };
  }

  function updateScrolly() {
    if (introFinished) return;

    const containerHeight = scrollyContainer.clientHeight;
    // Calculate progress based on scroll position relative to container height (500vh)
    let progress = window.scrollY / containerHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Lock cinematic scrolly intro once scroll reaches the bottom boundary
    if (progress >= 0.99) {
      introFinished = true;
      scrollyContainer.style.display = 'none';
      if (mainEl) {
        mainEl.classList.remove('reveal-active');
        mainEl.classList.add('intro-done');
      }
      if (typeof updateScrollProgress === 'function') {
        updateScrollProgress();
      }
      window.scrollTo(0, 0);
      window.removeEventListener('scroll', updateScrolly);
      return;
    }

    // Frame drawing
    const frameIndex = Math.floor(progress * (totalFrames - 1));
    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      drawFrame(currentFrameIndex);
    }

    // Text overlay interpolation
    const s1 = getInterpolatedStyle(progress, -0.1, 0, 0.1, 0.25);
    if (sec1) {
      sec1.style.opacity = s1.opacity;
      sec1.style.transform = `translateY(${s1.translateY}px)`;
    }

    const s2 = getInterpolatedStyle(progress, 0.22, 0.32, 0.45, 0.55);
    if (sec2) {
      sec2.style.opacity = s2.opacity;
      sec2.style.transform = `translateY(${s2.translateY}px)`;
    }

    const s3 = getInterpolatedStyle(progress, 0.55, 0.65, 0.78, 0.90);
    if (sec3) {
      sec3.style.opacity = s3.opacity;
      sec3.style.transform = `translateY(${s3.translateY}px)`;
    }

    // Reveal Main Layout (starts rising up when scroll is near the bottom 80%)
    if (mainEl) {
      const triggerProgress = 0.80;
      if (progress >= triggerProgress) {
        mainEl.classList.add('reveal-active');
      } else {
        mainEl.classList.remove('reveal-active');
      }
      if (typeof updateScrollProgress === 'function') {
        updateScrollProgress();
      }
    }
  }

  let isTicking = false;
  function handleScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateScrolly();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', resizeCanvas);
}