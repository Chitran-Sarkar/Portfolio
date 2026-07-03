'use strict';

// ─── Entry point ─────────────────────────────────────────────────────────────
// All logic has been split into:
//   globals.js          – shared utilities (elementToggleFunc, showToast, etc.)
//   modules/            – one file per feature
//
// This file only initialises Typed.js, which must run after the DOM is ready
// and after Typed.js library has loaded.
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Initialize Typed.js
  if (typeof Typed !== 'undefined' && document.getElementById('element')) {
    new Typed('#element', {
      strings: [
        'ML Engineer.',
        'App Developer.',
        'Graphic Designer.',
        'Web Designer.',
        'Web Developer.',
        'IOT Developer.',
        'Photographer.',
        'Artist.'
      ],
      typeSpeed: 50,
      loop: true
    });
  }

});
