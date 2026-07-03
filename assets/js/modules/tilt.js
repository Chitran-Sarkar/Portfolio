/**
 * ============================================================
 *  modules/tilt.js — 3D Card Tilt Hover Effect
 * ============================================================
 *  Applies a CSS perspective tilt on mousemove to service
 *  cards, project cards, the sidebar, and the contact form.
 *  On mouseleave the tilt resets smoothly.
 *
 *  Selectors affected:
 *    • .service-item   – About tab service cards
 *    • .project-item   – Portfolio project cards
 *    • .sidebar        – Main profile sidebar panel
 *    • .contact-form   – Contact page form wrapper
 *
 *  Depends on: none
 * ============================================================
 */

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