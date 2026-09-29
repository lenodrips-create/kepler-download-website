/* ==========================================================================
   Kepler — downloads.js
   Renders the download page from a release manifest and keeps every button
   inert until real artifacts exist.

   Downloads are served straight from the GitHub release tagged "latest" in
   lenodrips-create/kepler (built by that repo's Actions workflow). Clicking a
   button starts the file download on this page — visitors never see GitHub.
   When a new build is published, the same links serve the new files, so
   nothing here needs editing.

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

  const RELEASE_BASE = "https://github.com/lenodrips-create/kepler/releases/download/latest/";
  const SOURCE_URL   = "https://github.com/lenodrips-create/kepler/archive/refs/heads/main.zip";

  // `files` maps an architecture to the asset name in the GitHub release.
  const MANIFEST = {
    version: "0.9.0",
    channel: "beta",
    released: null,
    builds: [
      {
        os: "linux",
        label: "Linux",
        note: "Ubuntu 24.04+ and Debian-based · .deb",
        arches: ["x86_64"],
        archLabels: { x86_64: "x86_64 (amd64)" },
        files: { x86_64: RELEASE_BASE + "Kepler-linux-amd64.deb" },
        size: null,
        sha256: null,
        available: true
      },
      {
        os: "macos",
        label: "macOS",
        note: "Zip · drag to Applications, then right-click → Open",
        arches: ["arm64", "x86_64"],
        archLabels: { arm64: "Apple Silicon (M1–M4)", x86_64: "Intel" },
        files: {
          arm64:  RELEASE_BASE + "Kepler-mac-apple-silicon.zip",
          x86_64: RELEASE_BASE + "Kepler-mac-intel.zip"
        },
        size: null,
        sha256: null,
        available: true
      },
      {
        os: "windows",
        label: "Windows",
        note: "Zip · extract, then run Kepler.exe",
        arches: ["x86_64"],
        archLabels: { x86_64: "x86_64 (64-bit)" },
        files: { x86_64: RELEASE_BASE + "Kepler-windows.zip" },
        size: null,
        sha256: null,
        available: true
      },
      {
        os: "source",
        label: "Source code",
        note: "Build it yourself · zip",
        arches: ["any"],
        archLabels: { any: "any" },
        files: { any: SOURCE_URL },
        size: null,
        sha256: null,
        available: true
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
    return build.label + " build isn't available yet.";
  }

  function fileFor(build, arch) {
    return (build.files && (build.files[arch] || build.files[build.arches[0]])) || null;
  }

  function fileName(url) {
    return url.split("/").pop();
  }

  function archLabel(build, arch) {
    return (build.archLabels && build.archLabels[arch]) || arch;
  }

  // Browsers can't tell Apple Silicon from Intel Macs (both report "Intel"),
  // so Macs default to Apple Silicon, the common case, and Intel is one click away.
  function defaultArch(build, detected) {
    if (build.os === "macos") return "arm64";
    return build.arches.includes(detected.arch) ? detected.arch : build.arches[0];
  }

  function trigger(build, arch) {
    const url = fileFor(build, arch);
    if (!build.available || !url) {
      toast(pendingMessage(build));
      return;
    }
    // GitHub serves release assets as attachments, so this downloads in place
    // and the visitor stays on this page.
    const name = fileName(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
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

      let selected = defaultArch(build, detected);

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
        : "Coming soon";
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
          chip.textContent = archLabel(build, arch);
          chip.dataset.arch = arch;
          chip.setAttribute("aria-pressed", String(arch === selected));
          chip.addEventListener("click", () => {
            selected = arch;
            row.querySelectorAll(".chip").forEach((c) =>
              c.setAttribute("aria-pressed", String(c.dataset.arch === arch)));
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

    if (tag)   tag.textContent = "Detected · " + osName +
                                 (detected.os === "macos" ? "" : " · " + detected.arch);
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
        ? build.note + (build.size ? " · " + build.size : "") +
          (build.os === "macos" ? " · Apple Silicon build. Older Intel Mac? Pick Intel in the list below." : "")
        : "The " + osName + " artifact hasn't been attached yet. Everything else on this page is live.";
    }

    if (label) label.textContent = build.available ? "Download for " + osName : "Not yet available";
    if (meta)  meta.textContent = "v" + manifest.version + " " + manifest.channel +
                                  (manifest.released ? " · released " + manifest.released : "") +
                                  (build.available ? "" : " · pending");
    if (!build.available) btn.classList.add("is-locked");

    const arch = defaultArch(build, detected);
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

        const url  = fileFor(build, arch);
        const name = url ? fileName(url) : "kepler-" + manifest.version + "-" + build.os + "-" + arch;

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
