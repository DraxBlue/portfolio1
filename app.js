/* ==========================================================================
   DEV/AI PORTFOLIO — SITE LOGIC
   Никакого бэкенда: тема и язык живут в localStorage,
   "чат" собирает сообщение и открывает диалог в Telegram.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Config: поменяйте под себя ---------- */
  var CONFIG = {
    telegramUsername: "Temir_ai",
    telegramUrl: "https://t.me/Temir_ai"
  };

  var root = document.documentElement;
  var body = document.body;

  /* ---------- Theme ---------- */
  function initTheme() {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      root.setAttribute("data-theme", saved);
    } else {
      var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      root.setAttribute("data-theme", prefersLight ? "light" : "dark");
    }
  }

  function toggleTheme() {
    var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  /* ---------- Language ---------- */
  function initLang() {
    var saved = localStorage.getItem("lang");
    var lang = saved === "en" || saved === "ru" ? saved : "ru";
    applyLang(lang);
  }

  function applyLang(lang) {
    body.classList.remove("lang-ru", "lang-en");
    body.classList.add("lang-" + lang);
    root.setAttribute("lang", lang);
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.textContent = lang === "ru" ? "EN" : "RU";
    });
    var t = document.querySelector("title[data-title-" + lang + "]");
    document.querySelectorAll("meta[data-desc-ru], meta[data-desc-en]").forEach(function () {});
    var titleTag = document.querySelector("title");
    if (titleTag && titleTag.dataset["title" + (lang === "ru" ? "Ru" : "En")]) {
      titleTag.textContent = titleTag.dataset["title" + (lang === "ru" ? "Ru" : "En")];
    }
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.dataset["desc" + (lang === "ru" ? "Ru" : "En")]) {
      metaDesc.setAttribute("content", metaDesc.dataset["desc" + (lang === "ru" ? "Ru" : "En")]);
    }
  }

  function toggleLang() {
    var current = body.classList.contains("lang-en") ? "en" : "ru";
    var next = current === "ru" ? "en" : "ru";
    applyLang(next);
    localStorage.setItem("lang", next);
  }

  /* ---------- Nav scroll state ---------- */
  function initNavScroll() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    function update() {
      if (window.scrollY > 12) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var burger = document.querySelector(".burger");
    var menu = document.querySelector(".mobile-menu");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      body.style.overflow = menu.classList.contains("open") ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach(function (el, i) {
      el.style.setProperty("--i", i % 6);
      observer.observe(el);
    });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".faq-item").forEach(function (el) {
          el.classList.remove("open");
        });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  /* ---------- Telegram links ---------- */
  function initTelegramLinks() {
    document.querySelectorAll("[data-telegram-link]").forEach(function (a) {
      a.setAttribute("href", CONFIG.telegramUrl);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    document.querySelectorAll("[data-telegram-user]").forEach(function (el) {
      el.textContent = "@" + CONFIG.telegramUsername;
    });
  }

  /* ---------- Chat widget (imitация — открывает Telegram с готовым текстом) ---------- */
  function initChatWidget() {
    var toggleBtn = document.querySelector("[data-chat-toggle]");
    var panel = document.querySelector("[data-chat-panel]");
    var closeBtn = document.querySelector("[data-chat-close]");
    var form = document.querySelector("[data-chat-form]");
    var input = document.querySelector("[data-chat-input]");
    if (!toggleBtn || !panel) return;

    function open() { panel.classList.add("open"); setTimeout(function () { input && input.focus(); }, 150); }
    function close() { panel.classList.remove("open"); }

    toggleBtn.addEventListener("click", function () {
      panel.classList.contains("open") ? close() : open();
    });
    closeBtn && closeBtn.addEventListener("click", close);

    document.addEventListener("click", function (e) {
      if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) close();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = (input.value || "").trim();
        if (!text) return;
        var url = CONFIG.telegramUrl + "?text=" + encodeURIComponent(text);
        window.open(url, "_blank", "noopener,noreferrer");
        input.value = "";
      });
    }
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Wire up toggles ---------- */
  function initControls() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleTheme);
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleLang);
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ---------- Init ---------- */
  initTheme();
  initLang();

  document.addEventListener("DOMContentLoaded", function () {
    initNavScroll();
    initMobileMenu();
    initReveal();
    initCounters();
    initFaq();
    initTelegramLinks();
    initChatWidget();
    initYear();
    initControls();
    initActiveNav();
  });
})();
