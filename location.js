/* location.js — slideshow logic for location pages */

(function () {
  'use strict';

  // Find all slideshows on the page and initialise them
  function initSlideshows() {
    // Detect slideshow by looking for elements with id="slideshowTrack-*"
    const tracks = document.querySelectorAll('[id^="slideshowTrack-"]');
    tracks.forEach(function (track) {
      const id = track.id.replace('slideshowTrack-', '');
      initSlideshow(id);
    });
  }

  const slideshowState = {};

  function initSlideshow(id) {
    const track = document.getElementById('slideshowTrack-' + id);
    const dotsContainer = document.getElementById('slideDots-' + id);
    if (!track) return;

    const slides = track.querySelectorAll('.slide');
    const total = slides.length;
    slideshowState[id] = { current: 0, total: total, autoplayTimer: null };

    // Build dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', (function (idx) {
          return function () { slideTo(id, idx); };
        })(i));
        dotsContainer.appendChild(dot);
      }
    }

    // Autoplay
    startAutoplay(id);

    // Touch/swipe
    let startX = 0;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        slideMove(id, diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  function startAutoplay(id) {
    const state = slideshowState[id];
    if (!state) return;
    clearInterval(state.autoplayTimer);
    state.autoplayTimer = setInterval(function () {
      slideMove(id, 1);
    }, 5000);
  }

  // Exposed globally so onclick attributes in HTML can call it
  window.slideMove = function (id, direction) {
    const state = slideshowState[id];
    if (!state) return;
    let next = state.current + direction;
    if (next < 0) next = state.total - 1;
    if (next >= state.total) next = 0;
    slideTo(id, next);
    startAutoplay(id); // reset autoplay on manual nav
  };

  function slideTo(id, index) {
    const state = slideshowState[id];
    if (!state) return;
    state.current = index;
    const track = document.getElementById('slideshowTrack-' + id);
    if (track) track.style.transform = 'translateX(-' + (index * 100) + '%)';
    // Update dots
    const dotsContainer = document.getElementById('slideDots-' + id);
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.slide-dot').forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  // Navbar scroll behaviour (reuse from main script if needed)
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Mobile toggle
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initSlideshows();
  });

})();
