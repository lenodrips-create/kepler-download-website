/* ==========================================================================
   Kepler — downloads.js
   Renders the download page from a release manifest and keeps every button
   inert until real artifacts exist.

   >>> TO GO LIVE:
   1. Put your files in /releases/ next to this site.
   2. In MANIFEST below, set  available: true  and fill in `file`, `size`
      and `sha256` for each build you're shipping.
   3. That's it. Nothing else on the page needs touching.

   If the Rust release server (server/src/main.rs) is running, this script
   will prefer its live manifest at /api/releases and fall back to the
   hardcoded one below when the endpoint isn't reachable — so the page works
   as a plain static site too.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const toast = (msg) => (window.Kepler && window.Kepler.toast ? window.Kepler.toast(msg) : null);

  /* ------------------------------------------------------------- manifest */

  const MANIFEST = {
    version: "0.9.0",
    channel: "beta",
    released: "2026-09-22",
    builds: [
      {
        os: "linux",
        label: "Linux",
        note: "glibc 2.31+ · tar.zst",
        arches: ["x86_64", "arm64"],
        file: null,        // e.g. "kepler-0.9.0-linux-x86_64.tar.zst"
        size: null,        // e.g. "96.4 MB"
        sha256: null,      // e.g. "3f1a…"
        available: false   // <- flip to true when the artifact exists
      },
      {
        os: "macos",
        label: "macOS",
        note: "13 Ventura or newer · notarised .dmg",
        arches: ["arm64", "x86_64"],
        file: null,
        size: null,
        sha256: null,
        available: false
      },
      {
        os: "windows",
        label: "Windows",
        note: "10 and 11 · signed .msi",
        arches: ["x86_64", "arm64"],
        file: null,
        size: null,
        sha256: null,
        available: false
      },
      {
        os: "source",
        label: "Source tarball",
        note: "Build it yourself · tar.gz + .asc",
        arches: ["any"],
        file: null,
        size: null,
        sha256: null,
        available: false
      }
    ]
  };

  const ICONS = {
    linux:   '<path d="M12 3c2.2 0 3.4 1.8 3.4 4.2 0 1.7.6 2.6 1.6 4 1 1.4 1.7 2.6 1.7 4.1 0 2.6-2.4 4.7-6.7 4.7S5.3 17.9 5.3 15.3c0-1.5.7-2.7 1.7-4.1 1-1.4 1.6-2.3 1.6-4C8.6 4.8 9.8 3 12 3z"/><path d="M10.3 8.2h.01M13.7 8.2h.01"/>',
    macos:   '<path d="M16 3c-1.2.1-2.6.9-3.4 1.9-.7.9-1.3 2.2-1.1 3.5 1.3.1 2.7-.7 3.5-1.7.8-1 1.3-2.3 1-3.7z"/><path d="M19.4 16.6c-.6 1.4-.9 2-1.7 3.2-1.1 1.7-2.6 3.8-4.5 3.8-1.7 0-2.1-1.1-4.4-1.1-2.3 0-2.8 1.1-4.4 1.1-1.9 0-3.3-1.9-4.4-3.6"/>',
    windows: '<path d="M3 6.2l7.6-1v7.1H3zM12.2 4.9L21 3.7v8.6h-8.8zM3 13.9h7.6V21L3 19.9zM12.2 13.9H21v8.4l-8.8-1.2z"/>',
    source:  '<path d="M9 18l-5-6 5-6M15 6l5 6-5 6"/>'
  };

  const OS_NAMES = { linux: "Linux", macos: "macOS", windows: "Windows", android: "Android" };

  /* ------------------------------------------------------------- helpers */

  function pendingMessage(build) {
    return build.label + " build isn't attached yet — add the artifact and flip " +
           "`available` to true in downloads.js.";
  }

  function trigger(build, arch) {
    if (!build.available || !build.file) {
      toast(pendingMessage(build));
      return;
    }
    // Real artifacts live under /releases/. Nothing is fetched until then.
    const name = build.file.replace("{arch}", arch);
    const a = document.createElement("a");
    a.href = "releases/" + name;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Downloading " + name);
  }

  /* --------------------------------------------------------- render cards */

  function renderCards(manifest, detected) {
    const grid = $("#dlGrid");
    if (!grid) return;
    grid.innerHTML = "";

    manifest.builds.forEach((build) => {
      const card = document.createElement("article");
      card.className = "dl-card";
      if (build.os === detected.os) card.classList.add("is-recommended");

      let selected = build.arches.includes(detected.arch) ? detected.arch : build.arches[0];

      const header = document.createElement("header");
      header.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[build.os] || ICONS.source) + "</svg>" +
        "<h3>" + build.label + "</h3>" +
        (build.os === detected.os ? '<span class="badge">Your system</span>' : "");
      card.appendChild(header);

      const meta = document.createElement("p");
      meta.className = "os-meta";
      meta.textContent = build.note;
      card.appendChild(meta);

      const status = document.createElement("p");
      status.className = "os-meta";
      status.textContent = build.available
        ? (build.size ? build.size + " · v" + manifest.version : "v" + manifest.version)
        : "Awaiting artifact";
      status.style.color = build.available ? "" : "var(--ink-faint)";
      card.appendChild(status);

      // Architecture chips
      if (build.arches.length > 1) {
        const row = document.createElement("div");
        row.className = "arch-row";
        build.arches.forEach((arch) => {
          const chip = document.createElement("button");
          chip.className = "chip";
          chip.type = "button";
          chip.textContent = arch;
          chip.setAttribute("aria-pressed", String(arch === selected));
          chip.addEventListener("click", () => {
            selected = arch;
            row.querySelectorAll(".chip").forEach((c) =>
              c.setAttribute("aria-pressed", String(c.textContent === arch)));
          });
          row.appendChild(chip);
        });
        card.appendChild(row);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn" + (build.os === detected.os ? " btn-solid" : "") +
                      (build.available ? "" : " is-locked");
      btn.style.marginTop = "6px";
      btn.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>' +
        "<span>" + (build.available ? "Download" : "Not yet available") + "</span>";
      btn.addEventListener("click", () => trigger(build, selected));
      card.appendChild(btn);

      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------- primary banner */

  function renderPrimary(manifest, detected) {
    const tag   = $("#detectedTag");
    const title = $("#primaryTitle");
    const sub   = $("#primarySub");
    const btn   = $("#primaryBtn");
    const label = $("#primaryBtnLabel");
    const meta  = $("#primaryMeta");
    if (!btn) return;

    const build = manifest.builds.find((b) => b.os === detected.os);
    const osName = OS_NAMES[detected.os] || "your system";

    if (tag)   tag.textContent = "Detected · " + osName + " · " + detected.arch;
    if (title) title.textContent = "Kepler for " + osName;

    if (!build) {
      if (sub)   sub.textContent = "We don't ship a build for this platform yet — the source tarball is your route in.";
      if (label) label.textContent = "Build from source";
      if (meta)  meta.textContent = "v" + manifest.version + " " + manifest.channel;
      btn.classList.add("is-locked");
      btn.addEventListener("click", () => toast("No prebuilt binary for this platform yet."));
      return;
    }

    if (sub) {
      sub.textContent = build.available
        ? build.note + " · " + (build.size || "size pending")
        : "The " + osName + " artifact hasn't been attached yet. Everything else on this page is live.";
    }

    if (label) label.textContent = build.available ? "Download for " + osName : "Not yet available";
    if (meta)  meta.textContent = "v" + manifest.version + " " + manifest.channel +
                                  " · released " + manifest.released +
                                  (build.available ? "" : " · pending");
    if (!build.available) btn.classList.add("is-locked");

    const arch = build.arches.includes(detected.arch) ? detected.arch : build.arches[0];
    btn.addEventListener("click", () => trigger(build, arch));
  }

  /* --------------------------------------------------------- checksum row */

  function renderChecksums(manifest) {
    const body = $("#sumTable");
    if (!body) return;
    body.innerHTML = "";

    manifest.builds.forEach((build) => {
      build.arches.forEach((arch) => {
        const tr = document.createElement("tr");

        const name = build.file
          ? build.file.replace("{arch}", arch)
          : "kepler-" + manifest.version + "-" + build.os + "-" + arch;

        tr.innerHTML =
          "<td>" + name + "</td>" +
          "<td>" + (build.size || "—") + "</td>" +
          '<td class="mono" style="word-break:break-all">' + (build.sha256 || "—") + "</td>" +
          "<td>" + (build.available
            ? '<span style="color:var(--ink)">published</span>'
            : '<span style="color:var(--ink-faint)">pending</span>') + "</td>";

        body.appendChild(tr);
      });
    });
  }

  /* ------------------------------------------------------------ bootstrap */

  async function loadManifest() {
    // Prefer the live manifest from the Rust server; fall back to the static one.
    try {
      const res = await fetch("/api/releases", { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.builds)) return data;
      }
    } catch (_) {
      /* static site — expected */
    }
    return MANIFEST;
  }

  async function init() {
    const detected = (window.Kepler && window.Kepler.detectPlatform)
      ? window.Kepler.detectPlatform()
      : { os: "linux", arch: "x86_64" };

    const manifest = await loadManifest();

    renderPrimary(manifest, detected);
    renderCards(manifest, detected);
    renderChecksums(manifest);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
