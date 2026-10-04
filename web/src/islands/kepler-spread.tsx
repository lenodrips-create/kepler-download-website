import { useEffect, useState } from "react";
import StackSpread, {
  CARDS,
  type StackSpreadItem,
} from "@/components/ui/stack-spread";

// Same choreography as the stock component, re-skinned with Kepler's own
// imagery (served locally, so the page still loads nothing third-party).
// Order matches CARDS: back of the stack -> front.
const IMG = "assets/img/spread";
const ITEMS: StackSpreadItem[] = [
  { src: `${IMG}/secure-mode.jpg`, alt: "Kepler's Secure browsing toggle above the planet logo" },
  { src: `${IMG}/ai-panel.jpg`, alt: "The built-in AI side panel open on Claude" },
  { src: `${IMG}/mask-card.jpg`, alt: "A white mask on black, for anonymity" },
  { src: `${IMG}/start.jpg`, alt: "Kepler start page with search and shortcut tiles" },
  { src: `${IMG}/rocket-card.jpg`, alt: "A rocket lifting off" },
  { src: `${IMG}/github.jpg`, alt: "GitHub's homepage rendered in Kepler" },
  { src: `${IMG}/logo.jpg`, alt: "The Kepler planet logo" },
  { src: `${IMG}/planet.jpg`, alt: "Artist's impression of exoplanet Kepler-22b" },
];

// The top row lands a few vh lower than stock so it clears the fixed header.
const KEPLER_CARDS = CARDS.map((card, i) => ({
  ...card,
  item: ITEMS[i],
  target: card.target.y < -25 ? { ...card.target, y: card.target.y + 5 } : card.target,
  targetSm:
    card.targetSm && card.targetSm.y < -30
      ? { ...card.targetSm, y: card.targetSm.y + 4 }
      : card.targetSm,
}));

const FALLBACK: Record<string, string> = {
  "spread.title": 'Leave <span class="opacity-60">no</span> trace.',
  "spread.sub":
    "Sealed tabs, a flattened fingerprint, and a build you can verify byte for byte.",
  "spread.hint": "Scroll",
};

type KeplerGlobal = { Kepler?: { t?: (key: string) => string | undefined } };

// Strings come from assets/js/i18n.js so the language picker covers them too.
function useKeplerStrings() {
  const read = () => {
    const t = (window as unknown as KeplerGlobal).Kepler?.t;
    const get = (key: string) => t?.(key) ?? FALLBACK[key];
    return { title: get("spread.title"), sub: get("spread.sub"), hint: get("spread.hint") };
  };
  const [strings, setStrings] = useState(read);
  useEffect(() => {
    const onLang = () => setStrings(read());
    document.addEventListener("kepler:lang", onLang);
    return () => document.removeEventListener("kepler:lang", onLang);
  }, []);
  return strings;
}

export default function KeplerSpread() {
  const { title, sub, hint } = useKeplerStrings();
  return (
    <StackSpread
      cards={KEPLER_CARDS}
      bgColor="transparent"
      textColor="#ffffff"
      cardRadius={14}
      // Title strings are our own trusted dictionary entries (they carry a span).
      title={<span dangerouslySetInnerHTML={{ __html: title }} />}
      subtitle={sub}
      scrollHintLabel={hint}
    />
  );
}
