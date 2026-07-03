
  let subFilterModeActive = false;

  // Shared Devicon mapping and preload store for skill bubbles
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
  const loadedImages = {};

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

// ---- 1. Preloader (progress based on assets + scrolly frames) ----
const preloader = document.getElementById('preloader');
const totalFrames = 60;
const preloadedFrames = [];

function getFrameUrl(index) {
  const frameStr = String(index).padStart(2, '0');
  let folder = 'desktop';
  if (window.innerWidth < 768) {
    folder = 'mobile';
  } else if (window.innerWidth >= 1400) {
    folder = 'raw';
  }
  return `./assets/Sequence/${folder}/frame_${frameStr}_delay-0.066s.webp`;
}

if (preloader) {
  const progressBar = preloader.querySelector('.loader-progress');
  const percentText = preloader.querySelector('.loader-percent');
  const statusText = preloader.querySelector('.loader-label');
  const docImages = Array.from(document.images);
  
  const mapContainer = document.getElementById('map');
  const deviconCount = Object.keys(deviconMap).length;
  
  const videosToLoad = [
    document.getElementById('preloader-bg-video'),
    document.getElementById('bg-video-dark'),
    document.getElementById('bg-video-light')
  ].filter(Boolean);

  // Total assets to load
  const total = docImages.length + totalFrames + (mapContainer ? 1 : 0) + deviconCount + videosToLoad.length + 1;
  let loaded = 0;

  function updateProgress(assetName = '') {
    const percent = total ? Math.round((loaded / total) * 100) : 100;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;
    
    if (statusText && assetName) {
      statusText.textContent = `Loading ${assetName}...`;
    }

    if (percent >= 100) {
      preloader.classList.add('finished');
      document.body.classList.remove('preloader-active');
      if (window.initializeScrollyCanvas) {
        window.initializeScrollyCanvas();
      }
      setTimeout(updateUnderline, 300);
      // Clean up preloader video to stop decoding and save CPU resources
      setTimeout(() => {
        const video = preloader.querySelector('#preloader-bg-video');
        if (video) {
          video.pause();
          video.src = "";
          video.load();
          video.remove();
        }
      }, 600);
    }
  }

  if (total === 0) {
    loaded = total;
    updateProgress();
  } else {
    // 1. Load document images (eagerly loaded)
    docImages.forEach(img => {
      if (img.complete) {
        loaded++;
        updateProgress('images');
      } else {
        img.addEventListener('load', () => { loaded++; updateProgress('images'); });
        img.addEventListener('error', () => { loaded++; updateProgress('images'); });
      }
    });

    // 2. Load Leaflet Map
    if (mapContainer) {
      initializeLeafletMap().then(() => {
        loaded++;
        updateProgress('interactive map');
      });
    }

    // 3. Preload scrolly canvas frames
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => {
              loaded++;
              updateProgress('3D sequence');
            })
            .catch(() => {
              loaded++;
              updateProgress('3D sequence');
            });
        } else {
          loaded++;
          updateProgress('3D sequence');
        }
      };
      img.onerror = () => {
        loaded++;
        updateProgress('3D sequence');
      };
      preloadedFrames.push(img);
    }

    // 4. Preload Devicon SVGs
    Object.keys(deviconMap).forEach(key => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = deviconMap[key];
      img.onload = () => {
        loadedImages[key] = img;
        loaded++;
        updateProgress('tech icons');
      };
      img.onerror = () => {
        loaded++;
        updateProgress('tech icons');
      };
    });

    // 5. Preload background/preloader videos
    videosToLoad.forEach(video => {
      if (video.readyState >= 3) {
        loaded++;
        updateProgress('media streams');
      } else {
        let hasLoaded = false;
        const onVideoLoad = () => {
          if (!hasLoaded) {
            hasLoaded = true;
            loaded++;
            updateProgress('media streams');
            video.removeEventListener('canplay', onVideoLoad);
            video.removeEventListener('loadeddata', onVideoLoad);
          }
        };
        video.addEventListener('canplay', onVideoLoad);
        video.addEventListener('loadeddata', onVideoLoad);
        
        // Touch/mobile devices fallback in 1.5s to bypass mobile prefetch block
        const touchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        const videoTimeout = touchDevice ? 1500 : 4500;
        setTimeout(onVideoLoad, videoTimeout);
      }
    });

    // 6. Preload Web Fonts
    let fontsPromiseResolved = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!fontsPromiseResolved) {
          fontsPromiseResolved = true;
          loaded++;
          updateProgress('typography');
        }
      }).catch(() => {
        if (!fontsPromiseResolved) {
          fontsPromiseResolved = true;
          loaded++;
          updateProgress('typography');
        }
      });
    } else {
      loaded++;
      updateProgress('typography');
    }

    updateProgress();

    // Fallback: after 15 seconds force completion if still not done
    setTimeout(() => {
      if (loaded < total) {
        loaded = total;
        updateProgress('assets');
      }
    }, 15000);
  }
}
