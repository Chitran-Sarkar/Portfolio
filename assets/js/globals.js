/**
 * ============================================================
 *  globals.js — Shared Utilities & Global State
 * ============================================================
 *  Loaded WITHOUT defer so all utilities are synchronously
 *  available before any deferred module runs.
 *  NEVER wraps code in DOMContentLoaded — runs immediately.
 *
 *  Exposes on window (accessible by every module):
 *    • elementToggleFunc(elem)     – Toggle .active class
 *    • showToast(msg, type)        – Slide-in notification toast
 *    • progressIntervals           – Map of bar-id → intervalId
 *    • applyBreatheAnimation()     – Entry/exit tab animations
 *    • updateUnderline()           – Slide navbar underline pill
 *    • underline / navbar          – DOM refs used by navbar.js
 *    • decodeHtml(html)            – HTML entity decoder
 *    • preloadedFrames[]           – Scrolly canvas frame images
 *    • totalFrames                 – Total frame count (60)
 *    • deviconMap                  – Tech name → SVG URL map
 *    • loadedImages                – Pre-decoded devicon Images
 * ============================================================
 */

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