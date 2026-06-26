'use strict';

// Element toggle function
const elementToggleFunc = function (elem) {
  if (elem) elem.classList.toggle("active");
};

// Toast notification function
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = document.createElement('i');
  icon.className = `toast-icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-message';
  msgSpan.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(msgSpan);
  container.appendChild(toast);

  // Trigger CSS show transition
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Hide and remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

// Progress intervals map
const progressIntervals = {};

// Breathe and progress animation for tab content
function applyBreatheAnimation() {
  document.querySelectorAll('article').forEach(article => {
    if (article.classList.contains('active')) {
      Array.from(article.children).forEach(child => {
        // Do not apply 'breathe' animation to the Project tab or the footer/foot
        if (!child.classList.contains('footer') && !child.classList.contains('foot') && !article.classList.contains('portfolio')) {
          child.classList.add('breathe');
        } else {
          child.classList.remove('breathe');
        }
      });

      // Add rise animation only for resume tab
      if (article.classList.contains('resume')) {
        Array.from(article.children).forEach(child => {
          if (!child.classList.contains('footer') && !child.classList.contains('foot')) {
            child.classList.add('rise');
          }
        });
      } else {
        Array.from(article.children).forEach(child => {
          child.classList.remove('rise');
        });
      }

      // Add corporate animation and run progress bars only for skills tab
      if (article.classList.contains('skills')) {
        const progressData = [
          { barId: 'front', percentageId: 'f', target: 70 },
          { barId: 'back', percentageId: 'b', target: 70 },
          { barId: 'web', percentageId: 'wd', target: 80 },
          { barId: 'graph', percentageId: 'gd', target: 70 },
          { barId: 'brand', percentageId: 'br', target: 80 },
          { barId: 'word', percentageId: 'wr', target: 90 },
          { barId: 'dev', percentageId: 'de', target: 50 }
        ];

        // Reset all progress bars and percentages to 0 first
        progressData.forEach(data => {
          const progressBar = document.getElementById(data.barId);
          const progressPercentage = document.getElementById(data.percentageId);
          if (progressBar) progressBar.style.width = '0%';
          if (progressPercentage) progressPercentage.textContent = '0%';

          // Clear any existing interval for this bar
          if (progressIntervals[data.barId]) {
            clearInterval(progressIntervals[data.barId]);
            progressIntervals[data.barId] = null;
          }
        });

        // Animate bars with faster ticks for smooth transition (15ms instead of 140ms)
        setTimeout(() => {
          progressData.forEach(data => {
            let width = 0;
            const progressBar = document.getElementById(data.barId);
            const progressPercentage = document.getElementById(data.percentageId);

            progressIntervals[data.barId] = setInterval(() => {
              if (width >= data.target) {
                clearInterval(progressIntervals[data.barId]);
                progressIntervals[data.barId] = null;
              } else {
                width++;
                if (progressBar) progressBar.style.width = width + '%';
                if (progressPercentage) {
                  progressPercentage.textContent = width + '%';
                  progressPercentage.style.left = width + '%';
                }
              }
            }, 15);
          });
        }, 200);

        // Animate all direct children of all sections within the skills tab
        article.querySelectorAll('section').forEach(section => {
          Array.from(section.children).forEach(child => {
            child.classList.add('corporate');
          });
        });
      } else {
        // Remove animation from all sections' children
        article.querySelectorAll('section').forEach(section => {
          Array.from(section.children).forEach(child => {
            child.classList.remove('corporate');
          });
        });

        // Clear all progress bar intervals when leaving the skills tab
        Object.keys(progressIntervals).forEach(key => {
          if (progressIntervals[key]) {
            clearInterval(progressIntervals[key]);
            progressIntervals[key] = null;
          }
        });
      }
    } else {
      Array.from(article.children).forEach(child => {
        child.classList.remove('breathe');
        child.classList.remove('rise');
        child.classList.remove('corporate');
      });
    }
  });
}

// Global variables for navbar underline animation
let underline;
let navbar;

function updateUnderline() {
  const activeLink = document.querySelector('.navbar-link.active');
  if (activeLink && underline && navbar) {
    const rect = activeLink.getBoundingClientRect();
    const navRect = navbar.getBoundingClientRect();
    underline.style.left = `${rect.left - navRect.left}px`;
    underline.style.width = `${rect.width}px`;
  }
}

// Unified DOM Initialization Flow
document.addEventListener('DOMContentLoaded', function() {
  // Force scroll to top on page reload to ensure the intro plays from start
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Initialize Leaflet Map
  let mapInstance = null;
  function initializeLeafletMap() {
    return new Promise((resolve) => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer || typeof L === 'undefined') {
        resolve();
        return;
      }

      try {
        const lat = 22.447137;
        const lng = 88.429729;

        mapInstance = L.map('map', {
          center: [lat, lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false
        });

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const initialTileUrl = currentTheme === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

        let activeTileLayer = L.tileLayer(initialTileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20
        }).addTo(mapInstance);

        window.addEventListener('theme-change', (e) => {
          const theme = e.detail.theme;
          mapInstance.removeLayer(activeTileLayer);
          const newUrl = theme === 'light'
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
          activeTileLayer = L.tileLayer(newUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20
          }).addTo(mapInstance);
        });

        // Add beautiful custom glowing circle marker matching the theme color
        const customMarkerIcon = L.divIcon({
          className: 'custom-map-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([lat, lng], { icon: customMarkerIcon }).addTo(mapInstance);

        // Listen for tile layer load to resolve preloader asset
        activeTileLayer.on('load', () => {
          resolve();
        });

        activeTileLayer.on('tileerror', () => {
          resolve(); // Resolve anyway so page load is not blocked
        });

        // Safety fallback: if tiles don't load in 3 seconds, resolve
        setTimeout(resolve, 3000);
      } catch (err) {
        console.error("Leaflet initialization error:", err);
        resolve();
      }
    });
  }

// ---- 1. Preloader – comprehensive asset-gate --------------------------------
//
// Tracks EVERY asset category before dismissing:
//   • All <img> elements in the HTML (profile, project thumbnails, etc.)
//   • Background videos (dark + light) – waits for canplaythrough
//   • Devicon CDN SVG images used by the physics skill bubbles
//   • Scrolly canvas WebP frame sequence (80 frames, decoded into bitmaps)
//   • Leaflet tile map (resolves on 'load' or 3 s timeout)
//
// Strategy: Each asset is represented as a Promise that always resolves
// (errors fall through so a single bad CDN image never blocks the page).
// The preloader finishes when ALL promises settle AND a minimum display time
// of 800 ms has elapsed (avoids a flash‑and‑gone experience on fast nets).
// A hard 12 s ceiling prevents hanging forever on blocked CDN resources.
// ---------------------------------------------------------------------------

const preloader    = document.getElementById('preloader');
const totalFrames  = 60;
const preloadedFrames = [];

function getFrameUrl(index) {
  const frameStr = String(index).padStart(2, '0');
  let folder = 'desktop';
  if (window.innerWidth < 768)      folder = 'mobile';
  else if (window.innerWidth >= 1400) folder = 'raw';
  return `./assets/Sequence/${folder}/frame_${frameStr}_delay-0.066s.webp`;
}

if (preloader) {
  const progressBar  = preloader.querySelector('.loader-progress');
  const percentText  = preloader.querySelector('.loader-percent');
  const labelEl      = preloader.querySelector('.loader-label');

  // ── Devicon URLs mirrored from the physics simulation ──────────────────────
  const DEVICON_URLS = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qt/qt-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/keras/keras-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
  ];

  // ── Asset counters ──────────────────────────────────────────────────────────
  let resolvedCount = 0;
  const assetPromises = [];

  // Helper: wrap an image element load into a Promise
  function trackImage(img, label) {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth > 0) { resolve(); return; }
      const done = () => { resolve(); };
      img.addEventListener('load',  done, { once: true });
      img.addEventListener('error', done, { once: true });
      // Per-image 8 s safety net
      setTimeout(resolve, 8000);
    });
  }

  // Helper: wrap a video into a Promise (resolves when it can play)
  function trackVideo(videoEl, label) {
    return new Promise(resolve => {
      if (!videoEl) { resolve(); return; }
      if (videoEl.readyState >= 3) { resolve(); return; } // HAVE_FUTURE_DATA
      const done = () => { resolve(); };
      videoEl.addEventListener('canplaythrough', done, { once: true });
      videoEl.addEventListener('error',          done, { once: true });
      // 5 s safety net for videos (may be large)
      setTimeout(resolve, 5000);
    });
  }

  // Register a promise and hook it to progress update
  function registerAsset(promise) {
    assetPromises.push(promise);
    promise.then(() => {
      resolvedCount++;
      updateProgress();
    });
  }

  function setLabel(text) {
    if (labelEl) labelEl.textContent = text;
  }

  function updateProgress() {
    const total   = assetPromises.length;
    const percent = total ? Math.min(99, Math.round((resolvedCount / total) * 100)) : 0;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentText)  percentText.textContent  = `${percent}%`;
  }

  // ── 1. HTML <img> elements ─────────────────────────────────────────────────
  setLabel('Loading images…');
  Array.from(document.images).forEach(img => {
    registerAsset(trackImage(img, img.src));
  });

  // ── 2. Background videos ────────────────────────────────────────────────────
  setLabel('Loading videos…');
  const bgVideoDark  = document.getElementById('bg-video-dark');
  const bgVideoLight = document.getElementById('bg-video-light');
  registerAsset(trackVideo(bgVideoDark,  'bg-dark'));
  registerAsset(trackVideo(bgVideoLight, 'bg-light'));

  // ── 3. Devicon skill SVGs ──────────────────────────────────────────────────
  setLabel('Loading skill icons…');
  DEVICON_URLS.forEach(url => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Store in a global cache so the physics simulation reuses the same objects
    if (!window._deviconCache) window._deviconCache = {};
    window._deviconCache[url] = img;
    img.src = url;
    registerAsset(trackImage(img, url));
  });

  // ── 4. Scrolly canvas frame sequence ───────────────────────────────────────
  setLabel('Loading intro frames…');
  for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    preloadedFrames.push(img);

    // Wrap frame load + optional decode into one promise
    const framePromise = new Promise(resolve => {
      const onLoad = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      };
      if (img.complete && img.naturalWidth > 0) { onLoad(); return; }
      img.addEventListener('load',  onLoad,   { once: true });
      img.addEventListener('error', resolve,  { once: true });
      setTimeout(resolve, 10000); // per-frame 10 s cap
    });
    registerAsset(framePromise);
  }

  // ── 5. Leaflet tile map ────────────────────────────────────────────────────
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    setLabel('Loading map…');
    registerAsset(initializeLeafletMap());
  }

  // ── Finish: wait for everything + minimum display time ─────────────────────
  const MIN_DISPLAY_MS   = 800;   // never dismiss in < 800 ms
  const HARD_TIMEOUT_MS  = 12000; // bail out after 12 s regardless
  const startedAt = performance.now();

  // Hard-ceiling promise
  const hardTimeout = new Promise(resolve => setTimeout(resolve, HARD_TIMEOUT_MS));

  Promise.race([
    Promise.all(assetPromises),
    hardTimeout
  ]).then(() => {
    // Force bar to 100 %
    resolvedCount = assetPromises.length;
    if (progressBar) progressBar.style.width = '100%';
    if (percentText)  percentText.textContent  = '100%';
    setLabel('Ready!');

    // Ensure minimum display time so the user actually sees the preloader
    const elapsed   = performance.now() - startedAt;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(() => {
      preloader.classList.add('finished');
      document.body.classList.remove('preloader-active');
      if (window.initializeScrollyCanvas) {
        window.initializeScrollyCanvas();
      }
      setTimeout(updateUnderline, 300);

      // Release preloader video memory
      setTimeout(() => {
        const vid = preloader.querySelector('#preloader-bg-video');
        if (vid) { vid.pause(); vid.src = ''; vid.load(); vid.remove(); }
      }, 600);
    }, remaining);
  });

  // Show initial 0 %
  updateProgress();
}


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
// ---- 2. Navbar sliding underline setup ----
  navbar = document.querySelector('.navbar');
  if (navbar) {
    underline = document.createElement('div');
    underline.className = 'navbar-underline';
    navbar.appendChild(underline);
  }

  // ---- 3. Sidebar toggle functionality for mobile ----
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { 
      elementToggleFunc(sidebar); 
    });
  }

  // ---- 4. Custom select dropdown logic ----
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-select-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const filterItems = document.querySelectorAll("[data-filter-item]");

  if (select) {
    select.addEventListener("click", function () { 
      elementToggleFunc(this); 
    });
  }

  const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
      if (selectedValue === "all") {
        if (filterItems[i].classList.contains('only-category')) {
          filterItems[i].classList.remove("active");
        } else {
          filterItems[i].classList.add("active");
        }
      } else if (selectedValue === filterItems[i].dataset.category) {
        filterItems[i].classList.add("active");
      } else {
        filterItems[i].classList.remove("active");
      }
    }
  };

  // Add click events to select items
  selectItems.forEach(item => {
    item.addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  // Large screen filter buttons click logic
  if (filterBtn.length > 0) {
    let lastClickedBtn = filterBtn[0];
    filterBtn.forEach(btn => {
      btn.addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        if (lastClickedBtn) lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;
      });
    });
  }

  // Default filter call
  filterFunc('all');

// ---- 5. Skills Tab filter logic (Technical, Programming, Soft) ----
const skillFilterButtons = Array.from(document.querySelectorAll('.skills-filter-btn[data-skill-filter]')).filter(btn => btn.getAttribute('data-skill-filter') !== 'all');
const skillSections = [
  document.querySelector('#technical-skills-section'),
  document.querySelector('#programming-languages-section'),
  document.querySelector('#soft-skills-section')
];

// Helper to apply filter based on provided category
function applySkillFilter(filter) {
  const techSection = document.querySelector('#technical-skills-section');
  const progSection = document.querySelector('#programming-languages-section');
  const softSection = document.querySelector('#soft-skills-section');
  // Ensure sections exist before manipulating
  if (!techSection || !progSection || !softSection) return;
  // Hide all sections initially
  techSection.style.display = 'none';
  progSection.style.display = 'none';
  softSection.style.display = 'none';
  // Show the appropriate section based on filter
  if (filter === 'technical') {
    techSection.style.display = '';
  } else if (filter === 'programming') {
    progSection.style.display = '';
  } else if (filter === 'soft') {
    softSection.style.display = '';
  } else if (filter === 'all') {
    // Show all if 'all' is somehow requested
    techSection.style.display = '';
    progSection.style.display = '';
    softSection.style.display = '';
  }
}

skillFilterButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Remove active class from all buttons
    skillFilterButtons.forEach(btn => btn.classList.remove('active'));
    // Activate this button
    this.classList.add('active');
    // Apply the corresponding filter
    const filter = this.getAttribute('data-skill-filter');
    applySkillFilter(filter);

    // Dispatch custom event to immediately wake up physics
    window.dispatchEvent(new Event('skills-tab-change'));
  });
});

// Set default active skill filter button (Technical) and apply its filter
if (skillFilterButtons.length > 0) {
  const defaultBtn = skillFilterButtons[0];
  defaultBtn.classList.add('active');
  const defaultFilter = defaultBtn.getAttribute('data-skill-filter');
  applySkillFilter(defaultFilter);
}

  // Skills Tab dropdown selection for mobile
  const skillSelect = document.querySelector('[data-skill-select]');
  const skillSelectItems = document.querySelectorAll('[data-skill-select-item]');
  const skillSelectValue = document.querySelector('[data-skill-select-value]');
  if (skillSelect) {
    skillSelect.addEventListener('click', function () {
      skillSelect.classList.toggle('active');
    });
    skillSelectItems.forEach(item => {
      item.addEventListener('click', function () {
        let selectedValue = this.innerText;
        if (skillSelectValue) skillSelectValue.innerText = selectedValue;
        skillSelect.classList.remove('active');
        const btn = Array.from(document.querySelectorAll('.skills-filter-btn[data-skill-filter]')).find(b => b.innerText === selectedValue);
        if (btn) btn.click();
      });
    });
  }

  // ---- 6. Web3Forms and Form validation setup ----
  // Get your free Web3Forms Access Key here: https://web3forms.com/
  const WEB3FORMS_ACCESS_KEY = "a5a7986d-d5c4-4313-8969-5f55b6981ccb"; 

  const form = document.querySelector("[data-form]");
  const submitButton = document.querySelector("[data-form-btn]");
  const formInputs = document.querySelectorAll("[data-form-input]");

  const updateButtonState = () => {
    if (form && form.checkValidity()) {
      submitButton.removeAttribute("disabled");
      submitButton.classList.add("btn-ready");
      submitButton.classList.remove("btn-fleeing");
      submitButton.style.transform = 'translateX(0)'; // snap back to centre
    } else if (submitButton) {
      submitButton.setAttribute("disabled", "true");
      submitButton.classList.remove("btn-ready");
      submitButton.classList.add("btn-fleeing");
    }
  };

  formInputs.forEach(input => {
    input.addEventListener("input", updateButtonState);
  });

  updateButtonState();

  // Shake the form when clicking the disabled send button (incomplete fields)
  if (submitButton) {
    submitButton.addEventListener("click", function () {
      if (submitButton.disabled && form) {
        form.classList.remove("form-shake"); // reset to re-trigger
        void form.offsetWidth;              // force reflow so animation restarts
        form.classList.add("form-shake");
        form.addEventListener("animationend", () => {
          form.classList.remove("form-shake");
        }, { once: true });
      }
    });
  }

  // ---- Runaway button: binary-edge flee across the form when invalid ----
  // Resting position: RIGHT edge (translateX(0) with margin-left:auto, margin-right:0)
  // Flee only activates when cursor is within PROXIMITY_Y pixels of the button.
  // When hovering over input fields / textarea (above the button), no flee occurs.
  if (submitButton && form) {
    submitButton.style.position = 'relative';
    submitButton.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)';

    const PROXIMITY_Y = 60; // px above button top edge that counts as "near the button"

    form.addEventListener('mousemove', (e) => {
      // When valid → reset to right-side rest, no flee
      if (!submitButton.classList.contains('btn-fleeing')) {
        submitButton.style.transform = 'translateX(0)';
        return;
      }

      const formRect = form.getBoundingClientRect();
      const btnRect  = submitButton.getBoundingClientRect();

      // Cursor Y relative to form top
      const cursorY     = e.clientY - formRect.top;
      // Button top edge relative to form top
      const btnTopInForm = btnRect.top - formRect.top;

      // Only flee when cursor is within the proximity zone of the button
      if (cursorY < btnTopInForm - PROXIMITY_Y) {
        // Cursor is on inputs/textarea — snap back to right rest, don't flee
        submitButton.style.transform = 'translateX(0)';
        return;
      }

      const cursorX = e.clientX - formRect.left;
      const formMid = formRect.width / 2;
      const formPad = 20;

      // Full slide distance: from right edge all the way to left edge
      const maxFlee = formRect.width - btnRect.width - formPad * 2;

      // Cursor on LEFT half  → stay at right (translateX 0 = right-aligned rest)
      // Cursor on RIGHT half → flee fully to left edge
      const targetX = cursorX >= formMid ? -maxFlee : 0;

      submitButton.style.transform = `translateX(${targetX}px)`;
    });

    form.addEventListener('mouseleave', () => {
      // Snap back to right-side resting position
      submitButton.style.transform = 'translateX(0)';
    });
  }







  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
        showToast('Please set your Web3Forms Access Key in script.js first!', 'error');
        return;
      }

      // Retrieve form data
      const fullname = form.querySelector('input[name="fullname"]').value;
      const email = form.querySelector('input[name="email"]').value;
      const message = form.querySelector('textarea[name="message"]').value;

      if (submitButton) {
        submitButton.setAttribute("disabled", "true");
        submitButton.classList.remove("btn-ready");
        submitButton.innerText = "Sending...";
      }

      // Send the email using Web3Forms
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: fullname,
          email: email,
          subject: "New Message from Portfolio Contact Form",
          message: message
        })
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          showToast('Your message has been sent successfully!', 'success');
          form.reset();
          updateButtonState();
        } else {
          console.error('Web3Forms Error Response:', json);
          showToast(json.message || 'Failed to send the message. Please try again.', 'error');
        }
      })
      .catch((error) => {
        console.error('FAILED...', error);
        showToast('Failed to send the message. Please try again.', 'error');
      })
      .finally(() => {
        if (submitButton) submitButton.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span>Send Message</span>';
      });
    });
  }


// ---- 7. Page Navigation logic ----
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
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

  // ---- 10. Accessibility Arrow Key Tab Navigation ----
  document.addEventListener('keydown', (e) => {
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
    }
  });

  // ---- 12. Skills Physics Bubble Simulation ----
  const initSkillsPhysics = () => {
    const containers = document.querySelectorAll('#programming-languages-section .skills-list');
    const skillsContainer = document.querySelector('#programming-languages-section .skills-container');
    if (!containers.length || !skillsContainer || typeof Matter === 'undefined') return;

    // Convert containers NodeList to Array for indexOf-based grouping
    const containerArr = Array.from(containers);

    // Immediate parsing of skills and hiding of fallback static grids during script load
    const parsedGroups = containerArr.map(container => {
      const grid = container.querySelector('.skills-grid');
      if (!grid) return null;

      const skillElements = grid.querySelectorAll('.skill');
      const skills = Array.from(skillElements).map(el => {
        const iconEl = el.querySelector('i');
        return {
          name: el.textContent.trim(),
          iconClass: iconEl ? iconEl.className : ''
        };
      });

      // Hide static grid fallback immediately
      grid.style.display = 'none';

      return skills;
    });

    const iconMap = {
      'fab fa-python': { char: '\uf3e2', family: '"Font Awesome 5 Brands"' },
      'fab fa-java': { char: '\uf4e4', family: '"Font Awesome 5 Brands"' },
      'fab fa-html5': { char: '\uf13b', family: '"Font Awesome 5 Brands"' },
      'fab fa-css3-alt': { char: '\uf38b', family: '"Font Awesome 5 Brands"' },
      'fab fa-js': { char: '\uf3b8', family: '"Font Awesome 5 Brands"' },
      'fab fa-react': { char: '\uf41b', family: '"Font Awesome 5 Brands"' },
      'fab fa-bootstrap': { char: '\uf836', family: '"Font Awesome 5 Brands"' },
      'fab fa-node-js': { char: '\uf3d3', family: '"Font Awesome 5 Brands"' },
      'fab fa-php': { char: '\uf457', family: '"Font Awesome 5 Brands"' },
      'fab fa-whatsapp': { char: '\uf40c', family: '"Font Awesome 5 Brands"' },
      'fab fa-github': { char: '\uf09b', family: '"Font Awesome 5 Brands"' },
      'fab fa-linkedin': { char: '\uf082', family: '"Font Awesome 5 Brands"' },
      'fab fa-instagram': { char: '\uf16d', family: '"Font Awesome 5 Brands"' },
      'fab fa-snapchat': { char: '\uf2ad', family: '"Font Awesome 5 Brands"' },
      'fab fa-discord': { char: '\uf392', family: '"Font Awesome 5 Brands"' },
      'fas fa-code': { char: '\uf121', family: '"Font Awesome 5 Free"' },
      'fas fa-database': { char: '\uf1c0', family: '"Font Awesome 5 Free"' },
      'fas fa-brain': { char: '\uf5dc', family: '"Font Awesome 5 Free"' },
      'fas fa-terminal': { char: '\uf120', family: '"Font Awesome 5 Free"' },
      'fas fa-flask': { char: '\uf0c3', family: '"Font Awesome 5 Free"' },
      'fas fa-bolt': { char: '\uf0e7', family: '"Font Awesome 5 Free"' },
      'fas fa-cube': { char: '\uf1b2', family: '"Font Awesome 5 Free"' },
      'fas fa-plug': { char: '\uf1e6', family: '"Font Awesome 5 Free"' },
      'fas fa-microchip': { char: '\uf2db', family: '"Font Awesome 5 Free"' },
      'fas fa-square-root-alt': { char: '\uf697', family: '"Font Awesome 5 Free"' },
      'fas fa-table': { char: '\uf0ce', family: '"Font Awesome 5 Free"' },
      'fas fa-fire': { char: '\uf06d', family: '"Font Awesome 5 Free"' },
      'fas fa-paint-brush': { char: '\uf1fc', family: '"Font Awesome 5 Free"' },
      'fas fa-feather-alt': { char: '\uf56b', family: '"Font Awesome 5 Free"' },
      'fas fa-gamepad': { char: '\uf11b', family: '"Font Awesome 5 Free"' },
      'fas fa-window-maximize': { char: '\uf2d0', family: '"Font Awesome 5 Free"' },
      'fas fa-camera': { char: '\uf030', family: '"Font Awesome 5 Free"' }
    };

    // Devicon CDN mapping for high-quality colorful vector logos
    const deviconMap = {
      'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'C': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
      'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
      'Cython': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'Pygame': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'PyQt': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qt/qt-original.svg',
      'OpenCV': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
      'Numpy': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
      'Pandas': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
      'Tensorflow': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
      'Keras': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/keras/keras-original.svg',
      'Numba': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'PyTorch': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
      'ONNX': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'MicroPython': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'PySerial': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'PyFirmata': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',
      'Bash': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
      'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      'Bootstrap': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
      'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
      'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
      'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
      'Flask': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
      'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
    };

    // Reuse images pre-fetched and decoded by the preloader.
    // window._deviconCache is populated before the preloader dismisses,
    // so by the time the Skills tab is ever opened all images are ready.
    const loadedImages = {};
    Object.keys(deviconMap).forEach(key => {
      const url       = deviconMap[key];
      const cached    = window._deviconCache && window._deviconCache[url];
      if (cached && cached.complete && cached.naturalWidth > 0) {
        loadedImages[key] = cached;
      } else {
        // Fallback: create a fresh Image if cache miss (shouldn't happen normally)
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => { loadedImages[key] = img; };
        img.onerror = () => { console.warn(`Devicon fallback load failed: ${key}`); };
        // Also store in cache for consistency
        if (!window._deviconCache) window._deviconCache = {};
        window._deviconCache[url] = img;
      }
    });

    let activeEngine = null;
    let canvasContainer = null;
    let animId = null;
    let wakeUpActiveSimulation = null;
    let isCanvasVisible = true;

    function destroySimulation() {
      if (animId) {
        cancelAnimationFrame(animId);
        clearTimeout(animId);
        animId = null;
      }
      if (activeEngine) {
        Matter.World.clear(activeEngine.world);
        Matter.Engine.clear(activeEngine);
        activeEngine = null;
      }
      if (canvasContainer && canvasContainer.parentNode) {
        canvasContainer.parentNode.removeChild(canvasContainer);
        canvasContainer = null;
      }
      wakeUpActiveSimulation = null;
    }

    function createSimulation() {
      // ── GPU / performance telemetry ──────────────────────────────────────────
      let cohesionFrameSkip = 0;   // toggles O(n²) loop every other frame
      let anchorCacheAge     = 999; // force refresh on first frame
      const ANCHOR_TTL       = 10; // refresh anchor rects every N physics steps
      let cachedGroupAnchors = {};
      let physicsAccum       = 0;  // fixed-timestep accumulator (ms)
      const FIXED_STEP       = 1000 / 60; // 16.667 ms
      // ────────────────────────────────────────────────────────────────────────
      destroySimulation();

      // Create a single global canvas container inside the main skills section container
      canvasContainer = document.createElement('div');
      canvasContainer.className = 'physics-canvas-container global-physics-canvas';
      skillsContainer.appendChild(canvasContainer);

      const physCanvas = document.createElement('canvas');
      // GPU layer promotion – compositor can rasterise this on GPU
      physCanvas.style.willChange = 'transform';
      physCanvas.style.transform  = 'translateZ(0)';
      canvasContainer.appendChild(physCanvas);

      // Try OffscreenCanvas for off-main-thread rendering (Chrome/Edge ≥ 69)
      let ctx;
      let offscreen = null;
      let offCtx    = null;
      const supportsOffscreen = (typeof OffscreenCanvas !== 'undefined') &&
                                (typeof physCanvas.transferControlToOffscreen === 'function');
      if (supportsOffscreen) {
        try {
          offscreen = physCanvas.transferControlToOffscreen();
          offCtx    = offscreen.getContext('2d');
          ctx       = offCtx; // use offscreen context for all drawing
        } catch(e) {
          ctx = physCanvas.getContext('2d', { alpha: true });
        }
      } else {
        ctx = physCanvas.getContext('2d', { alpha: true });
      }

      let width  = skillsContainer.clientWidth  || 800;
      let height = skillsContainer.clientHeight || 700;

      // Set canvas logical size on the right object
      if (offscreen) {
        offscreen.width  = width;
        offscreen.height = height;
      } else {
        physCanvas.width  = width;
        physCanvas.height = height;
      }

      // Determine ball radius 'r' based on screen width for absolute responsiveness
      const screenWidth = window.innerWidth;
      let r = 45;
      if (screenWidth < 360) {
        r = 18; // Super small screens (e.g. iPhone SE / folding phones)
      } else if (screenWidth < 415) {
        r = 22; // Small mobile screens
      } else if (screenWidth < 500) {
        r = 26; // Large mobile screens
      } else if (screenWidth < 768) {
        r = 32; // Tablets
      } else if (screenWidth < 1024) {
        r = 38; // Laptops
      }

      // Mass scaling factor to ensure gravity/forces behave identically regardless of ball size
      const massFactor = (r / 45) * (r / 45);

      // Matter.js Engine setup (zero gravity fluid space)
      const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
      activeEngine = engine;
      const world = engine.world;

      const wallThickness = 60;
      const walls = [
        Matter.Bodies.rectangle(width / 2, -wallThickness / 2, 10000, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, 10000, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, 10000, { isStatic: true }),
        Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, 10000, { isStatic: true })
      ];
      Matter.Composite.add(world, walls);

      const bodies = [];
      let cursorBody = null;
      let simulationStarted = false;

      // Track mouse position manually for repulsion (works even without Matter.Mouse)
      let liveMouse = { x: -9999, y: -9999, active: false };
      let isMouseDown = false;

      // Shared render/physics cache (accessible by both setupForceEvents and render)
      let cachedCanvasRect = null;
      let hoverQueryTick   = 0;

      // Rare Event States
      let rareEventTimer    = 0;
      let rareEventActive   = false;
      let rareEventType     = '';
      let rareEventProgress = 0;

      physCanvas.addEventListener('mousemove', (e) => {
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        liveMouse.x = e.clientX - rect.left;
        liveMouse.y = e.clientY - rect.top;
        liveMouse.active = true;
      });
      physCanvas.addEventListener('mouseleave', () => {
        liveMouse.active = false;
        liveMouse.x = -9999;
        liveMouse.y = -9999;
        isMouseDown = false;
      });
      physCanvas.addEventListener('mousedown', () => {
        isMouseDown = true;
      });
      window.addEventListener('mouseup', () => {
        isMouseDown = false;
      });

      // Touch support — swipe repels (like hover), does not attract
      physCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isMouseDown = false;
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        liveMouse.x = touch.clientX - rect.left;
        liveMouse.y = touch.clientY - rect.top;
        liveMouse.active = true;
      }, { passive: false });
      physCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        isMouseDown = false;
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        liveMouse.x = touch.clientX - rect.left;
        liveMouse.y = touch.clientY - rect.top;
        liveMouse.active = true;
      }, { passive: false });
      physCanvas.addEventListener('touchend', () => {
        isMouseDown = false;
        liveMouse.active = false;
        liveMouse.x = -9999;
        liveMouse.y = -9999;
      });

      // Delayed initialization function triggered when Skills container is visible
      function startSimulation() {
        // Re-evaluate boundaries with actual rendered width/height
        width  = skillsContainer.clientWidth  || 800;
        height = skillsContainer.clientHeight || 700;
        if (offscreen) {
          offscreen.width  = width;
          offscreen.height = height;
        } else {
          physCanvas.width  = width;
          physCanvas.height = height;
        }

        Matter.Body.setPosition(walls[0], { x: width / 2, y: -wallThickness / 2 });
        Matter.Body.setPosition(walls[1], { x: width / 2, y: height + wallThickness / 2 });
        Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 });
        Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 });

        // Prime the cached canvas rect so the first anchor calculation is correct
        cachedCanvasRect = physCanvas.getBoundingClientRect();

        containerArr.forEach((container, groupIndex) => {
          const skills = parsedGroups[groupIndex];
          if (!skills) return;

          skills.forEach(skill => {
            // Spawn along a random canvas edge (0: Top, 1: Right, 2: Bottom, 3: Left)
            let x, y;
            const edge = Math.floor(Math.random() * 4);
            const margin = r + 15;

            if (edge === 0) {
              x = Math.random() * (width - 2 * margin) + margin;
              y = margin;
            } else if (edge === 1) {
              x = width - margin;
              y = Math.random() * (height - 2 * margin) + margin;
            } else if (edge === 2) {
              x = Math.random() * (width - 2 * margin) + margin;
              y = height - margin;
            } else {
              x = margin;
              y = Math.random() * (height - 2 * margin) + margin;
            }

            const body = Matter.Bodies.circle(x, y, r, {
              restitution: 0.45,
              friction: 0.05,
              frictionAir: 0.04,
              label: skill.name,
              collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
                group: 0
              },
              plugin: {
                skillData: skill,
                radius: r,
                groupIndex: groupIndex,       // Integer group ID for fast comparison
                cardElement: container,        // Keep DOM reference for live rect calculation
                // 3D properties
                zOffset: Math.random() * Math.PI * 2,
                zSpeed: 0.005 + Math.random() * 0.007,
                zVal: 0.0,
                angleOffset: Math.random() * Math.PI * 2
              }
            });
            bodies.push(body);
          });
        });

        Matter.Composite.add(world, bodies);

        // Create an invisible kinematic cursor body that acts as a physical obstacle
        cursorBody = Matter.Bodies.circle(-9999, -9999, r * 0.55, {
          isStatic: true,
          restitution: 0.6,
          friction: 0.0,
          label: 'cursorBody',
          collisionFilter: { group: 0, category: 0x0002, mask: 0xFFFF },
          render: { visible: false }
        });
        Matter.Composite.add(world, cursorBody);

        setupForceEvents();
      }

      function setupForceEvents() {
        // Collision Start event listener for squish impact and chain reactions
        Matter.Events.on(engine, 'collisionStart', (event) => {
          event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            if (bodyA && bodyB && bodyA.plugin && bodyB.plugin) {
              const dx = bodyB.position.x - bodyA.position.x;
              const dy = bodyB.position.y - bodyA.position.y;
              const relativeSpeed = Math.sqrt(
                (bodyB.velocity.x - bodyA.velocity.x) * (bodyB.velocity.x - bodyA.velocity.x) +
                (bodyB.velocity.y - bodyA.velocity.y) * (bodyB.velocity.y - bodyA.velocity.y)
              );
              
              if (relativeSpeed > 0.3) {
                const impactForce = Math.min(1.0, relativeSpeed * 0.15);
                const angle = Math.atan2(dy, dx);
                
                bodyA.plugin.wiggle = (bodyA.plugin.wiggle || 0) + impactForce;
                bodyA.plugin.collisionAngle = angle;
                
                bodyB.plugin.wiggle = (bodyB.plugin.wiggle || 0) + impactForce;
                bodyB.plugin.collisionAngle = angle + Math.PI;

                // Propagate chain reaction to group members
                propagateChainReaction(bodyA, impactForce * 0.65);
                propagateChainReaction(bodyB, impactForce * 0.65);
              }
            }
          });
        });

        function propagateChainReaction(sourceBody, energy) {
          if (energy < 0.04) return;
          bodies.forEach(other => {
            if (other !== sourceBody && other.plugin.groupIndex === sourceBody.plugin.groupIndex) {
              const dx = other.position.x - sourceBody.position.x;
              const dy = other.position.y - sourceBody.position.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const limit = sourceBody.plugin.radius * 4.5;
              if (dist < limit) {
                const ratio = dist / limit;
                const receivedEnergy = energy * Math.exp(-ratio * 2.2);
                if (receivedEnergy > 0.02) {
                  other.plugin.wiggle = (other.plugin.wiggle || 0) + receivedEnergy;
                  other.plugin.collisionAngle = Math.atan2(dy, dx);
                }
              }
            }
          });
        }



        // Setup beforeUpdate event handler
        Matter.Events.on(engine, 'beforeUpdate', () => {
          // ── Cursor body ───────────────────────────────────────────────────────
          if (cursorBody) {
            if (liveMouse.active) {
              Matter.Body.setPosition(cursorBody, { x: liveMouse.x, y: liveMouse.y });
            } else {
              Matter.Body.setPosition(cursorBody, { x: -9999, y: -9999 });
            }
          }

          // ── Anchor refresh (throttled – avoids layout thrash every step) ──────
          anchorCacheAge++;
          if (anchorCacheAge >= ANCHOR_TTL) {
            anchorCacheAge = 0;
            if (!cachedCanvasRect) cachedCanvasRect = physCanvas.getBoundingClientRect();
            containerArr.forEach((container, idx) => {
              const cardRect = container.getBoundingClientRect();
              cachedGroupAnchors[idx] = {
                x: (cardRect.left - cachedCanvasRect.left) + cardRect.width  / 2,
                y: (cardRect.top  - cachedCanvasRect.top)  + cardRect.height / 2
              };
            });
          }
          const groupAnchors = cachedGroupAnchors;

          // ── Group centroids (needed every step for cohesion) ──────────────────
          const groupCentroids = {};
          const groupCounts    = {};
          const bodyCount      = bodies.length;
          for (let bi = 0; bi < bodyCount; bi++) {
            const body = bodies[bi];
            const gIdx = body.plugin.groupIndex;
            if (!groupCentroids[gIdx]) {
              groupCentroids[gIdx] = { x: 0, y: 0 };
              groupCounts[gIdx]    = 0;
            }
            groupCentroids[gIdx].x += body.position.x;
            groupCentroids[gIdx].y += body.position.y;
            groupCounts[gIdx]++;
          }
          const centroidKeys = Object.keys(groupCentroids);
          for (let ki = 0; ki < centroidKeys.length; ki++) {
            const gIdx = centroidKeys[ki];
            const cnt  = groupCounts[gIdx];
            groupCentroids[gIdx].x /= cnt;
            groupCentroids[gIdx].y /= cnt;
          }

          // ── Hover query – throttled to every 3rd physics step ────────────────
          hoverQueryTick++;
          if (hoverQueryTick >= 3) {
            hoverQueryTick = 0;
            if (liveMouse.active) {
              const mousePoint = { x: liveMouse.x, y: liveMouse.y };
              const hit = Matter.Query.point(bodies, mousePoint);
              if (hit.length > 0) {
                physCanvas.classList.add('physics-hover');
              } else {
                physCanvas.classList.remove('physics-hover');
              }
            } else {
              physCanvas.classList.remove('physics-hover');
            }
          }

          // 1. Per-body forces
          bodies.forEach((body, idx) => {
            const gIdx = body.plugin.groupIndex;
            const anchor = groupAnchors[gIdx];
            if (!anchor) return;

            const depthMultiplier = 1.0 + 0.3 * (body.plugin.zVal || 0);

            // Elastic Cluster Blob Force:
            // Find group centroid
            const centroid = groupCentroids[gIdx];
            if (centroid) {
              // Centroid pulls to anchor
              const adx = anchor.x - centroid.x;
              const ady = anchor.y - centroid.y;
              const adist = Math.sqrt(adx*adx + ady*ady);
              
              if (adist > 2) {
                const basePull = 0.0011;
                const distPull = 0.000045 * adist;
                const groupPullForce = (basePull + distPull) * massFactor * depthMultiplier;
                
                // Distribute centroid steering force to all members
                Matter.Body.applyForce(body, body.position, {
                  x: (adx / adist) * groupPullForce,
                  y: (ady / adist) * groupPullForce * 1.2
                });
              }

              // Body pulls to its group centroid (Cohesion Blob)
              const cdx = centroid.x - body.position.x;
              const cdy = centroid.y - body.position.y;
              const cdist = Math.sqrt(cdx*cdx + cdy*cdy);
              if (cdist > 2) {
                const cohesionForce = 0.00065 * massFactor * depthMultiplier;
                Matter.Body.applyForce(body, body.position, {
                  x: (cdx / cdist) * cohesionForce,
                  y: (cdy / cdist) * cohesionForce
                });
              }
            }

            // Organic antigravity floating drift
            const time = frameCount * 0.008;
            const driftPhase = body.plugin.zOffset;
            const groupPhase = gIdx * 1.7;
            const driftX = Math.sin(time * 0.7 + driftPhase + groupPhase) * 0.00004 * massFactor * depthMultiplier;
            const driftY = Math.cos(time * 0.5 + driftPhase * 1.3 + groupPhase) * 0.00005 * massFactor * depthMultiplier;
            Matter.Body.applyForce(body, body.position, { x: driftX, y: driftY });

            // Smooth depth-aware damping
            const damping = 0.94 + 0.025 * ((body.plugin.zVal || 0) + 1.0) / 2.0;
            Matter.Body.setVelocity(body, {
              x: body.velocity.x * damping,
              y: body.velocity.y * damping
            });

            // Rare Events: Orbit Storm
            if (rareEventActive && rareEventType === 'orbit' && centroid) {
              const odx = body.position.x - centroid.x;
              const ody = body.position.y - centroid.y;
              const odist = Math.sqrt(odx*odx + ody*ody);
              if (odist > 5) {
                const tx = -ody / odist;
                const ty = odx / odist;
                const orbitForce = 0.00045 * massFactor * depthMultiplier;
                Matter.Body.applyForce(body, body.position, {
                  x: tx * orbitForce,
                  y: ty * orbitForce
                });
              }
            }

            // Rare Events: Radial Shuffle (Outward blast at start of event)
            if (rareEventActive && rareEventType === 'shuffle' && rareEventProgress < 40 && centroid) {
              const odx = body.position.x - centroid.x;
              const ody = body.position.y - centroid.y;
              const odist = Math.sqrt(odx*odx + ody*ody);
              if (odist > 2) {
                const blastSpeed = 0.06 * massFactor * depthMultiplier;
                Matter.Body.setVelocity(body, {
                  x: body.velocity.x + (odx / odist) * blastSpeed,
                  y: body.velocity.y + (ody / odist) * blastSpeed
                });
              }
            }

            // Magnetic Hover Attraction/Repulsion Equilibrium
            if (liveMouse.active) {
              const mdx = body.position.x - liveMouse.x;
              const mdy = body.position.y - liveMouse.y;
              const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

              if (isMouseDown) {
                // Attraction Force
                const pullRadius = r * 7.0;
                if (mDist < pullRadius && mDist > 3) {
                  const pullStrength = (pullRadius - mDist) / pullRadius;
                  const pullForce = Math.pow(pullStrength, 1.5) * 0.0022 * massFactor * depthMultiplier;
                  Matter.Body.applyForce(body, body.position, {
                    x: -(mdx / mDist) * pullForce * body.mass,
                    y: -(mdy / mDist) * pullForce * body.mass
                  });
                }
              } else {
                // Magnetic equilibrium ring force
                const equilibriumDistance = r * 2.2;
                const activeRadius = r * 5.5;
                
                if (mDist < activeRadius && mDist > 2) {
                  const distDelta = mDist - equilibriumDistance;
                  let force = 0;
                  if (distDelta < 0) {
                    // Inside equilibrium: strong repulsion
                    const t = -distDelta / equilibriumDistance;
                    force = t * 0.0016 * massFactor * depthMultiplier;
                  } else {
                    // Outside equilibrium: gentle attraction
                    const t = distDelta / (activeRadius - equilibriumDistance);
                    force = -t * 0.00065 * massFactor * depthMultiplier;
                  }
                  Matter.Body.applyForce(body, body.position, {
                    x: (mdx / mDist) * force,
                    y: (mdy / mDist) * force
                  });
                }
              }
            }
          });

          // 2. Inter-body cohesion – O(n²) throttled to every 2nd physics step
          cohesionFrameSkip = (cohesionFrameSkip + 1) % 2;
          if (cohesionFrameSkip === 0) {
            for (let i = 0; i < bodyCount; i++) {
              const bodyA = bodies[i];
              const gIdxA = bodyA.plugin.groupIndex;
              const breathingScale = 1.0 + 0.15 * Math.sin(frameCount * 0.015 + gIdxA * 1.5);
              const posAx = bodyA.position.x;
              const posAy = bodyA.position.y;

              for (let j = i + 1; j < bodyCount; j++) {
                const bodyB = bodies[j];
                if (bodyA.plugin.groupIndex !== bodyB.plugin.groupIndex) continue;

                const mdx  = bodyB.position.x - posAx;
                const mdy  = bodyB.position.y - posAy;
                const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (dist < 3) continue;

                const cohesionForce = (0.00032 + 0.0000075 * dist) * massFactor * breathingScale;
                const invDist = 1 / dist;
                const fx = mdx * invDist * cohesionForce;
                const fy = mdy * invDist * cohesionForce;

                Matter.Body.applyForce(bodyA, bodyA.position, { x:  fx, y:  fy });
                Matter.Body.applyForce(bodyB, bodyB.position, { x: -fx, y: -fy });
              }
            }
          }
        });
      }

      // Animation render loop – fixed physics timestep accumulator
      let isTimeoutActive = false;
      let frameCount      = 0;
      let lastTime        = performance.now();
      // Reusable sort array – avoid per-frame allocation
      const sortedBodiesArr = [];

      function render() {
        isTimeoutActive = false;
        if (physCanvas.offsetParent === null || !isCanvasVisible) {
          isTimeoutActive = true;
          animId = setTimeout(render, 250);
          return;
        }

        const now = performance.now();
        let delta = now - lastTime;
        lastTime  = now;
        // Clamp to avoid spiral of death after tab sleep
        if (delta > 100) delta = FIXED_STEP;

        // Refresh canvas rect once per render frame (not per physics step)
        cachedCanvasRect = physCanvas.getBoundingClientRect();

        if (!simulationStarted) {
          startSimulation();
          simulationStarted = true;
        }



        // Update Rare Event states
        rareEventTimer += delta;
        if (rareEventTimer > 25000) {
          rareEventTimer = 0;
          rareEventActive = true;
          rareEventType = Math.random() > 0.5 ? 'orbit' : 'shuffle';
          rareEventProgress = 0;
        }

        if (rareEventActive) {
          rareEventProgress += delta;
          if (rareEventProgress > 6000) {
            rareEventActive = false;
            rareEventType = '';
          }
        }

        frameCount++;
        ctx.clearRect(0, 0, width, height);

        // Update 3D oscillation values & decay wiggle
        bodies.forEach(body => {
          // Decay wiggle
          if (body.plugin.wiggle > 0.01) {
            body.plugin.wiggle *= 0.88;
          } else {
            body.plugin.wiggle = 0;
          }

          // Hover Lift Elevation
          let isHovered = false;
          if (liveMouse.active) {
            const mdx = body.position.x - liveMouse.x;
            const mdy = body.position.y - liveMouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < body.plugin.radius * 1.1) {
              isHovered = true;
            }
          }
          body.plugin.isHovered = isHovered;

          const baseZ = Math.sin(frameCount * body.plugin.zSpeed + body.plugin.zOffset);
          const targetZ = isHovered ? 1.4 : baseZ;
          body.plugin.zVal = body.plugin.zVal || 0;
          body.plugin.zVal += (targetZ - body.plugin.zVal) * 0.08;

          if (!body.plugin.orientation) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            body.plugin.orientation = {
              x: Math.sin(phi) * Math.cos(theta),
              y: Math.sin(phi) * Math.sin(theta),
              z: Math.cos(phi)
            };
          }

          const autoYaw = 0.003 + (body.plugin.zSpeed || 0.005) * 0.5;
          const autoPitch = 0.002 + (body.plugin.zSpeed || 0.005) * 0.3;
          const autoRoll = 0.001 + (body.plugin.zSpeed || 0.005) * 0.2;

          const vx = Math.max(-15, Math.min(15, body.velocity.x));
          const vy = Math.max(-15, Math.min(15, body.velocity.y));
          const dYaw = vx * 0.025 + autoYaw;
          const dPitch = -vy * 0.025 + autoPitch;
          const dRoll = body.angularVelocity + autoRoll;

          const o = body.plugin.orientation;
          const cosY = Math.cos(dYaw);
          const sinY = Math.sin(dYaw);
          const x1 = o.x * cosY + o.z * sinY;
          const z1 = -o.x * sinY + o.z * cosY;
          const y1 = o.y;

          const cosX = Math.cos(dPitch);
          const sinX = Math.sin(dPitch);
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;
          const x2 = x1;

          const cosZ = Math.cos(dRoll);
          const sinZ = Math.sin(dRoll);
          const x3 = x2 * cosZ - y2 * sinZ;
          const y3 = x2 * sinZ + y2 * cosZ;
          const z3 = z2;

          const len = Math.sqrt(x3 * x3 + y3 * y3 + z3 * z3);
          if (len === 0) {
            body.plugin.orientation = { x: 0, y: 0, z: 1 };
          } else {
            body.plugin.orientation = { x: x3 / len, y: y3 / len, z: z3 / len };
          }
        });

        // Painters algorithm sort – reuse pre-allocated array
        sortedBodiesArr.length = 0;
        for (let si = 0; si < bodies.length; si++) sortedBodiesArr.push(bodies[si]);
        sortedBodiesArr.sort((a, b) => a.plugin.zVal - b.plugin.zVal);
        const sortedBodies = sortedBodiesArr;

        // Draw glossy 3D spheres
        sortedBodies.forEach(body => {
          const z = body.plugin.zVal;
          const bodyRadius = body.plugin.radius;
          const skill = body.plugin.skillData;

          const scale = 1.0 + 0.12 * z;
          const visualRadius = bodyRadius * scale;
          const centerX = width / 2;
          const centerY = height / 2;

          let rx = centerX + (body.position.x - centerX) * scale;
          let ry = centerY + (body.position.y - centerY) * scale;

          rx = Math.max(visualRadius + 2, Math.min(width - visualRadius - 2, rx));
          ry = Math.max(visualRadius + 2, Math.min(height - visualRadius - 2, ry));

          ctx.save();

          const isLight = document.documentElement.getAttribute('data-theme') === 'light';

          // Apply squish/rotation deformation at the translated origin of the sphere
          let squishAmt = 0;
          if (body.plugin.wiggle > 0.01) {
            squishAmt = body.plugin.wiggle * 0.18 * Math.sin(frameCount * 0.85);
            squishAmt = Math.max(-0.35, Math.min(0.35, squishAmt));
          }

          ctx.translate(rx, ry);
          if (body.plugin.wiggle > 0.01 && body.plugin.collisionAngle !== undefined) {
            ctx.rotate(body.plugin.collisionAngle);
          }
          ctx.scale(1.0 - squishAmt, 1.0 + squishAmt);

          // Optimized vector shadow (100x faster than shadowBlur Gaussian filter)
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 6 * scale, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          // Body background
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          const drawFace = (nx, ny, nz) => {
            if (nz <= 0) return;

            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
            ctx.clip();

            const displacementFactor = 0.82;
            const lx = nx * visualRadius * displacementFactor;
            const ly = ny * visualRadius * displacementFactor;

            ctx.translate(lx, ly);

            const radialAngle = Math.atan2(ny, nx);
            ctx.rotate(radialAngle);
            ctx.scale(nz, 1.0);

            const baseAngle = body.angle + body.plugin.angleOffset;
            ctx.rotate(-radialAngle + baseAngle);

            // Proportional sizes/offsets relative to visualRadius
            if (loadedImages[skill.name]) {
              const imgSize = visualRadius * 0.82;
              const imgOffset = -visualRadius * 0.11;
              ctx.drawImage(loadedImages[skill.name], -imgSize / 2, -imgSize / 2 + imgOffset, imgSize, imgSize);
            } else {
              const iconInfo = iconMap[skill.iconClass];
              if (iconInfo) {
                const iconSize = visualRadius * 0.40;
                const iconOffset = -visualRadius * 0.22;
                ctx.font = `900 ${iconSize}px ${iconInfo.family}`;
                ctx.fillStyle = '#1e1e24';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(iconInfo.char, 0, iconOffset);
              }
            }

            // Draw text label proportionally scaled
            const fontSize = Math.max(7.5, visualRadius * 0.20);
            const textOffset = visualRadius * 0.33;
            ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = '#1e1e24';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill.name, 0, textOffset);

            // Shading overlay matching curvature
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * (1 - nz)})`;
            const overlaySize = visualRadius * 1.5;
            ctx.fillRect(-overlaySize / 2, -overlaySize / 2, overlaySize, overlaySize);
            ctx.restore();

            ctx.restore();
          };

          const o = body.plugin.orientation;
          drawFace(-o.x, -o.y, -o.z);
          drawFace(o.x, o.y, o.z);

          // 3D glossy light gradient overlay
          const grad = ctx.createRadialGradient(
            -visualRadius * 0.35, -visualRadius * 0.35, visualRadius * 0.05,
            0, 0, visualRadius
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
          grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.0)');
          grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.0)');
          grad.addColorStop(0.9, 'rgba(0, 0, 0, 0.25)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        // Fixed-timestep physics integration
        physicsAccum += delta;
        let physSteps = 0;
        while (physicsAccum >= FIXED_STEP && physSteps < 3) {
          Matter.Engine.update(engine, FIXED_STEP);
          physicsAccum -= FIXED_STEP;
          physSteps++;
        }
        // Carry excess (don't reset to 0 to preserve sub-step accuracy)
        animId = requestAnimationFrame(render);
      }

      render();

      wakeUpActiveSimulation = () => {
        if (isTimeoutActive) {
          clearTimeout(animId);
          render();
        }
      };
    }

    createSimulation();

    // Debounced resize recreate simulation to fit updated client layout perfectly
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createSimulation();
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    // Tab change instant wake up
    window.addEventListener('skills-tab-change', () => {
      if (wakeUpActiveSimulation) {
        wakeUpActiveSimulation();
      }
    });

    // Intersection Observer to pause/resume simulation when off-screen
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isCanvasVisible = entry.isIntersecting;
          if (isCanvasVisible && wakeUpActiveSimulation) {
            wakeUpActiveSimulation();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(skillsContainer);
    }
  };

  initSkillsPhysics();

  // ---- 14. 3D Card Tilt Hover Effect ----
  function initTiltEffect() {
    // General tilt cards (service items, project items, skills list, sidebar)
    const tiltCards = document.querySelectorAll('.service-item, .project-item, .sidebar');
    tiltCards.forEach(card => {
      card.style.transition = 'transform 0.18s ease-out, box-shadow 0.18s ease-out, border-color 0.18s ease-out';
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = x / rect.width - 0.5;
        const yc = y / rect.height - 0.5;
        const maxTilt = 6;
        const tiltX = -yc * maxTilt;
        const tiltY = xc * maxTilt;
        const isSidebar = card.classList.contains('sidebar');
        const lift = isSidebar ? 0 : -6;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${lift}px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });

    // Contact form tilt: applied to the <form> element only,
    // and only when the form is NOT fully valid (btn-ready not active)
    const contactForm = document.querySelector('form[data-form]');
    const contactSubmitBtn = document.querySelector('[data-form-btn]');
    if (contactForm) {
      contactForm.style.transition = 'transform 0.18s ease-out, box-shadow 0.18s ease-out, border-color 0.18s ease-out';
      contactForm.style.transformStyle = 'preserve-3d';
      contactForm.style.borderRadius = '14px'; // keep visual consistency
      contactForm.addEventListener('mousemove', (e) => {
        // Skip tilt when form is valid and ready to send
        if (contactSubmitBtn && contactSubmitBtn.classList.contains('btn-ready')) return;
        const rect = contactForm.getBoundingClientRect();
        const xc = (e.clientX - rect.left) / rect.width - 0.5;
        const yc = (e.clientY - rect.top) / rect.height - 0.5;
        const maxTilt = 5;
        const tiltX = -yc * maxTilt;
        const tiltY = xc * maxTilt;
        contactForm.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      contactForm.addEventListener('mouseleave', () => {
        contactForm.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    }
  }
  initTiltEffect();


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

  window.addEventListener('resize', updateUnderline);

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

  // ---- 10. Details Know More Typing Animation ----
  const details = document.querySelector('.about-text details');
  if (details) {
    const paragraphs = Array.from(details.querySelectorAll('p'));
    
    // Store original HTML and clear paragraphs on load
    paragraphs.forEach(p => {
      p.dataset.originalHtml = decodeHtml(p.innerHTML);
      p.innerHTML = '';
    });

    let typingSeqId = 0;

    function typeHtml(element, htmlString, speed, callback) {
      let i = 0;
      element.innerHTML = "";
      const currentSeq = typingSeqId;
      
      function step() {
        if (typingSeqId !== currentSeq) return; // cancel if sequence changed
        
        if (i < htmlString.length) {
          if (htmlString[i] === '<') {
            let closingIndex = htmlString.indexOf('>', i);
            if (closingIndex !== -1) {
              element.innerHTML += htmlString.substring(i, closingIndex + 1);
              i = closingIndex + 1;
            } else {
              element.innerHTML += htmlString[i];
              i++;
            }
          } else {
            element.innerHTML += htmlString[i];
            i++;
          }
          setTimeout(step, speed);
        } else if (callback) {
          callback();
        }
      }
      step();
    }

    details.addEventListener('toggle', () => {
      // Increment sequence ID to stop any running typing instances
      typingSeqId++;
      
      if (details.open) {
        // Clear all paragraphs first
        paragraphs.forEach(p => {
          p.innerHTML = '';
          p.classList.remove('typing');
        });

        // Type paragraphs sequentially
        const typeSequence = (index) => {
          if (index < paragraphs.length) {
            const p = paragraphs[index];
            p.classList.add('typing');
            typeHtml(p, p.dataset.originalHtml, 15, () => {
              p.classList.remove('typing');
              typeSequence(index + 1);
            });
          }
        };
        typeSequence(0);
      } else {
        // If closed, clear everything so it starts fresh next time
        paragraphs.forEach(p => {
          p.innerHTML = '';
          p.classList.remove('typing');
        });
      }
    });
  }

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

  // ---- 19. Project Modal Logic ----
  const projectModalContainer = document.getElementById('projectModalContainer');
  const projectModal = document.getElementById('projectModal');
  const projectModalCloseBtn = document.getElementById('projectModalCloseBtn');
  const projectModalOverlay = document.getElementById('projectModalOverlay');
  
  const projectModalImg = document.getElementById('projectModalImg');
  const projectModalTitle = document.getElementById('projectModalTitle');
  const projectModalCategory = document.getElementById('projectModalCategory');
  const projectModalDesc = document.getElementById('projectModalDesc');
  const projectModalTechTags = document.getElementById('projectModalTechTags');
  const projectModalRepoBtn = document.getElementById('projectModalRepoBtn');
  const projectModalLiveBtn = document.getElementById('projectModalLiveBtn');

  function openProjectModal(title, category, imgUrl, imgAlt, description, techStack, repoUrl, liveUrl) {
    if (!projectModalContainer) return;

    // Inject text and assets
    projectModalImg.src = imgUrl;
    projectModalImg.alt = imgAlt;
    projectModalTitle.textContent = title;
    projectModalCategory.textContent = category;
    projectModalDesc.textContent = description;

    // Generate tech tags
    projectModalTechTags.innerHTML = '';
    const tags = techStack.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tag;
      projectModalTechTags.appendChild(span);
    });

    // Set repository link
    if (repoUrl && repoUrl !== '#' && repoUrl !== '') {
      projectModalRepoBtn.href = repoUrl;
      projectModalRepoBtn.classList.remove('no-repo');
    } else {
      projectModalRepoBtn.href = '#';
      projectModalRepoBtn.classList.add('no-repo');
    }

    // Set live link & active state based on project category (web development), explicit live URL, or specific web-hybrid project (Garbage Detector)
    const isLiveEnabledCategory = category.toLowerCase() === 'web development' || 
                                  (liveUrl && liveUrl !== '#' && liveUrl !== '') ||
                                  title.toLowerCase() === 'garbage detector';
    
    if (isLiveEnabledCategory) {
      projectModalLiveBtn.classList.remove('disabled');
      projectModalLiveBtn.removeAttribute('tabindex');
      if (liveUrl && liveUrl !== '#' && liveUrl !== '') {
        projectModalLiveBtn.href = liveUrl;
        projectModalLiveBtn.classList.remove('no-live');
      } else {
        projectModalLiveBtn.href = '#';
        projectModalLiveBtn.classList.add('no-live');
      }
    } else {
      projectModalLiveBtn.href = '#';
      projectModalLiveBtn.classList.add('disabled');
      projectModalLiveBtn.classList.remove('no-live');
      projectModalLiveBtn.setAttribute('tabindex', '-1');
    }

    // Open modal by adding active class
    projectModalContainer.classList.add('active');
    document.body.classList.add('sidebar-overlaying'); // Reuses body scroll lock if any
  }

  function closeProjectModal() {
    if (!projectModalContainer) return;
    projectModalContainer.classList.remove('active');
    document.body.classList.remove('sidebar-overlaying');
  }

  // Intercept click on project items
  const projectList = document.querySelector('.project-list');
  if (projectList) {
    projectList.addEventListener('click', function(e) {
      const anchor = e.target.closest('.project-item a');
      if (!anchor) return;
      
      e.preventDefault();
      
      const projectItem = anchor.closest('.project-item');
      if (!projectItem) return;

      const title = projectItem.querySelector('.project-title').textContent.trim();
      const category = projectItem.querySelector('.project-category').textContent.trim();
      const img = projectItem.querySelector('img');
      const imgUrl = img ? img.src : '';
      const imgAlt = img ? img.alt : '';

      const description = projectItem.getAttribute('data-description') || 'No description available for this project.';
      const techStack = projectItem.getAttribute('data-tech') || '';
      const repoUrl = projectItem.getAttribute('data-repo') || '';
      const liveUrl = projectItem.getAttribute('data-live') || '';

      openProjectModal(title, category, imgUrl, imgAlt, description, techStack, repoUrl, liveUrl);
    });
  }

  // Close triggers
  if (projectModalCloseBtn) {
    projectModalCloseBtn.addEventListener('click', closeProjectModal);
  }
  if (projectModalOverlay) {
    projectModalOverlay.addEventListener('click', closeProjectModal);
  }

  // Handle Source Code button click when no repository is available
  if (projectModalRepoBtn) {
    projectModalRepoBtn.addEventListener('click', function(e) {
      if (this.getAttribute('href') === '#' || this.classList.contains('no-repo')) {
        e.preventDefault();
        showToast('Project repository coming soon!', 'error');
      }
    });
  }

  // Handle Live Demo button click when no live demo is available
  if (projectModalLiveBtn) {
    projectModalLiveBtn.addEventListener('click', function(e) {
      if (this.getAttribute('href') === '#' || this.classList.contains('no-live')) {
        e.preventDefault();
        showToast('Project live demo coming soon!', 'error');
      }
    });
  }

  // Escape key close support
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && projectModalContainer && projectModalContainer.classList.contains('active')) {
      closeProjectModal();
    }
  });
});
