import { useMemo } from "react";

/**
 * Ambient drifting embers for the background. Pure CSS animation (no
 * canvas/JS loop) so it stays cheap. Purely decorative — respects
 * prefers-reduced-motion via CSS.
 */
function EmberField({ count = 22 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 7 + Math.random() * 10,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  );

  return (
    <div className="ember-field" aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            "--drift": `${e.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export default EmberField;
