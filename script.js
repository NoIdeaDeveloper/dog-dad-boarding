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
  const backToTop  = document.getElementById('backToTop');

  let ticking = false;

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
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------
     Active nav section highlighting
  ------------------------------------------- */
  const navLinkItems = navLinks.querySelectorAll('a[href^="#"]');
  const sectionIds = [];

  navLinkItems.forEach(function (link) {
    var id = link.getAttribute('href').substring(1);
    if (id && document.getElementById(id)) {
      sectionIds.push(id);
    }
  });

  function setActiveNavLink() {
    var current = '';
    var scrollPos = window.scrollY + parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height'), 10) + 80;

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section && section.offsetTop <= scrollPos) {
        current = id;
      }
    });

    navLinkItems.forEach(function (link) {
      var href = link.getAttribute('href').substring(1);
      if (href === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Add active-link styles via a MutationObserver approach (CSS-only is cleaner)
  // The .active class is added to nav links for current section

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
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    handleMenuKeydown(e);
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
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
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

    // Collect all gallery images
    document.querySelectorAll('.gallery__item img').forEach(function (img, i) {
      galleryImages.push({ src: img.src, alt: img.alt });
    });

    function openLightbox(index) {
      if (index < 0 || index >= galleryImages.length) return;
      currentIndex = index;
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
    }

    function showPrev() {
      var idx = currentIndex - 1;
      if (idx < 0) idx = galleryImages.length - 1;
      openLightbox(idx);
    }

    function showNext() {
      var idx = currentIndex + 1;
      if (idx >= galleryImages.length) idx = 0;
      openLightbox(idx);
    }

    // Click handlers on gallery items (both img clicks and keyboard Enter/Space)
    document.querySelectorAll('.gallery__item').forEach(function (item, i) {
      item.addEventListener('click', function () {
        openLightbox(i);
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
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

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      } else if (e.key === 'ArrowRight') {
        showNext();
      }
    });
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
            if (data.errors && Object.values(data.errors).length) {
              setFormStatus('Something went wrong. Please try again.', 'error');
            } else {
              setFormStatus('Server error. Please try again later.', 'error');
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
        } else {
          input.placeholder = 'Something went wrong. Try again.';
          setTimeout(function () {
            input.placeholder = 'Your email address';
          }, 4000);
        }
      }).catch(function () {
        input.placeholder = 'Network error. Try again.';
        setTimeout(function () {
          input.placeholder = 'Your email address';
        }, 4000);
      }).finally(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  /* -------------------------------------------
     Nav active link: update on scroll
  ------------------------------------------- */
  window.addEventListener('scroll', function () {
    setActiveNavLink();
  }, { passive: true });
  setActiveNavLink();

  /* -------------------------------------------
     Lazy-load Google Maps iframe
  ------------------------------------------- */
  var mapIframe = document.querySelector('.map-section__embed iframe');
  if (mapIframe && mapIframe.hasAttribute('data-src')) {
    var mapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          mapIframe.src = mapIframe.getAttribute('data-src');
          mapIframe.removeAttribute('data-src');
          mapObserver.unobserve(mapIframe);
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapIframe);
  }

})();
