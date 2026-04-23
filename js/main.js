/**
 * ============================================================
 * Vibe Boilerplate — main.js
 * ============================================================
 * Vanilla JavaScript. No frameworks. No build step.
 *
 * All logic is wrapped in an init() function called after
 * DOMContentLoaded. This ensures the DOM is ready before any
 * element references are made.
 *
 * ORGANISATION:
 *   1.  Utility helpers
 *   2.  DOM selectors
 *   3.  Mobile navigation
 *   4.  Footer year
 *   5.  Contact form validation
 *   6.  Smooth scroll for same-page anchors
 *   7.  Active nav link highlighting
 *   8.  Initialisation entry point
 *
 * HOW TO EXTEND:
 *   - Add new feature functions (sections 9, 10, …)
 *   - Call them inside init()
 *   - Keep each feature isolated in its own function block
 * ============================================================
 */


/* ============================================================
   1. UTILITY HELPERS
   Small, reusable functions used throughout the file.
   ============================================================ */

/**
 * Shorthand for document.querySelector.
 * Returns the first matching element, or null if not found.
 *
 * @param {string} selector - CSS selector string
 * @param {Element|Document} [context=document] - Optional root to search within
 * @returns {Element|null}
 */
const qs = (selector, context = document) => context.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll.
 * Returns a NodeList. Use Array.from() if you need array methods.
 *
 * @param {string} selector - CSS selector string
 * @param {Element|Document} [context=document] - Optional root to search within
 * @returns {NodeList}
 */
const qsa = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Add an event listener and return a cleanup function.
 * Useful for components that may be torn down and re-initialised.
 *
 * @param {EventTarget} target  - Element or window/document
 * @param {string}      event   - Event name, e.g. 'click'
 * @param {Function}    handler - Callback function
 * @param {object}      [opts]  - addEventListener options
 * @returns {Function}          - Call to remove the listener
 */
const on = (target, event, handler, opts) => {
  target.addEventListener(event, handler, opts);
  return () => target.removeEventListener(event, handler, opts);
};

/**
 * Trap focus inside a given container element.
 * Used for modals, dropdowns, and other overlay components.
 * Call the returned cleanup function when the trap is no longer needed.
 *
 * @param {Element} container - The element to trap focus within
 * @returns {Function}        - Cleanup function to remove the trap
 */
function trapFocus(container) {
  const focusable = Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      // Shift+Tab: going backwards
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
}

/**
 * Debounce: delay invoking fn until after wait ms have elapsed
 * since the last invocation. Useful for scroll/resize handlers.
 *
 * @param {Function} fn   - Function to debounce
 * @param {number}   wait - Milliseconds to delay
 * @returns {Function}
 */
function debounce(fn, wait = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}


/* ============================================================
   2. DOM SELECTORS
   Centralised element references.
   Defined inside init() so they are guaranteed to exist.
   ============================================================ */
// (see init() below — selectors are declared there)


/* ============================================================
   3. MOBILE NAVIGATION
   Toggles the mobile menu open/closed.
   Updates aria-expanded and a CSS class on <nav>.
   ============================================================ */

/**
 * Initialise the mobile navigation toggle.
 * Looks for a button with [aria-controls] pointing to a nav list.
 */
function initMobileNav() {
  const nav    = qs('.site-nav');
  const toggle = qs('.nav-toggle', nav);

  if (!nav || !toggle) return; // Bail gracefully if elements don't exist

  let removeFocusTrap = null;

  function openMenu() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    // Trap focus inside the open nav on mobile
    removeFocusTrap = trapFocus(nav);
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    if (removeFocusTrap) {
      removeFocusTrap();
      removeFocusTrap = null;
    }
  }

  // Toggle on button click
  on(toggle, 'click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked (navigates to section)
  qsa('.nav-link', nav).forEach(link => {
    on(link, 'click', closeMenu);
  });

  // Close when clicking outside the nav
  on(document, 'click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus(); // Return focus to the trigger
    }
  });
}


/* ============================================================
   4. FOOTER YEAR
   Automatically keeps the copyright year current.
   ============================================================ */

/**
 * Insert the current year into #footer-year.
 */
function initFooterYear() {
  const el = qs('#footer-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}


/* ============================================================
   5. CONTACT FORM VALIDATION
   Client-side validation before submit.
   Returns true if valid, false if errors were found.
   ============================================================ */

/**
 * Simple email regex — good enough for client-side hints.
 * Server-side validation is always required for real security.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Show an error message for a given field.
 * @param {HTMLElement} input   - The input element
 * @param {string}      message - Error text to display
 */
function showFieldError(input, message) {
  const errorEl = qs(`#${input.getAttribute('aria-describedby')}`);
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  if (errorEl) errorEl.textContent = message;
}

/**
 * Clear the error state for a given field.
 * @param {HTMLElement} input - The input element
 */
function clearFieldError(input) {
  const errorEl = qs(`#${input.getAttribute('aria-describedby')}`);
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = '';
}

/**
 * Validate the contact form fields.
 * @param {HTMLFormElement} form
 * @returns {boolean} True if all fields are valid
 */
function validateContactForm(form) {
  let valid = true;

  const nameInput    = qs('#field-name',    form);
  const emailInput   = qs('#field-email',   form);
  const messageInput = qs('#field-message', form);

  // Clear previous errors
  [nameInput, emailInput, messageInput].forEach(clearFieldError);

  // Validate: name
  if (!nameInput.value.trim()) {
    showFieldError(nameInput, 'Please enter your full name.');
    valid = false;
  }

  // Validate: email
  if (!emailInput.value.trim()) {
    showFieldError(emailInput, 'Please enter your email address.');
    valid = false;
  } else if (!EMAIL_REGEX.test(emailInput.value.trim())) {
    showFieldError(emailInput, 'Please enter a valid email address.');
    valid = false;
  }

  // Validate: message
  if (!messageInput.value.trim()) {
    showFieldError(messageInput, 'Please enter a message.');
    valid = false;
  } else if (messageInput.value.trim().length < 10) {
    showFieldError(messageInput, 'Message must be at least 10 characters.');
    valid = false;
  }

  // Focus the first invalid field for accessibility
  if (!valid) {
    const firstInvalid = qs('.form-input.is-invalid', form);
    if (firstInvalid) firstInvalid.focus();
  }

  return valid;
}

/**
 * Show the form status message.
 * @param {HTMLElement} statusEl - The #form-status element
 * @param {'success'|'error'} type
 * @param {string} message
 */
function showFormStatus(statusEl, type, message) {
  statusEl.textContent = message;
  statusEl.className   = `form-status is-${type}`;
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Initialise the contact form.
 * Hooks validation to the submit event.
 * The actual submission is a placeholder — wire up to your backend
 * or a form service (Formspree, Netlify Forms, etc.) as needed.
 */
function initContactForm() {
  const form     = qs('#contact-form');
  if (!form) return;

  const statusEl = qs('#form-status', form);
  const submitBtn = qs('[type="submit"]', form);

  // Clear individual field errors as the user types
  qsa('.form-input', form).forEach(input => {
    on(input, 'input', () => clearFieldError(input));
  });

  on(form, 'submit', async (e) => {
    e.preventDefault();

    // Run validation; stop if invalid
    if (!validateContactForm(form)) return;

    // Disable the submit button to prevent double-submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      /*
       * REPLACE THIS BLOCK with your actual form submission logic.
       *
       * Examples:
       *   — Formspree: fetch('https://formspree.io/f/YOUR_ID', { method:'POST', ... })
       *   — Netlify:   Remove action="#", add netlify attribute to <form>
       *   — Custom:    fetch('/api/contact', { method:'POST', body: new FormData(form) })
       *
       * Simulating a successful async submit:
       */
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      // On success:
      showFormStatus(statusEl, 'success', 'Thanks! Your message has been sent.');
      form.reset();

    } catch (err) {
      // On error:
      console.error('[Form] Submission error:', err);
      showFormStatus(statusEl, 'error', 'Something went wrong. Please try again.');

    } finally {
      // Always re-enable the submit button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
}


/* ============================================================
   6. SMOOTH SCROLL FOR ANCHOR LINKS
   Provides smooth scrolling that accounts for the sticky header.
   Falls back gracefully if the target element is not found.
   ============================================================ */

/**
 * Calculate the height of the sticky header so we can
 * offset scroll targets by that amount.
 * @returns {number} Height in pixels
 */
function getStickyHeaderOffset() {
  const header = qs('.site-header');
  return header ? header.offsetHeight : 0;
}

/**
 * Bind click handlers to all same-page anchor links.
 * Scrolls smoothly to the target and updates focus.
 */
function initSmoothScroll() {
  on(document, 'click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href   = link.getAttribute('href');
    const target = qs(href);
    if (!target) return;

    e.preventDefault();

    const offset = getStickyHeaderOffset() + 16; // extra breathing room
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: targetY, behavior: 'smooth' });

    // Update URL without jumping
    history.pushState(null, '', href);

    // Move focus to the target section for keyboard users
    // (tabIndex=-1 allows focus without making it tab-able)
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    // Clean up tabindex after focus leaves
    on(target, 'blur', () => target.removeAttribute('tabindex'), { once: true });
  });
}


/* ============================================================
   7. ACTIVE NAV LINK HIGHLIGHTING
   Uses IntersectionObserver to highlight the nav link that
   corresponds to the currently visible section.
   ============================================================ */

/**
 * Watch sections with IDs and mark the corresponding nav link
 * as aria-current="page" when the section is in the viewport.
 */
function initActiveNav() {
  // Only sections that have an id can be tracked
  const sections = Array.from(qsa('section[id]'));
  const navLinks = Array.from(qsa('.nav-link[href^="#"]'));

  if (sections.length === 0 || navLinks.length === 0) return;

  const headerOffset = getStickyHeaderOffset();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
      });
    },
    {
      // Trigger when a section crosses into the viewport accounting for the sticky header
      rootMargin: `-${headerOffset + 1}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   8. INITIALISATION ENTRY POINT
   All feature modules are called from here.
   ============================================================ */

/**
 * Main initialisation function.
 * Called once the DOM is fully loaded.
 */
function init() {
  initFooterYear();
  initContactForm();

  // Log confirmation in development — remove or guard behind a flag for production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[App] Initialised successfully.');
  }
}

/*
  Wait for the DOM to be fully parsed before running init().
  'DOMContentLoaded' fires after HTML is parsed but before
  images/stylesheets are loaded — ideal for JS initialisation.
*/
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already ready (e.g. script loaded with defer/async)
  init();
}


/* ============================================================
   EXTENSION EXAMPLES
   The patterns below are NOT active — they are reference
   snippets you can copy and adapt when extending this file.
   ============================================================ */

/*
  --- EXAMPLE: LocalStorage persistence ---

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('[Storage] Write failed:', err);
    }
  }

  function loadFromStorage(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn('[Storage] Read failed:', err);
      return fallback;
    }
  }

  Usage:
    saveToStorage('user-preferences', { theme: 'dark' });
    const prefs = loadFromStorage('user-preferences', {});
*/


/*
  --- EXAMPLE: Fetch / API call helper ---

  async function fetchJSON(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  Usage:
    const data = await fetchJSON('https://api.example.com/items');
*/


/*
  --- EXAMPLE: Simple event bus (publish/subscribe) ---

  const bus = {
    _listeners: {},
    on(event, fn)   { (this._listeners[event] ??= []).push(fn); },
    off(event, fn)  { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn); },
    emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); },
  };

  Usage:
    bus.on('cart:updated', (cart) => renderCart(cart));
    bus.emit('cart:updated', { items: [...] });
*/


/*
  --- EXAMPLE: Dark mode toggle ---

  function initDarkMode() {
    const toggle = qs('#dark-mode-toggle');
    if (!toggle) return;

    const stored = loadFromStorage('color-scheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialScheme = stored || (prefersDark ? 'dark' : 'light');

    document.documentElement.dataset.colorScheme = initialScheme;
    toggle.setAttribute('aria-pressed', String(initialScheme === 'dark'));

    on(toggle, 'click', () => {
      const isDark = document.documentElement.dataset.colorScheme === 'dark';
      const next   = isDark ? 'light' : 'dark';
      document.documentElement.dataset.colorScheme = next;
      toggle.setAttribute('aria-pressed', String(next === 'dark'));
      saveToStorage('color-scheme', next);
    });
  }

  // Then add to CSS:
  //   [data-color-scheme="dark"] { --color-bg: #0f172a; --color-text: #f8fafc; }
*/
