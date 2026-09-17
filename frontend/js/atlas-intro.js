/**
 * atlas-intro.js - Contextual Map Introduction Component (<AtlasMapIntro />)
 * Shows a contextual intro popup for the Project Coverage Map on page load.
 * Frequency capped to 2 views maximum per device/browser.
 */
(function(window) {
  'use strict';

  const DELAY_AFTER_VISIBLE_MS = 600;
  const STORAGE_KEY = 'atlas_intro_view_count';
  const MAX_INTRO_SHOW_COUNT = 2;

  function init() {
    const popup = document.getElementById('atlasIntroPopup');
    const backdrop = document.getElementById('atlasIntroBackdrop');
    const closeBtn = document.getElementById('atlasIntroCloseBtn');
    const gotItBtn = document.getElementById('atlasIntroGotItBtn');
    const mapCard = document.querySelector('.map-card');

    if (!popup || !backdrop || !mapCard) return;

    // Check frequency count from localStorage
    let currentCount = 0;
    try {
      currentCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (isNaN(currentCount)) currentCount = 0;
    } catch (e) {
      currentCount = 0;
    }

    // If already shown 2 times or user closed it, do not show again
    if (currentCount >= MAX_INTRO_SHOW_COUNT) {
      popup.style.display = 'none';
      backdrop.style.display = 'none';
      return;
    }

    let isClosed = false;

    function closePopup() {
      if (isClosed) return;
      isClosed = true;

      // Upon explicit close / click, mark count as max so it won't pop up again
      try {
        localStorage.setItem(STORAGE_KEY, MAX_INTRO_SHOW_COUNT.toString());
      } catch (e) {}

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

    // Record view count for this session
    try {
      localStorage.setItem(STORAGE_KEY, (currentCount + 1).toString());
    } catch (e) {}

    // Reveal popup shortly after page/map loads
    setTimeout(() => {
      if (isClosed) return;

      popup.style.display = 'block';
      backdrop.style.display = 'block';
      popup.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');

      requestAnimationFrame(() => {
        popup.classList.add('show');
        backdrop.classList.add('show');
      });

    }, DELAY_AFTER_VISIBLE_MS);

    // Event listeners for close actions
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', closePopup);
    }
    if (gotItBtn) {
      const newGotItBtn = gotItBtn.cloneNode(true);
      gotItBtn.parentNode.replaceChild(newGotItBtn, gotItBtn);
      newGotItBtn.addEventListener('click', closePopup);
    }

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !isClosed) {
        closePopup();
      }
    });
  }

  // Expose component to global window
  window.AtlasMapIntro = {
    init: init
  };
})(window);
