import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import logo from "./kepler-logo.png";

const EASE = [0.16, 1, 0.3, 1];

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

const MENU_LINKS = [
  { label: "Download", href: "download.html" },
  { label: "Docs", href: "docs.html" },
  { label: "The Kepler story", href: "preview.html" },
  { label: "Classic site", href: "classic.html" },
  { label: "Donate", href: "https://buymeacoffee.com/signup", external: true },
];

function GridIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="3" cy="9" r="1.5" />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  );
}

function Navbar({ menuOpen, onMenu }) {
  return (
    <motion.nav
      className="nav"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="nav-left">
        <a className="logo" href="index.html" aria-label="Kepler home">
          <img className="logo-mark" src={logo} alt="" />
          <span className="brand">Kepler</span>
        </a>

        <button
          className="menu-btn"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={onMenu}
        >
          <span className="menu-icon">
            <motion.span
              style={{ display: "grid" }}
              animate={{ rotate: menuOpen ? 45 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Plus size={12} strokeWidth={3} />
            </motion.span>
          </span>
          <span className="menu-label">{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <div className="tags-pill">
          <span>Secure Browsing</span>
          <span>Built-in AI</span>
        </div>
      </div>

      <div className="nav-right">
        <a className="systems-pill" href="download.html">
          <span className="systems-btn">
            <GridIcon />
          </span>
          <span className="systems-label">Windows · macOS · Linux</span>
        </a>
      </div>
    </motion.nav>
  );
}

function Menu({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          className="menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <ul>
            {MENU_LINKS.map((l, i) => (
              <motion.li
                key={l.label}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease: EASE }}
              >
                <a
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener" } : {})}
                  onClick={onClose}
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </ul>
          <p className="menu-foot">Kepler · Free & open source · No trackers on this page</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="hero">
      <Navbar menuOpen={menuOpen} onMenu={() => setMenuOpen((o) => !o)} />
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <motion.div
        className="video-wrap"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <video className="video" src={VIDEO_URL} autoPlay muted loop playsInline />
      </motion.div>

      <motion.div
        className="footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: EASE }}
      >
        <div className="footer-left">
          <motion.p
            className="subtitle"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
          >
            <span className="dot" />
            The private, open-source browser · v0.9 beta
          </motion.p>

          <motion.h1
            className="heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
          >
            Browse Dark. Leave
            <br />
            No Trace. Anywhere.
          </motion.h1>

          <motion.div
            className="buttons"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: EASE }}
          >
            <a className="btn btn-dark" href="download.html">Download Kepler</a>
            <a className="btn btn-outline" href="preview.html">How It Works</a>
          </motion.div>
        </div>

        <div className="footer-right">
          <span className="tag">Sealed Tabs</span>
          <span className="tag">No Telemetry</span>
          <span className="tag">Open Source</span>
        </div>
      </motion.div>
    </main>
  );
}
