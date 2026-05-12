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

  const backToTop = document.getElementById('backToTop');

  // Add "scrolled" class when user scrolls past 60px (rAF-throttled)
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is already scrolled

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  let lastFocusedEl = null;
  let focusableEls = null;
  let firstFocusable = null;
  let lastFocusable = null;

  // Open / close mobile menu
  function openMenu() {
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Focus trap setup
    lastFocusedEl = document.activeElement;
    focusableEls = navLinks.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    firstFocusable = focusableEls[0];
    lastFocusable = focusableEls[focusableEls.length - 1];
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Restore focus
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  hamburger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Trap Tab focus inside the mobile menu
  function handleMenuKeydown(e) {
    if (!navLinks.classList.contains('open')) return;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
    handleMenuKeydown(e);
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close when overlay backdrop is clicked
  navOverlay.addEventListener('click', closeMenu);

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
      Gallery lightbox
  ------------------------------------------- */
  (function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightbox || !lightboxImg) return;

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    document.querySelectorAll('.gallery__item img').forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt);
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  })();

  /* -------------------------------------------
      Scroll-reveal animations
  ------------------------------------------- */
  const revealElements = document.querySelectorAll(
    '.service-card, .gallery__item, .testimonial-card, ' +
    '.pricing-card, .about__image, .about__content, ' +
    '.contact__info, .contact__form, .faq__item, ' +
    '.resource-card, .newsletter__content, .newsletter__form'
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
  const formStatus = document.getElementById('formStatus');

  function setFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = 'form-status' + (type ? ' form-status--' + type : '');
  }

  /* Field validation helpers */
  const validators = {
    name: {
      validate: function (val) { return val.trim().length > 0; },
      message: 'Please enter your name.'
    },
    email: {
      validate: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); },
      message: 'Please enter a valid email address.'
    },
    phone: {
      validate: function () { return true; },
      message: ''
    },
    service: {
      validate: function (val) { return val !== ''; },
      message: 'Please select a service.'
    },
    start: {
      validate: function () { return true; },
      message: ''
    },
    end: {
      validate: function () { return true; },
      message: ''
    },
    message: {
      validate: function () { return true; },
      message: ''
    }
  };

  function showFieldError(fieldId, message) {
    var group = document.getElementById(fieldId).closest('.form-group');
    if (!group) return;
    var errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) errorEl.textContent = message;
    group.classList.add('has-error');
  }

  function clearFieldError(fieldId) {
    var group = document.getElementById(fieldId).closest('.form-group');
    if (!group) return;
    group.classList.remove('has-error');
  }

  function validateField(fieldId) {
    var input = document.getElementById(fieldId);
    if (!input || !validators[fieldId]) return true;
    var valid = validators[fieldId].validate(input.value);
    if (!valid) {
      showFieldError(fieldId, validators[fieldId].message);
    } else {
      clearFieldError(fieldId);
    }
    return valid;
  }

  function validateForm() {
    var valid = true;
    Object.keys(validators).forEach(function (fieldId) {
      if (!validateField(fieldId)) valid = false;
    });
    return valid;
  }

  // Clear errors on input
  Object.keys(validators).forEach(function (fieldId) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    input.addEventListener('blur', function () { validateField(fieldId); });
    input.addEventListener('input', function () { clearFieldError(fieldId); });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      setFormStatus('', '');
      if (!validateForm()) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          setFormStatus("Sent! We'll be in touch within 24 hours.", 'success');
          form.reset();
        } else {
          return response.json().then(function (data) {
            if (Object.values(data.errors).length) {
              setFormStatus('Something went wrong. Please try again.', 'error');
            }
          });
        }
      }).catch(function () {
        setFormStatus('Network error. Please check your connection and try again.', 'error');
      }).finally(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  /* -------------------------------------------
      Dynamic copyright year
  ------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* -------------------------------------------
      Newsletter form
  ------------------------------------------- */
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      var btn = newsletterForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      btn.textContent = 'Subscribing…';
      btn.disabled = true;

      fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: new FormData(newsletterForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          input.value = '';
          input.placeholder = 'Subscribed! Check your inbox.';
          setTimeout(function () {
            input.placeholder = 'Your email address';
          }, 4000);
        }
      }).catch(function () {
        // silently fail — no critical feature
      }).finally(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

})();
