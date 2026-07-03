/**
 * ============================================================
 *  modules/project-modal.js — Project Detail Modal
 * ============================================================
 *  Intercepts clicks on project cards in the portfolio reel
 *  and opens a full-screen modal with the project's details:
 *  title, category, image, description, tech stack, and
 *  repo / live demo links.
 *
 *  Open triggers:
 *    • Click on any .project-item a link
 *    • Reads data-* attributes on the .project-item element
 *
 *  Close triggers:
 *    • Close button (#projectModalCloseBtn)
 *    • Overlay click (#projectModalOverlay)
 *    • Escape key
 *
 *  Toast messages:
 *    • Repo unavailable  – 'Project repository coming soon!'
 *    • Live unavailable  – 'Project live demo coming soon!'
 *
 *  Depends on: globals.js (showToast)
 * ============================================================
 */

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