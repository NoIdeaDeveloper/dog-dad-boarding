/* =============================================
   Dog Dad Boarding — JavaScript
   ============================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------
     Shared: local-date helper (avoids UTC offset shifting date by a day)
  ------------------------------------------- */
  function localDateString(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* -------------------------------------------
     Navigation: scroll effect + mobile menu
  ------------------------------------------- */
  (function () {
    var nav        = document.getElementById('nav');
    var hamburger  = document.getElementById('hamburger');
    var navLinks   = document.getElementById('navLinks');
    var navOverlay = document.getElementById('navOverlay');
    if (!nav || !hamburger || !navLinks || !navOverlay) return;

    var backToTop = document.getElementById('backToTop');
    var ticking   = false;
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

    /* Active nav section highlighting */
    var navLinkItems = navLinks.querySelectorAll('a[href^="#"]');
    var sectionIds   = [];
    var linkHrefs    = [];

    navLinkItems.forEach(function (link) {
      var id = link.getAttribute('href').substring(1);
      if (id && document.getElementById(id)) {
        sectionIds.push(id);
        linkHrefs.push(id);
      }
    });

    function setActiveNavLink() {
      var current   = '';
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

    /* Mobile menu */
    var lastFocusedEl  = null;
    var focusableEls   = null;
    var firstFocusable = null;
    var lastFocusable  = null;
    var touchStartX    = 0;
    var touchStartY    = 0;

    function openMenu() {
      navLinks.classList.add('open');
      navOverlay.classList.add('visible');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      lastFocusedEl  = document.activeElement;
      focusableEls   = navLinks.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      firstFocusable = focusableEls[0];
      lastFocusable  = focusableEls[focusableEls.length - 1];
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
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        return;
      }
      if (navLinks.classList.contains('open')) handleMenuKeydown(e);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    navOverlay.addEventListener('click', closeMenu);

    navLinks.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    navLinks.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && dx > 70) closeMenu();
    });

    /* Smooth scroll fallback */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        var target;
        try { target = document.querySelector(targetId); } catch (err) { return; }
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - cachedNavHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  })();

  /* -------------------------------------------
     Hero trust badge count-up animation
  ------------------------------------------- */
  (function () {
    function animateCountUp(el, target, suffix, duration) {
      var startTime = null;
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = el.getAttribute('data-final') || (target + suffix);
        }
      }
      requestAnimationFrame(step);
    }

    var trustBadges   = document.querySelectorAll('.trust-badge strong');
    var trustObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var strong = entry.target;
        var text   = strong.getAttribute('data-final') || strong.textContent.trim();
        strong.setAttribute('data-final', text);
        var match  = text.match(/^(\d+)(.*)$/);
        if (match) {
          if (prefersReducedMotion) {
            strong.textContent = text;
          } else {
            animateCountUp(strong, parseInt(match[1], 10), match[2], 1500);
          }
        }
        trustObserver.unobserve(strong);
      });
    }, { threshold: 0.5 });

    trustBadges.forEach(function (badge) {
      var raw   = badge.textContent.trim();
      badge.setAttribute('data-final', raw);
      var match = raw.match(/^(\d+)(.*)$/);
      if (match) badge.textContent = '0' + match[2];
      trustObserver.observe(badge);
    });
  })();

  /* -------------------------------------------
     Gallery lightbox with prev/next navigation
  ------------------------------------------- */
  (function () {
    var lightbox    = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    if (!lightbox || !lightboxImg) return;

    var galleryImages   = [];
    var currentIndex    = 0;
    var lightboxTrigger = null;

    document.querySelectorAll('.gallery__item').forEach(function (item) {
      var img = item.querySelector('img');
      if (!img) return;
      // Use data-full for high-res version when available
      galleryImages.push({
        src: item.getAttribute('data-full') || img.src,
        alt: img.alt
      });
    });

    function showImage(index) {
      currentIndex = index;
      lightboxImg.classList.add('loading');
      lightboxImg.src = galleryImages[currentIndex].src;
      lightboxImg.alt = galleryImages[currentIndex].alt || '';
    }

    function openLightbox(index, triggerEl) {
      if (index < 0 || index >= galleryImages.length) return;
      currentIndex    = index;
      lightboxTrigger = triggerEl || null;
      showImage(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
      lightboxImg.classList.remove('loading');
      if (lightboxTrigger) {
        lightboxTrigger.focus();
        lightboxTrigger = null;
      }
    }

    function navigate(dir) {
      showImage((currentIndex + dir + galleryImages.length) % galleryImages.length);
    }

    // Clear loading state once the high-res image finishes loading
    if (lightboxImg) {
      lightboxImg.addEventListener('load', function () {
        lightboxImg.classList.remove('loading');
      });
      lightboxImg.addEventListener('error', function () {
        lightboxImg.classList.remove('loading');
      });
    }

    document.querySelectorAll('.gallery__item').forEach(function (item, i) {
      item.addEventListener('click', function () { openLightbox(i, item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i, item); }
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    var closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.lightbox__nav--next');
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); navigate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); navigate(1); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigate(-1);
      } else if (e.key === 'ArrowRight') {
        navigate(1);
      } else if (e.key === 'Tab') {
        var focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        var first     = focusable[0];
        var last      = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    });
  })();

  /* -------------------------------------------
     Scroll-reveal animations
  ------------------------------------------- */
  (function () {
    var revealElements = document.querySelectorAll(
      '.service-card, .gallery__item, .testimonial-card, ' +
      '.pricing-card, .about__image, .about__content, ' +
      '.contact__info, .contact__form, .faq__item, ' +
      '.resource-card, .newsletter__content, .newsletter__form, ' +
      '.how-it-works__step'
    );

    revealElements.forEach(function (el) { el.classList.add('reveal'); });

    ['.service-card', '.testimonial-card', '.pricing-card', '.gallery__item', '.how-it-works__step'].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.08) + 's';
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    revealElements.forEach(function (el) { revealObserver.observe(el); });
  })();

  /* -------------------------------------------
     Contact form: validation + submission
  ------------------------------------------- */
  (function () {
    var form       = document.getElementById('contactForm');
    var formStatus = document.getElementById('formStatus');
    if (!form) return;

    function setFormStatus(message, type) {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.className   = 'form-status' + (type ? ' form-status--' + type : '');
      if (message && formStatus.scrollIntoView) {
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    var validators = {
      name: {
        validate: function (val) { return val.trim().length > 0; },
        message:  'Please enter your name.'
      },
      email: {
        validate: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); },
        message:  'Please enter a valid email address.'
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
        message:  'Please select a service.'
      },
      start: {
        validate: function (val) {
          if (!val) return true;
          return val >= localDateString();
        },
        message: 'Start date cannot be in the past.'
      },
      end: {
        validate: function (val) {
          if (!val) return true;
          var startInput = document.getElementById('start');
          if (startInput && startInput.value && val < startInput.value) return false;
          return val >= localDateString();
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
      var group   = el.closest('.form-group');
      var errorEl = document.getElementById(fieldId + '-error');
      if (errorEl) errorEl.textContent = message;
      if (group) group.classList.add('has-error');
    }

    function clearFieldError(fieldId) {
      var el = document.getElementById(fieldId);
      if (!el) return;
      var group = el.closest('.form-group');
      if (group) group.classList.remove('has-error');
    }

    function validateField(fieldId) {
      var input = document.getElementById(fieldId);
      if (!input || !validators[fieldId]) return true;
      var valid = validators[fieldId].validate(input.value);
      if (!valid) { showFieldError(fieldId, validators[fieldId].message); }
      else        { clearFieldError(fieldId); }
      return valid;
    }

    function validateForm() {
      var valid = true;
      Object.keys(validators).forEach(function (id) {
        if (!validateField(id)) valid = false;
      });
      return valid;
    }

    Object.keys(validators).forEach(function (fieldId) {
      var input = document.getElementById(fieldId);
      if (!input) return;
      input.addEventListener('blur',  function () { validateField(fieldId); });
      input.addEventListener('input', function () { clearFieldError(fieldId); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var hp = form.querySelector('input[name="_hp"]');
      if (hp && hp.value) return;

      setFormStatus('', '');
      if (!validateForm()) return;

      var submitBtn   = form.querySelector('button[type="submit"]');
      var label       = submitBtn.querySelector('.btn__label');
      var originalText= label ? label.textContent : submitBtn.textContent;
      if (submitBtn) submitBtn.classList.add('is-loading');
      if (label) label.textContent = 'Sending…';
      submitBtn.disabled    = true;

      var controller = new AbortController();
      var timeoutId  = setTimeout(function () { controller.abort(); }, 15000);

      fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
        signal:  controller.signal
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
        if (submitBtn) submitBtn.classList.remove('is-loading');
        if (label) label.textContent = originalText;
        else submitBtn.textContent = originalText;
        submitBtn.disabled    = false;
      });
    });
  })();

  /* -------------------------------------------
     Pricing "Book" buttons pre-select the service
     in the contact form's Service dropdown
  ------------------------------------------- */
  (function () {
    var serviceSelect = document.getElementById('service');
    var nameInput     = document.getElementById('name');
    if (!serviceSelect) return;

    document.querySelectorAll('[data-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var svc = btn.getAttribute('data-service');
        if (!svc) return;
        // Defer until after the smooth-scroll navigation completes
        setTimeout(function () {
          serviceSelect.value = svc;
          serviceSelect.dispatchEvent(new Event('change'));
          if (nameInput) nameInput.focus();
        }, 450);
      });
    });
  })();

  /* -------------------------------------------
     Dynamic copyright year
  ------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------
     Set minimum date for date inputs to today
  ------------------------------------------- */
  (function () {
    var today      = localDateString();
    var startInput = document.getElementById('start');
    var endInput   = document.getElementById('end');

    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      input.setAttribute('min', today);
    });

    if (startInput && endInput) {
      startInput.addEventListener('change', function () {
        if (endInput.value && endInput.value < startInput.value) {
          endInput.value = startInput.value;
        }
        endInput.setAttribute('min', startInput.value || today);
      });
    }
  })();

  /* -------------------------------------------
     Newsletter form — aria-live status feedback
  ------------------------------------------- */
  (function () {
    var newsletterForm   = document.getElementById('newsletterForm');
    var newsletterStatus = document.getElementById('newsletterStatus');
    if (!newsletterForm) return;

    var nlTimeoutId = null;

    function setNlStatus(msg, isError) {
      if (!newsletterStatus) return;
      newsletterStatus.textContent  = msg;
      newsletterStatus.className    = 'newsletter__status' + (isError ? ' newsletter__status--error' : '');
    }

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var hp = newsletterForm.querySelector('input[name="_hp"]');
      if (hp && hp.value) return;

      var input        = newsletterForm.querySelector('input[type="email"]');
      var btn          = newsletterForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      if (nlTimeoutId) { clearTimeout(nlTimeoutId); nlTimeoutId = null; }

      btn.textContent = 'Subscribing…';
      btn.disabled    = true;
      setNlStatus('', false);

      var controller = new AbortController();
      var fetchTimeout = setTimeout(function () { controller.abort(); }, 15000);

      fetch('https://submit-form.com/YOUR_FORM_ID', {
        method:  'POST',
        body:    new FormData(newsletterForm),
        headers: { 'Accept': 'application/json' },
        signal:  controller.signal
      }).then(function (res) {
        clearTimeout(fetchTimeout);
        if (res.ok) {
          input.value = '';
          setNlStatus('Subscribed! Check your inbox.', false);
          nlTimeoutId = setTimeout(function () { setNlStatus('', false); nlTimeoutId = null; }, 5000);
        } else {
          setNlStatus('Something went wrong. Please try again.', true);
        }
      }).catch(function (err) {
        clearTimeout(fetchTimeout);
        setNlStatus(err.name === 'AbortError' ? 'Request timed out. Try again.' : 'Network error. Try again.', true);
      }).finally(function () {
        btn.textContent = originalText;
        btn.disabled    = false;
      });
    });
  })();

  /* -------------------------------------------
     Sticky CTA — hide when contact form is visible
  ------------------------------------------- */
  (function () {
    var stickyCta      = document.getElementById('stickyCta');
    var contactSection = document.getElementById('contact');
    if (!stickyCta || !contactSection) return;

    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyCta.style.display = entry.isIntersecting ? 'none' : '';
      });
    }, { threshold: 0.05 });

    ctaObserver.observe(contactSection);
  })();

  /* -------------------------------------------
     Lazy-load OpenStreetMap via Leaflet
     (injected on-demand to avoid loading ~55 KB
     of map assets until the section is in view)
  ------------------------------------------- */
  (function () {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;

    var mapLoaded = false;

    function initMap() {
      var L = window.L;
      if (!L || mapLoaded) return;
      mapLoaded = true;

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
    }

    function loadLeaflet() {
      if (window.L) { initMap(); return; }

      var css       = document.createElement('link');
      css.rel       = 'stylesheet';
      css.href      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      css.crossOrigin = 'anonymous';
      document.head.appendChild(css);

      var script         = document.createElement('script');
      script.src         = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity   = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload      = initMap;
      document.head.appendChild(script);
    }

    var mapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadLeaflet();
          mapObserver.unobserve(mapEl);
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });

    mapObserver.observe(mapEl);
  })();

  /* -------------------------------------------
     Train divider — scrolls the train across the rails
     as the divider passes through the viewport.
   ------------------------------------------- */
  (function () {
    var divider = document.querySelector('.train-divider');
    if (!divider) return;

    var train = divider.querySelector('.train-divider__train');
    if (!train) return;

    var rolling = false;
    var ticking = false;

    function updateTrainPos() {
      var rect = divider.getBoundingClientRect();
      var vh   = window.innerHeight || document.documentElement.clientHeight;

      /* Progress 0 -> 1 as the divider enters the bottom of the
         viewport and exits the top. Start the train off-screen left
         and end it off-screen right. */
      var start = vh;
      var end   = -rect.height;
      var span  = start - end;
      var p     = (start - rect.top) / span;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      var trainWidth = train.offsetWidth || 360;
      var trackWidth = divider.offsetWidth || window.innerWidth;
      var travel     = trackWidth - trainWidth + 40; /* a little overshoot */

      train.style.transform = 'translateX(' + (p * travel - 20) + 'px)';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateTrainPos);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateTrainPos();

    /* Toggle the .is-rolling class (drives wheels + smoke + bob) only
       while the divider is actually on screen. */
    var rollObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !prefersReducedMotion) {
          if (!rolling) {
            divider.classList.add('is-rolling');
            rolling = true;
          }
        } else {
          divider.classList.remove('is-rolling');
          rolling = false;
        }
      });
    }, { threshold: 0.05 });

    rollObserver.observe(divider);
  })();

})();
