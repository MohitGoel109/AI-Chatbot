import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

/** Rotating ring emblem — used by Arena and Royal Ash. */
function RingEmblem({ className, ticks = 12, dashed = false }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {dashed && (
        <circle cx="200" cy="200" r="148" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" opacity="0.4" />
      )}
      {Array.from({ length: ticks }).map((_, i) => {
        const angle = (i / ticks) * Math.PI * 2;
        const x1 = 200 + 158 * Math.cos(angle);
        const y1 = 200 + 158 * Math.sin(angle);
        const x2 = 200 + 176 * Math.cos(angle);
        const y2 = 200 + 176 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" opacity="0.55" />;
      })}
    </svg>
  );
}

/** Falling glyph columns — used by Toxin (matrix-rain style). */
function GlyphRain({ glyphs }) {
  const columns = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: (i / 16) * 100 + (Math.random() * 3 - 1.5),
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 6,
        text: Array.from({ length: 22 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]),
      })),
    [glyphs]
  );

  return (
    <div className="glyph-rain" aria-hidden="true">
      {columns.map((c) => (
        <span
          key={c.id}
          className="glyph-col"
          style={{ left: `${c.left}%`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          {c.text.map((ch, i) => (
            <span key={i} style={{ opacity: 1 - i / c.text.length }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

/**
 * Signature animated backdrop per theme — this is what gives each theme
 * its own atmosphere beyond palette: motion, motifs, and layering that
 * are specific to that theme's identity.
 */
function ThemeBackdrop() {
  const { themeId } = useTheme();

  switch (themeId) {
    case "kombat":
      return (
        <div className="backdrop backdrop-kombat" aria-hidden="true">
          <RingEmblem className="ring ring-a" ticks={16} />
          <RingEmblem className="ring ring-b" ticks={8} dashed />
          <span className="corner-flame tl">🔥</span>
          <span className="corner-flame tr">🔥</span>
          <span className="corner-flame bl">🔥</span>
          <span className="corner-flame br">🔥</span>
        </div>
      );
    case "royal":
      return (
        <div className="backdrop backdrop-royal" aria-hidden="true">
          <RingEmblem className="ring ring-royal" ticks={24} dashed />
          <div className="silk-sweep" />
        </div>
      );
    case "cryo":
      return (
        <div className="backdrop backdrop-cryo" aria-hidden="true">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <span className="drift-glyph g1">❄</span>
          <span className="drift-glyph g2">❄</span>
          <span className="drift-glyph g3">❄</span>
        </div>
      );
    case "toxin":
      return (
        <div className="backdrop backdrop-toxin" aria-hidden="true">
          <GlyphRain glyphs={["0", "1", "λ", "Σ", "ϟ", "01", "10"]} />
          <div className="scan-sweep scan-sweep-toxin" />
        </div>
      );
    case "voidwire":
      return (
        <div className="backdrop backdrop-voidwire" aria-hidden="true">
          <div className="scan-sweep scan-sweep-void" />
          <div className="glitch-flash" />
        </div>
      );
    default:
      return (
        <div className="backdrop backdrop-ember" aria-hidden="true">
          <div className="heat-glow" />
        </div>
      );
  }
}

export default ThemeBackdrop;
