/* ==========================================================================
   Kepler — main.js
   Starfield, navigation, scroll reveals, counters, terminal typing, clipboard.
   Vanilla ES2020. No dependencies, no network calls, no analytics.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- toast */

  let toastTimer = null;

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  // Let other scripts (downloads.js) reuse it.
  window.Kepler = window.Kepler || {};
  window.Kepler.toast = toast;

  /* ----------------------------------------------------------- starfield */

  function starfield() {
    const canvas = $("#starfield");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let stars = [];
    let width = 0;
    let height = 0;
    let scrollY = window.scrollY;
    let raf = null;

    function seed() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area so phones don't get a blizzard.
      const count = Math.round((width * height) / 5200);
      stars = new Array(count).fill(0).map(() => {
        const depth = Math.random();           // 0 = far, 1 = near
        return {
          x: Math.random() * width,
          y: Math.random() * height * 2,       // extra height for parallax
          r: 0.25 + depth * 1.15,
          depth: depth,
          alpha: 0.18 + depth * 0.62,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.012
        };
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Nearer stars drift further as you scroll: cheap parallax.
        const y = (s.y - scrollY * (0.06 + s.depth * 0.22)) % (height * 2);
        const py = y < 0 ? y + height * 2 : y;
        if (py > height) continue;

        const flicker = reduceMotion ? 1 : 0.68 + 0.32 * Math.sin(s.twinkle + t * s.speed);
        ctx.globalAlpha = s.alpha * flicker;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
        ctx.fill();

        // A handful of the brightest stars get a soft bloom.
        if (s.depth > 0.93) {
          ctx.globalAlpha = s.alpha * flicker * 0.16;
          ctx.beginPath();
          ctx.arc(s.x, py, s.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    seed();
    raf = requestAnimationFrame(draw);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(seed, 160);
    });

    window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

    // Stop burning cycles when the tab is hidden.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    });
  }

  /* ---------------------------------------------------------------- nav */

  function nav() {
    const header = $("#header");
    const toggle = $("#navToggle");
    const links  = $("#navLinks");

    if (header) {
      const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 12);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        links.classList.toggle("is-open", !open);
      });

      links.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          toggle.setAttribute("aria-expanded", "false");
          links.classList.remove("is-open");
        }
      });
    }
  }

  /* ------------------------------------------------------------- reveals */

  function reveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------ counters */

  function counters() {
    const nums = $$("[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) {
      nums.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        io.unobserve(el);

        if (reduceMotion || target === 0) {
          el.textContent = target + suffix;
          return;
        }

        const started = performance.now();
        const dur = 1100;

        (function step(now) {
          const p = Math.min(1, (now - started) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(started);
      });
    }, { threshold: 0.5 });

    nums.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------ terminal */

  const TERM_LINES = [
    { cls: "prompt", text: "$ keplerctl verify ./kepler-0.9.0-linux-x86_64.tar.zst" },
    { cls: "muted",  text: "  reading detached signature ..." },
    { cls: "ok",     text: "  signature ok   key 9F2C4A118E70D3B5" },
    { cls: "ok",     text: "  digest    ok   matches public build log" },
    { cls: "muted",  text: "  rebuilt from commit a41f9c2 in 10m 51s" },
    { cls: "ok",     text: "  reproducible: yes" },
    { cls: "prompt", text: "$ " }
  ];

  function terminal() {
    const host = $("#term");
    if (!host) return;

    if (reduceMotion) {
      host.innerHTML = TERM_LINES
        .map((l) => '<span class="' + l.cls + '">' + l.text + "</span>")
        .join("\n");
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let current = null;

    const caret = document.createElement("span");
    caret.className = "caret";

    function tick() {
      if (lineIndex >= TERM_LINES.length) return;

      const line = TERM_LINES[lineIndex];

      if (!current) {
        current = document.createElement("span");
        current.className = line.cls;
        host.appendChild(current);
        host.appendChild(caret);
      }

      current.textContent = line.text.slice(0, ++charIndex);
      host.appendChild(caret); // keep the caret trailing

      if (charIndex >= line.text.length) {
        lineIndex++;
        charIndex = 0;
        current = null;
        if (lineIndex < TERM_LINES.length) host.insertBefore(document.createTextNode("\n"), caret);
        setTimeout(tick, 320);
        return;
      }

      // Prompt lines type like a human; output lines dump fast.
      setTimeout(tick, line.cls === "prompt" ? 26 + Math.random() * 40 : 7);
    }

    // Only start once the terminal is on screen.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          setTimeout(tick, 420);
        });
      }, { threshold: 0.35 });
      io.observe(host);
    } else {
      tick();
    }
  }

  /* ----------------------------------------------------------- clipboard */

  function clipboard() {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;

      const text = btn.getAttribute("data-copy");
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        const original = btn.textContent;
        btn.textContent = "Copied";
        toast("Copied to clipboard");
        setTimeout(() => { btn.textContent = original; }, 1600);
      } catch (err) {
        toast("Couldn't copy — select the text instead");
      }
    });
  }

  /* --------------------------------------------------- platform detection */

  function detectPlatform() {
    const ua = navigator.userAgent;
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
                     navigator.platform || "";
    const hay = (ua + " " + platform).toLowerCase();

    let os = "linux";
    if (/win/.test(hay)) os = "windows";
    else if (/mac|iphone|ipad|darwin/.test(hay)) os = "macos";
    else if (/android/.test(hay)) os = "android";
    else if (/linux|x11|cros/.test(hay)) os = "linux";

    let arch = "x86_64";
    if (/arm64|aarch64|iphone|ipad/.test(hay)) arch = "arm64";
    else if (/mac/.test(hay) && (navigator.maxTouchPoints || 0) > 1) arch = "arm64";

    return { os: os, arch: arch };
  }

  window.Kepler.detectPlatform = detectPlatform;

  /* ---------------------------------------------- hero button label + misc */

  function heroLabel() {
    const label = $("#heroDownloadLabel");
    if (!label) return;
    const names = { linux: "Linux", macos: "macOS", windows: "Windows", android: "Android" };
    const p = detectPlatform();
    label.textContent = "Download for " + (names[p.os] || "your system");
  }

  function cardGlow() {
    // Pointer-tracked radial highlight on feature cards.
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  function docsScrollSpy() {
    const links = $$("#docsNav a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) map.set(target, a);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        const active = map.get(entry.target);
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-20% 0px -65% 0px" });

    map.forEach((_, section) => io.observe(section));
  }

  function year() {
    $$("#year").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  /* ------------------------------------------------------------ bootstrap */

  function init() {
    starfield();
    nav();
    reveals();
    counters();
    terminal();
    clipboard();
    heroLabel();
    cardGlow();
    docsScrollSpy();
    year();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
