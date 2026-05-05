/* ==========================================================
   Noire Lune Studio — Shared JavaScript
   ========================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------
     Cookie Consent + GTM / Meta Pixel Gate
  -------------------------------------------------------- */
  var CONSENT_KEY = 'nl_cookie_consent';

  function loadGTM() {
    // Google Tag Manager
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX' + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');
  }

  function loadMetaPixel() {
    // Meta Pixel
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = [];
      t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', 'XXXXXXXXXXXXXXXXXX');
    window.fbq('track', 'PageView');
  }

  function applyConsent() {
    loadGTM();
    loadMetaPixel();
  }

  function initCookieBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    var stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted') {
      banner.classList.add('hidden');
      applyConsent();
      return;
    }
    if (stored === 'declined') {
      banner.classList.add('hidden');
      return;
    }

    // Show banner
    document.getElementById('cookie-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.classList.add('hidden');
      applyConsent();
    });
    document.getElementById('cookie-decline').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'declined');
      banner.classList.add('hidden');
    });
  }

  /* --------------------------------------------------------
     Navbar: scroll state + hamburger menu
  -------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    var hamburger = document.querySelector('.nav-hamburger');
    var overlay = document.querySelector('.nav-overlay');
    if (!navbar) return;

    // Scroll class
    function onScroll() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger toggle
    if (hamburger && overlay) {
      hamburger.addEventListener('click', function () {
        var isOpen = overlay.classList.contains('open');
        overlay.classList.toggle('open');
        hamburger.classList.toggle('open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      // Close on link click
      overlay.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          overlay.classList.remove('open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* --------------------------------------------------------
     Testimonials Carousel
  -------------------------------------------------------- */
  function initTestimonials() {
    var track = document.querySelector('.testimonial-track');
    var dotsContainer = document.querySelector('.testimonial-dots');
    if (!track) return;

    var slides = track.querySelectorAll('.testimonial-slide');
    var total = slides.length;
    var current = 0;
    var autoTimer;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      // Update dots
      var dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      autoTimer = setInterval(next, 5500);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Build dots
    if (dotsContainer) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); resetAuto(); });
        dotsContainer.appendChild(dot);
      });
    }

    var btnPrev = document.querySelector('.testimonial-btn.prev');
    var btnNext = document.querySelector('.testimonial-btn.next');
    if (btnPrev) btnPrev.addEventListener('click', function () { prev(); resetAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { next(); resetAuto(); });

    // Touch swipe
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* --------------------------------------------------------
     Scroll Reveal
  -------------------------------------------------------- */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------
     Smooth anchor scroll (fallback for older browsers)
  -------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72');
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* --------------------------------------------------------
     Active nav link highlight on scroll
  -------------------------------------------------------- */
  function initNavHighlight() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* --------------------------------------------------------
     Init
  -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initCookieBanner();
    initNavbar();
    initTestimonials();
    initScrollReveal();
    initSmoothScroll();
    initNavHighlight();
  });

})();
