/**
 * ============================================================
 *  script.js — Entry Point
 * ============================================================
 *  After the modular split this file is intentionally minimal.
 *  Its only job is to initialise Typed.js once all libraries
 *  and modules have loaded.
 *
 *  Load order (defined in index.html):
 *    1. globals.js          – Utilities (no defer)
 *    2. modules/*.js        – Feature modules (defer)
 *    3. script.js (this)    – Final init (defer)
 *
 *  To add new global initialisation code, put it in the
 *  appropriate module file, not here.
 * ============================================================
 */

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