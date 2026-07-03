 // Initialize video assets dynamically based on screen resolution (Shifted from inline HTML script blocks)
  (function() {
    const w = window.innerWidth;
    let f = 'desktop';
    if (w < 768) {
      f = 'mobile';
    } else if (w >= 1400) {
      f = 'raw';
    }

    const preloaderVideo = document.getElementById('preloader-bg-video');
    if (preloaderVideo) {
      preloaderVideo.src = './assets/preloader/' + f + '/preloader.webm';
      preloaderVideo.load();
    }

    const bgVideoDark = document.getElementById('bg-video-dark');
    const bgVideoLight = document.getElementById('bg-video-light');
    if (bgVideoDark) {
      bgVideoDark.src = './assets/background/' + f + '/background.webm';
      bgVideoDark.load();
    }
    if (bgVideoLight) {
      bgVideoLight.src = './assets/background/' + f + '/background_light.webm';
      bgVideoLight.load();
    }
  })();
