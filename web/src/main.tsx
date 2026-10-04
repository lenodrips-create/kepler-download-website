import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import KeplerSpread from "@/islands/kepler-spread";
import "./index.css";

// Each island mounts into a placeholder element in the static HTML.
const islands = {
  "stack-spread": KeplerSpread,
} as const;

for (const [name, Island] of Object.entries(islands)) {
  document.querySelectorAll<HTMLElement>(`[data-island="${name}"]`).forEach((el) => {
    createRoot(el).render(
      <StrictMode>
        <Island />
      </StrictMode>,
    );
  });
}
