/* ==========================================================================
   Kepler — cine.js
   Turns page scroll into a film. The stage is fixed; a tall spacer (#track)
   provides the scroll distance. Each scene holds for a while, then the next
   one arrives through a scroll-scrubbed transition (cloth, pixels, zoom).
   Vanilla JS, no dependencies.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scenes = $$(".scene");
  const track  = $("#track");
  const cloth  = $(".t-cloth");
  const clothI = $(".t-cloth i");
  const pixels = $(".t-pixels");
  const hint   = $(".c-hint");
  const dots   = $(".c-dots");

  // Transition used to go from scene i to scene i + 1.
  const TRANSITIONS = ["cloth", "pixels", "zoom", "cloth", "pixels"];
  const HOLD = 0.42;           // share of each step where the scene just sits
  const STEP_VH = 110;         // scroll distance per scene, in vh

  /* -------------------------------------------------- split headline words */

  $$("[data-words]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w, i) =>
      '<span class="wm" aria-hidden="true"><span class="ww" style="--i:' + i + '">' + w + "</span></span>"
    ).join(" ");
  });

  /* ------------------------------------------------------------ dots nav */

  scenes.forEach((sc, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", sc.dataset.label || "Section " + (i + 1));
    b.addEventListener("click", () => goTo(i));
    dots.appendChild(b);
  });
  const dotBtns = $$("button", dots);

  function stepPx() { return (innerHeight * STEP_VH) / 100; }

  function goTo(i) {
    window.scrollTo({ top: i * stepPx(), behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------------------------------------------------------- pixel grid */

  let cells = [];
  function buildPixels() {
    const size = innerWidth < 700 ? 34 : 54;
    const cols = Math.ceil(innerWidth / size);
    const rows = Math.ceil(innerHeight / size);
    pixels.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    pixels.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    pixels.innerHTML = "";
    cells = [];
    for (let n = 0; n < cols * rows; n++) {
      const b = document.createElement("b");
      pixels.appendChild(b);
      // Threshold with a little left-to-right bias so it sweeps, not just noise.
      const col = n % cols;
      cells.push({ el: b, r: clamp(Math.random() * 0.75 + (col / cols) * 0.25, 0, 1), on: false });
    }
  }

  /* -------------------------------------------------------------- layout */

  function size() {
    track.style.height = (scenes.length - 1) * STEP_VH + 100 + "vh";
    buildPixels();
    render();
  }

  /* -------------------------------------------------------------- render */

  let lastActive = -1;

  function setScene(sc, { visible, opacity = 1, transform = "", p = 0 }) {
    sc.classList.toggle("is-visible", visible);
    sc.style.opacity = visible ? String(opacity) : "";
    sc.style.transform = visible ? transform : "";
    sc.style.setProperty("--p", p.toFixed(4));
  }

  function render() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const s = clamp(scrollY / max, 0, 1) * (scenes.length - 1);   // 0 … n-1
    const i = Math.min(Math.floor(s), scenes.length - 2);
    const f = s - i;
    const t = reduce ? (f > 0.5 ? 1 : 0) : clamp((f - HOLD) / (1 - HOLD), 0, 1);
    const type = TRANSITIONS[i] || "zoom";
    const te = ease(t);

    // Local progress per scene, used by CSS for drift/parallax (--p).
    const localP = (k) => clamp((s - k + 0.6) / 1.6, 0, 1);

    scenes.forEach((sc, k) => {
      if (k !== i && k !== i + 1) setScene(sc, { visible: false, p: localP(k) });
    });

    const cur = scenes[i];
    const next = scenes[i + 1];
    let showCur = true, showNext = false;
    let curOpacity = 1, nextOpacity = 1, curTf = "", nextTf = "";

    cloth.classList.remove("is-on");
    pixels.style.visibility = "hidden";

    if (t > 0 && t < 1) {
      if (type === "zoom") {
        showNext = true;
        curOpacity = 1 - te;
        nextOpacity = te;
        curTf = "scale(" + (1 + te * 0.35) + ")";
        nextTf = "scale(" + (1.18 - te * 0.18) + ")";
      } else if (type === "cloth") {
        // A sheet of fabric sweeps right-to-left; the scene swaps under it.
        cloth.classList.add("is-on");
        const x = 115 - t * 230;                       // vw: off right → off left
        clothI.style.transform = "translateX(" + x + "vw) skewX(" + (-8 + t * 16) + "deg)";
        showCur = t < 0.5;
        showNext = t >= 0.5;
        curTf = "translateX(" + (-te * 6) + "vw)";
        nextTf = "translateX(" + ((1 - te) * 6) + "vw)";
      } else if (type === "pixels") {
        // Blocks of the next scene's colour fill in, swap, then clear away.
        pixels.style.visibility = "visible";
        const color = next.dataset.bg || "#000";
        const phase1 = t < 0.5;
        const k = phase1 ? t * 2 : (t - 0.5) * 2;
        showCur = phase1;
        showNext = !phase1;
        for (const c of cells) {
          const on = phase1 ? c.r < k : c.r >= k;
          if (on !== c.on) {
            c.on = on;
            c.el.style.opacity = on ? "1" : "0";
          }
          c.el.style.background = color;
        }
      }
    } else if (t >= 1) {
      showCur = false;
      showNext = true;
    }

    setScene(cur, { visible: showCur, opacity: curOpacity, transform: curTf, p: localP(i) });
    setScene(next, { visible: showNext, opacity: nextOpacity, transform: nextTf, p: localP(i + 1) });

    // Which scene "owns" the screen right now
    const active = t >= 0.5 ? i + 1 : i;
    if (active !== lastActive) {
      lastActive = active;
      scenes.forEach((sc, k) => sc.classList.toggle("is-active", k === active));
      dotBtns.forEach((b, k) => b.classList.toggle("is-on", k === active));
      const light = scenes[active].classList.contains("tone-light");
      document.body.dataset.tone = light ? "dark-on-light" : "light-on-dark";
      $("#stage").style.background = scenes[active].dataset.bg || "";
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", scenes[active].dataset.bg || "#1c56dc");
    }

    if (hint) hint.classList.toggle("is-gone", scrollY > 40);
  }

  /* ------------------------------------------------------------ keyboard */

  window.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goTo(Math.min(lastActive + 1, scenes.length - 1)); }
    if (e.key === "ArrowUp" || e.key === "PageUp")     { e.preventDefault(); goTo(Math.max(lastActive - 1, 0)); }
  });

  /* ----------------------------------------------------------- bootstrap */

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  }, { passive: true });
  window.addEventListener("resize", size);

  size();
})();
