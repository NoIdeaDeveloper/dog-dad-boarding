/* =============================================
   Dog Dad Boarding — JavaScript
   ============================================= */

(function () {
  'use strict';

  /* -------------------------------------------
     Navigation: scroll effect + mobile menu
  ------------------------------------------- */
  var nav        = document.getElementById('nav');
  var hamburger  = document.getElementById('hamburger');
  var navLinks   = document.getElementById('navLinks');
  var navOverlay = document.getElementById('navOverlay');
  var backToTop  = document.getElementById('backToTop');

  if (!nav || !hamburger || !navLinks || !navOverlay) return;

  var ticking = false;
  var cachedNavHeight = 72;

  function updateNavHeight() {
    var val = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10);
    cachedNavHeight = isNaN(val) ? 72 : val;
  }

  updateNavHeight();
  window.addEventListener('resize', updateNavHeight, { passive: true });

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
        setActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------
     Active nav section highlighting
  ------------------------------------------- */
  var navLinkItems = navLinks.querySelectorAll('a[href^="#"]');
  var sectionIds = [];
  var linkHrefs = [];

  navLinkItems.forEach(function (link) {
    var id = link.getAttribute('href').substring(1);
    if (id && document.getElementById(id)) {
      sectionIds.push(id);
      linkHrefs.push(id);
    }
  });

  function setActiveNavLink() {
    var current = '';
    var scrollPos = window.scrollY + cachedNavHeight + 80;

    for (var i = 0; i < sectionIds.length; i++) {
      var section = document.getElementById(sectionIds[i]);
      if (section && section.offsetTop <= scrollPos) {
        current = sectionIds[i];
      }
    }

    for (var j = 0; j < navLinkItems.length; j++) {
      if (linkHrefs[j] === current) {
        navLinkItems[j].classList.add('active');
      } else {
        navLinkItems[j].classList.remove('active');
      }
    }
  }

  setActiveNavLink();

  /* -------------------------------------------
     Hero trust badge count-up animation
  ------------------------------------------- */
  function animateCountUp(el, target, suffix, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = el.getAttribute('data-final') || (target + suffix);
      }
    }

    requestAnimationFrame(step);
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var trustBadges = document.querySelectorAll('.trust-badge strong');
  var trustObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var strong = entry.target;
        var text = strong.getAttribute('data-final') || strong.textContent.trim();
        strong.setAttribute('data-final', text);
        var match = text.match(/^(\d+)(.*)$/);
        if (match) {
          if (prefersReducedMotion) {
            strong.textContent = text;
          } else {
            var num = parseInt(match[1], 10);
            var suffix = match[2];
            animateCountUp(strong, num, suffix, 1500);
          }
        }
        trustObserver.unobserve(strong);
      }
    });
  }, { threshold: 0.5 });

  trustBadges.forEach(function (badge) {
    var raw = badge.textContent.trim();
    badge.setAttribute('data-final', raw);
    var match = raw.match(/^(\d+)(.*)$/);
    if (match) {
      badge.textContent = '0' + match[2];
    }
    trustObserver.observe(badge);
  });

  /* -------------------------------------------
     Mobile menu — open/close with overlay fix
  ------------------------------------------- */
  var lastFocusedEl = null;
  var focusableEls = null;
  var firstFocusable = null;
  var lastFocusable = null;
  var touchStartX = 0;
  var touchStartY = 0;

  function openMenu() {
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

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

    if (lastFocusedEl) lastFocusedEl.focus();
  }

  hamburger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

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
    if (e.key === 'Escape') {
      if (navLinks.classList.contains('open')) {
        closeMenu();
        return;
      }
    }
    if (navLinks.classList.contains('open')) {
      handleMenuKeydown(e);
    }
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  navOverlay.addEventListener('click', closeMenu);

  // Swipe-to-close on mobile menu
  navLinks.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  navLinks.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && dx > 70) {
      closeMenu();
    }
  });

  /* -------------------------------------------
     Smooth scroll (fallback for older browsers)
  ------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target;
      try {
        target = document.querySelector(targetId);
      } catch (err) {
        return;
      }
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - cachedNavHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* -------------------------------------------
     Gallery lightbox with prev/next navigation
  ------------------------------------------- */
  (function () {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    if (!lightbox || !lightboxImg) return;

    var galleryImages = [];
    var currentIndex = 0;
    var lightboxTrigger = null;

    // Collect all gallery images
    document.querySelectorAll('.gallery__item img').forEach(function (img) {
      galleryImages.push({ src: img.src, alt: img.alt });
    });

    function openLightbox(index, triggerEl) {
      if (index < 0 || index >= galleryImages.length) return;
      currentIndex = index;
      lightboxTrigger = triggerEl || null;
      var item = galleryImages[currentIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
      if (lightboxTrigger) {
        lightboxTrigger.focus();
        lightboxTrigger = null;
      }
    }

    function showPrev() {
      var idx = currentIndex - 1;
      if (idx < 0) idx = galleryImages.length - 1;
      currentIndex = idx;
      var item = galleryImages[currentIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || '';
    }

    function showNext() {
      var idx = currentIndex + 1;
      if (idx >= galleryImages.length) idx = 0;
      currentIndex = idx;
      var item = galleryImages[currentIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || '';
    }

    // Click handlers on gallery items (both img clicks and keyboard Enter/Space)
    document.querySelectorAll('.gallery__item').forEach(function (item, i) {
      item.addEventListener('click', function () {
        openLightbox(i, item);
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i, item);
        }
      });
    });

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Close button
    var closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    // Prev/next buttons
    var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.lightbox__nav--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showNext();
      });
    }

    // Focus trap for lightbox
    function handleLightboxKeydown(e) {
      if (!lightbox.classList.contains('open')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'Tab') {
        var focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleLightboxKeydown);
  })();

  /* -------------------------------------------
     Scroll-reveal animations
  ------------------------------------------- */
  var revealElements = document.querySelectorAll(
    '.service-card, .gallery__item, .testimonial-card, ' +
    '.pricing-card, .about__image, .about__content, ' +
    '.contact__info, .contact__form, .faq__item, ' +
    '.resource-card, .newsletter__content, .newsletter__form'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  ['.service-card', '.testimonial-card', '.pricing-card', '.gallery__item'].forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      var allRevealed = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        } else {
          allRevealed = false;
        }
      });
      if (allRevealed) {
        revealObserver.disconnect();
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* -------------------------------------------
     Contact form: validation + submission
  ------------------------------------------- */
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');

  function setFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = 'form-status' + (type ? ' form-status--' + type : '');
  }

  var validators = {
    name: {
      validate: function (val) { return val.trim().length > 0; },
      message: 'Please enter your name.'
    },
    email: {
      validate: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); },
      message: 'Please enter a valid email address.'
    },
    phone: {
      validate: function (val) {
        if (!val.trim()) return true;
        return /^[\d\s\-\(\)\+]{7,20}$/.test(val.trim());
      },
      message: 'Please enter a valid phone number.'
    },
    service: {
      validate: function (val) { return val !== ''; },
      message: 'Please select a service.'
    },
    start: {
      validate: function (val) {
        if (!val) return true;
        var today = new Date().toISOString().split('T')[0];
        return val >= today;
      },
      message: 'Start date cannot be in the past.'
    },
    end: {
      validate: function (val) {
        if (!val) return true;
        var startVal = document.getElementById('start');
        if (startVal && startVal.value && val < startVal.value) return false;
        var today = new Date().toISOString().split('T')[0];
        return val >= today;
      },
      message: 'End date must be on or after the start date.'
    },
    message: {
      validate: function (val) {
        if (!val.trim()) return true;
        return val.trim().length >= 10;
      },
      message: 'Please provide at least 10 characters if entering a message.'
    }
  };

  function showFieldError(fieldId, message) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var group = el.closest('.form-group');
    if (!group) return;
    var errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) errorEl.textContent = message;
    group.classList.add('has-error');
  }

  function clearFieldError(fieldId) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var group = el.closest('.form-group');
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

  Object.keys(validators).forEach(function (fieldId) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    input.addEventListener('blur', function () { validateField(fieldId); });
    input.addEventListener('input', function () { clearFieldError(fieldId); });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      var hp = form.querySelector('input[name="_hp"]');
      if (hp && hp.value) return;

      setFormStatus('', '');
      if (!validateForm()) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending\u2026';
      submitBtn.disabled = true;

      var formData = new FormData(form);
      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 15000);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }).then(function (response) {
        clearTimeout(timeoutId);
        if (response.ok) {
          setFormStatus("Sent! We'll be in touch within 24 hours.", 'success');
          form.reset();
        } else {
          setFormStatus('Server error. Please try again later.', 'error');
        }
      }).catch(function (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setFormStatus('Request timed out. Please try again.', 'error');
        } else {
          setFormStatus('Network error. Please check your connection and try again.', 'error');
        }
      }).finally(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  /* -------------------------------------------
     Dynamic copyright year
  ------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------
     Set minimum date for date inputs to today
  ------------------------------------------- */
  var today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    input.setAttribute('min', today);
  });

  var startInput = document.getElementById('start');
  var endInput   = document.getElementById('end');

  if (startInput && endInput) {
    startInput.addEventListener('change', function () {
      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }
      endInput.setAttribute('min', startInput.value || today);
    });
  }

  /* -------------------------------------------
     Newsletter form — with error feedback
  ------------------------------------------- */
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    var nlTimeoutId = null;

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      var hp = newsletterForm.querySelector('input[name="_hp"]');
      if (hp && hp.value) return;

      var input = newsletterForm.querySelector('input[type="email"]');
      var btn = newsletterForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      // Clear any pending timeout from previous submit
      if (nlTimeoutId) {
        clearTimeout(nlTimeoutId);
        nlTimeoutId = null;
      }

      btn.textContent = 'Subscribing\u2026';
      btn.disabled = true;

      var controller = new AbortController();
      var fetchTimeout = setTimeout(function () { controller.abort(); }, 15000);

      fetch('https://submit-form.com/YOUR_FORM_ID', {
        method: 'POST',
        body: new FormData(newsletterForm),
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(fetchTimeout);
        if (res.ok) {
          input.value = '';
          input.placeholder = 'Subscribed! Check your inbox.';
          nlTimeoutId = setTimeout(function () {
            input.placeholder = 'Your email address';
            nlTimeoutId = null;
          }, 4000);
        } else {
          input.placeholder = 'Something went wrong. Try again.';
          nlTimeoutId = setTimeout(function () {
            input.placeholder = 'Your email address';
            nlTimeoutId = null;
          }, 4000);
        }
      }).catch(function (err) {
        clearTimeout(fetchTimeout);
        if (err.name === 'AbortError') {
          input.placeholder = 'Request timed out. Try again.';
        } else {
          input.placeholder = 'Network error. Try again.';
        }
        nlTimeoutId = setTimeout(function () {
          input.placeholder = 'Your email address';
          nlTimeoutId = null;
        }, 4000);
      }).finally(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  /* -------------------------------------------
     Lazy-load OpenStreetMap via Leaflet
  ------------------------------------------- */
  var mapEl = document.getElementById('map');
  if (mapEl) {
    var mapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var L = window.L;
          if (!L) return;

          var map = L.map(mapEl, {
            center: [30.2672, -97.7431],
            zoom: 12,
            scrollWheelZoom: false,
            zoomControl: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
          }).addTo(map);

          L.marker([30.2672, -97.7431])
            .addTo(map)
            .bindPopup('<strong>Dog Dad Boarding</strong><br>Austin, TX')
            .openPopup();

          mapObserver.unobserve(mapEl);
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapEl);
  }

})();
