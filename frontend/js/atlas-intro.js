/**
 * atlas-intro.js - Contextual First-Time User Map Introduction Component (<AtlasMapIntro />)
 * Shows a contextual intro popup for the Project Coverage Map up to TWO times per user/browser.
 */
(function(window) {
  'use strict';

  const STORAGE_KEY = 'atlasMapIntroShown';
  const MAX_DISPLAY_COUNT = 2;
  const DELAY_AFTER_VISIBLE_MS = 1000;
  const AUTO_CLOSE_MS = 5000;

  function getShownCount() {
    try {
      if (typeof localStorage === 'undefined') return 0;
      const val = localStorage.getItem(STORAGE_KEY);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch (e) {
      console.warn('[AtlasMapIntro] localStorage access disabled or failed:', e);
      return 0; // Fail gracefully
    }
  }

  function incrementShownCount(currentCount) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(currentCount + 1));
      }
    } catch (e) {
      console.warn('[AtlasMapIntro] localStorage write failed:', e);
    }
  }

  function init() {
    const count = getShownCount();
    if (count >= MAX_DISPLAY_COUNT) {
      return; // Do NOT show if user has seen it 2 times already
    }

    const popup = document.getElementById('atlasIntroPopup');
    const backdrop = document.getElementById('atlasIntroBackdrop');
    const closeBtn = document.getElementById('atlasIntroCloseBtn');
    const gotItBtn = document.getElementById('atlasIntroGotItBtn');
    const mapCard = document.querySelector('.map-card');

    if (!popup || !backdrop || !mapCard) return;

    let autoCloseTimer = null;
    let isClosed = false;

    function closePopup() {
      if (isClosed) return;
      isClosed = true;

      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }

      popup.classList.remove('show');
      popup.classList.add('hiding');
      backdrop.classList.remove('show');

      setTimeout(() => {
        popup.setAttribute('aria-hidden', 'true');
        backdrop.setAttribute('aria-hidden', 'true');
        popup.style.display = 'none';
        backdrop.style.display = 'none';
      }, 350);
    }

    // Wait ~1000ms after page/map is ready
    setTimeout(() => {
      if (isClosed) return;

      // Increment count on display
      incrementShownCount(count);

      popup.style.display = 'block';
      backdrop.style.display = 'block';
      popup.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');

      // Trigger CSS transition
      requestAnimationFrame(() => {
        popup.classList.add('show');
        backdrop.classList.add('show');
      });

      // Auto close after 5 seconds
      autoCloseTimer = setTimeout(() => {
        closePopup();
      }, AUTO_CLOSE_MS);

    }, DELAY_AFTER_VISIBLE_MS);

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (gotItBtn) gotItBtn.addEventListener('click', closePopup);
    backdrop.addEventListener('click', closePopup);

    // Clicking map or anywhere outside closes popup
    mapCard.addEventListener('click', (e) => {
      if (!popup.contains(e.target)) {
        closePopup();
      }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !isClosed) {
        closePopup();
      }
    });
  }

  // Expose component to global window
  window.AtlasMapIntro = {
    init: init,
    getShownCount: getShownCount,
    resetCountForTesting: function() {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    }
  };
})(window);
