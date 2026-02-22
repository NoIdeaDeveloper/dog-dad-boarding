/* =============================================
   Dog Dad Boarding — JavaScript
   ============================================= */

(function () {
  'use strict';

  /* -------------------------------------------
     Navigation: scroll effect + mobile menu
  ------------------------------------------- */
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  // Add "scrolled" class when user scrolls past 60px
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is already scrolled

  // Open / close mobile menu
  function openMenu() {
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close when overlay backdrop is clicked
  navOverlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* -------------------------------------------
     Smooth scroll (fallback for older browsers)
  ------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -------------------------------------------
     Scroll-reveal animations
  ------------------------------------------- */
  const revealElements = document.querySelectorAll(
    '.service-card, .gallery__item, .testimonial-card, ' +
    '.pricing-card, .about__image, .about__content, ' +
    '.contact__info, .contact__form'
  );

  // Add reveal class + staggered delays within card groups
  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  // Add stagger delays to sibling cards
  ['.service-card', '.testimonial-card', '.pricing-card', '.gallery__item'].forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* -------------------------------------------
     Contact form: simple submission feedback
  ------------------------------------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Simulate sending
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.textContent = "Sent! We'll be in touch within 24 hours.";
        submitBtn.style.background = 'var(--primary-light)';

        setTimeout(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          form.reset();
        }, 4000);
      }, 800);
    });
  }

  /* -------------------------------------------
     Set minimum date for date inputs to today
  ------------------------------------------- */
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    input.setAttribute('min', today);
  });

  const startInput = document.getElementById('start');
  const endInput   = document.getElementById('end');

  if (startInput && endInput) {
    startInput.addEventListener('change', function () {
      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }
      endInput.setAttribute('min', startInput.value || today);
    });
  }

})();
