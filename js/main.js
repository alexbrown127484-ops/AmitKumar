/* =====================================================
   TOKVERSE – Main JavaScript
   ===================================================== */

// ---- HEADER SCROLL ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate spans
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

// ---- FAQ ACCORDION ----
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-question').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.classList.remove('open');
      }
    });

    // Toggle current
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.classList.toggle('open', !isOpen);
  });
});

// ---- COUNTER ANIMATION ----
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = target * ease;
    el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---- INTERSECTION OBSERVER (fade-in + counter) ----
const fadeEls = document.querySelectorAll('.service-card, .pricing-card, .result-card, .testimonial-card, .value-card, .team-card, .feature-card, .step-card, .trusted-content, .trusted-image, .fueling-content, .fueling-steps, .section-header, .mission-content, .mission-image');

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// Counter observer
const counterEls = document.querySelectorAll('.stat-num[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

// Stagger children
document.querySelectorAll('.services-grid, .pricing-grid, .testimonials-grid, .values-grid, .team-grid, .results-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.fade-in');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
  });
});

// ---- FORM ALERT HELPER ----
function showFormAlert(msg) {
  let el = document.getElementById('formAlert');
  if (!el) {
    el = document.createElement('div');
    el.id = 'formAlert';
    el.style.cssText = 'background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.4);border-radius:8px;padding:12px 16px;font-size:0.875rem;color:#fca5a5;margin-bottom:16px;display:none;';
    const form = document.getElementById('contactForm');
    if (form) form.prepend(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- CONTACT FORM VALIDATION ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const validators = {
    firstName: (v) => v.trim() ? '' : 'First name is required.',
    lastName: (v) => v.trim() ? '' : 'Last name is required.',
    email: (v) => {
      if (!v.trim()) return 'Email is required.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.';
    },
    brand: (v) => v.trim() ? '' : 'Brand name is required.',
    monthlyRevenue: (v) => v ? '' : 'Please select your revenue range.',
    service: (v) => v ? '' : 'Please select a service.',
    message: (v) => v.trim().length >= 10 ? '' : 'Please tell us a bit more (at least 10 characters).',
    agree: () => {
      const cb = document.getElementById('agree');
      return cb && cb.checked ? '' : 'Please agree to continue.';
    }
  };

  function validateField(name, value) {
    const fn = validators[name];
    return fn ? fn(value) : '';
  }

  function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + 'Error');
    if (input) input.classList.toggle('error', !!message);
    if (error) error.textContent = message || '';
  }

  // Live validation on blur
  Object.keys(validators).forEach(name => {
    const el = document.getElementById(name);
    if (!el) return;
    el.addEventListener('blur', () => {
      const err = validateField(name, el.value);
      showError(name, err);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const err = validateField(name, el.value);
        showError(name, err);
      }
    });
  });

  contactForm.addEventListener('submit', (e) => {
    // Step 1 — run our client-side validators first
    let valid = true;
    Object.keys(validators).forEach(name => {
      const el = document.getElementById(name);
      const value = el ? el.value : '';
      const err = validateField(name, value);
      showError(name, err);
      if (err) valid = false;
    });

    if (!valid) {
      // Block @formspree/ajax from proceeding if our validation fails
      e.preventDefault();
      e.stopPropagation();
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Step 2 — update hidden _subject with the actual brand name
    const brandVal = (document.getElementById('brand').value || '').trim();
    const subjectEl = document.getElementById('fs_subject');
    if (subjectEl && brandVal) {
      subjectEl.value = `New Tokverse Inquiry \u2013 ${brandVal}`;
    }

    // Step 3 — show loading state; @formspree/ajax takes over from here.
    // It intercepts the same submit event, POSTs to formspree.io/f/mdaradow,
    // then fires data-fs-success / data-fs-error elements automatically.
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    // Step 4 — poll for the library's success state, then show our custom screen
    waitForFormspreeSuccess();
  });

  // Watches for @formspree/ajax marking the form as succeeded, then
  // swaps in our styled success screen instead of the library's default.
  function waitForFormspreeSuccess() {
    const MAX_WAIT = 15000; // 15 s timeout
    const INTERVAL = 200;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += INTERVAL;
      // @formspree/ajax sets aria-hidden="false" on [data-fs-success] on success
      const successEl = document.querySelector('[data-fs-success]');
      const isSuccess = successEl && successEl.getAttribute('aria-hidden') === 'false';
      const hasSuccessText = successEl && successEl.textContent.trim().length > 0;

      if (isSuccess || hasSuccessText) {
        clearInterval(timer);
        contactForm.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
        document.getElementById('formSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Timeout — restore button so user can retry
      if (elapsed >= MAX_WAIT) {
        clearInterval(timer);
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        const submitBtn = document.getElementById('submitBtn');
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
      }
    }, INTERVAL);
  }
}


// ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
