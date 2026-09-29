# Kepler — website

Marketing and download site for **Kepler**, a secure browser for developers.
Black-and-white space theme, built from the provided planet logo.

Structure loosely follows the Tor Project site: hero → feature cards → stats →
deep-dive splits → verification → FAQ → CTA, with a dedicated download page.

```
kepler/
├── index.html              Overview / landing page
├── download.html           Download page (buttons inert until artifacts exist)
├── docs.html               Architecture, build, protocol, changelog, disclosure
├── assets/
│   ├── css/style.css       The whole design system
│   ├── js/main.js          Starfield, nav, reveals, counters, terminal, clipboard
│   ├── js/downloads.js     Renders the download page from the release manifest
│   └── img/                Logo (transparent), favicon, original upload
├── releases/               Drop your binaries here
└── server/                 Rust release server
    ├── Cargo.toml
    └── src/
        ├── main.rs         Static file server + /api/releases, zero dependencies
        └── releases.rs     The release manifest and its JSON serialiser
```

## Run it

Plain static (open `index.html`), or with the Rust server:

```bash
cd server
cargo run -- --serve 8080 --root ..
# http://127.0.0.1:8080
```

Other flags:

```bash
cargo run -- --manifest    # print the release JSON and exit
cargo run -- --help
cargo test                 # 6 tests: path traversal, decoding, manifest safety
```

## Turning downloads on

Nothing downloads right now — by design. Every button shows
"Not yet available" and the checksum table reads `pending`.

When you have binaries:

1. Put the files in `releases/`.
2. Edit **one** of these (whichever you're serving from):
   - `assets/js/downloads.js` → the `MANIFEST` constant, or
   - `server/src/releases.rs` → the `manifest()` function.
3. For each build set `available: true` and fill in `file`, `size`, `sha256`.
   In `file`, `{arch}` is substituted per architecture, e.g.
   `"kepler-0.9.0-linux-{arch}.tar.zst"`.

That's the only change. Buttons, the primary banner, and the checksum table all
read from the same manifest.

A build is only ever offered when it is `available` **and** has a checksum —
`Build::is_downloadable()` enforces that, and there's a test to keep it honest.
When the Rust server is running, `downloads.js` prefers its live
`/api/releases` and falls back to the static manifest otherwise.

## Notes

- No trackers, no analytics, no third-party scripts except Google Fonts.
- Respects `prefers-reduced-motion` — starfield twinkle, typing and counters all
  settle to static.
- The server refuses `..` in paths, caps request sizes, and sets `nosniff`,
  `no-referrer` and a same-origin COOP header.
- Domains, emails and PGP fingerprints in the copy are placeholders
  (`example.invalid`) — swap them before going live.
