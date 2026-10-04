import { motion } from "motion/react";
import { Plus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="8" width="11" height="6" rx="3" transform="rotate(-35 8.5 11)" />
      <rect x="10" y="10" width="11" height="6" rx="3" transform="rotate(-35 15.5 13)" />
    </svg>
  );
}

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

function Navbar() {
  return (
    <motion.nav
      className="nav"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="nav-left">
        <a className="logo" href="#" aria-label="NeuralKinetics home">
          <LogoMark />
          <span className="brand">NeuralKinetics</span>
        </a>

        <button className="menu-btn" type="button">
          <span className="menu-icon">
            <Plus size={12} strokeWidth={3} />
          </span>
          <span className="menu-label">Menu</span>
        </button>

        <div className="tags-pill">
          <span>Advanced Bionics</span>
          <span>Cognitive AI</span>
        </div>
      </div>

      <div className="nav-right">
        <div className="systems-pill">
          <button className="systems-btn" type="button" aria-label="Adaptive Systems">
            <GridIcon />
          </button>
          <span className="systems-label">Adaptive Systems</span>
        </div>
      </div>
    </motion.nav>
  );
}

export default function App() {
  return (
    <main className="hero">
      <Navbar />

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
            Best digital banking card 2026
          </motion.p>

          <motion.h1
            className="heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
          >
            One Card, Zero
            <br />
            Limits. Worldwide.
          </motion.h1>

          <motion.div
            className="buttons"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: EASE }}
          >
            <a className="btn btn-dark" href="#">See Features</a>
            <a className="btn btn-outline" href="#">How It Works</a>
          </motion.div>
        </div>

        <div className="footer-right">
          <span className="tag">Neuromorphic</span>
          <span className="tag">AGI</span>
          <span className="tag">Cybernetics</span>
        </div>
      </motion.div>
    </main>
  );
}
