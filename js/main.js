(function () {
  "use strict";

  /* ==========================================================================
     Contact email — update in ONE place before publishing
     ========================================================================== */
  var CONTACT_EMAIL = "afik.contact@example.com";

  document.querySelectorAll("[data-email-link]").forEach(function (el) {
    el.setAttribute("href", "mailto:" + CONTACT_EMAIL);
  });
  document.querySelectorAll("[data-email-text]").forEach(function (el) {
    el.textContent = CONTACT_EMAIL;
  });

  /* ==========================================================================
     Sticky header — compact state on scroll
     ========================================================================== */
  var siteHeader = document.getElementById("siteHeader");
  var lastScrolled = false;
  function onScroll() {
    // Hysteresis (different on/off thresholds) so hovering near one value can't flip the class back and forth.
    var scrolled = lastScrolled ? window.scrollY > 12 : window.scrollY > 32;
    if (scrolled !== lastScrolled) {
      siteHeader.classList.toggle("is-scrolled", scrolled);
      lastScrolled = scrolled;
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ==========================================================================
     Mobile navigation
     ========================================================================== */
  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var mobileNav = document.getElementById("mobileNav");

  function openMobileNav() {
    mobileNav.classList.add("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.setAttribute("aria-label", "סגירת תפריט ניווט");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "פתיחת תפריט ניווט");
    document.body.style.overflow = "";
  }
  hamburgerBtn.addEventListener("click", function () {
    var isOpen = mobileNav.classList.contains("is-open");
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
      var firstLink = mobileNav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });
  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMobileNav();
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
      closeMobileNav();
      hamburgerBtn.focus();
    }
  });

  /* ==========================================================================
     Reveal-on-scroll
     ========================================================================== */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ==========================================================================
     Accessibility panel
     ========================================================================== */
  var a11yToggle = document.getElementById("a11yToggle");
  var a11yPanel = document.getElementById("a11yPanel");
  var a11yClose = document.getElementById("a11yClose");
  var root = document.documentElement;

  var STORAGE_KEY = "afik-a11y-settings";
  var FONT_MIN = 0.85, FONT_MAX = 1.4, FONT_STEP = 0.1;

  var state = {
    fontScale: 1,
    contrast: false,
    underline: false,
    stopAnim: false
  };

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === "object") {
        state.fontScale = typeof saved.fontScale === "number" ? saved.fontScale : 1;
        state.contrast = !!saved.contrast;
        state.underline = !!saved.underline;
        state.stopAnim = !!saved.stopAnim;
      }
    } catch (err) { /* ignore corrupted storage */ }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* storage unavailable */ }
  }

  function applyState() {
    root.style.setProperty("--font-scale", state.fontScale.toFixed(2));
    root.classList.toggle("a11y-high-contrast", state.contrast);
    root.classList.toggle("a11y-underline-links", state.underline);
    root.classList.toggle("a11y-stop-animations", state.stopAnim);

    setPressed("contrast", state.contrast);
    setPressed("underline", state.underline);
    setPressed("stop-anim", state.stopAnim);
  }

  function setPressed(action, value) {
    var btn = a11yPanel.querySelector('[data-action="' + action + '"]');
    if (btn) btn.setAttribute("aria-pressed", String(value));
  }

  function openPanel() {
    a11yPanel.classList.add("is-open");
    a11yToggle.setAttribute("aria-expanded", "true");
    a11yToggle.setAttribute("aria-label", "סגירת אפשרויות נגישות");
  }
  function closePanel() {
    a11yPanel.classList.remove("is-open");
    a11yToggle.setAttribute("aria-expanded", "false");
    a11yToggle.setAttribute("aria-label", "אפשרויות נגישות");
  }

  a11yToggle.addEventListener("click", function () {
    var isOpen = a11yPanel.classList.contains("is-open");
    if (isOpen) { closePanel(); } else { openPanel(); a11yClose.focus(); }
  });
  a11yClose.addEventListener("click", function () {
    closePanel();
    a11yToggle.focus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && a11yPanel.classList.contains("is-open")) {
      closePanel();
      a11yToggle.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (
      a11yPanel.classList.contains("is-open") &&
      !a11yPanel.contains(e.target) &&
      !a11yToggle.contains(e.target)
    ) {
      closePanel();
    }
  });

  a11yPanel.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");

    switch (action) {
      case "font-inc":
        state.fontScale = Math.min(FONT_MAX, +(state.fontScale + FONT_STEP).toFixed(2));
        break;
      case "font-dec":
        state.fontScale = Math.max(FONT_MIN, +(state.fontScale - FONT_STEP).toFixed(2));
        break;
      case "contrast":
        state.contrast = !state.contrast;
        break;
      case "underline":
        state.underline = !state.underline;
        break;
      case "stop-anim":
        state.stopAnim = !state.stopAnim;
        break;
      case "reset":
        state = { fontScale: 1, contrast: false, underline: false, stopAnim: false };
        break;
      default:
        return;
    }
    applyState();
    saveState();
  });

  loadState();
  applyState();
})();
