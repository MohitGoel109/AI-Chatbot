import { createContext, useContext, useState } from "react";

/**
 * Six original visual/voice themes. None reference copyrighted characters,
 * names, or media — each is an original persona flavor inspired by a
 * general aesthetic (fire/road, mercenary/anti-hero, arena fighter, ice,
 * cyberpunk, regal) rather than any specific franchise.
 *
 * voiceProfile tweaks pitch/rate on top of whatever language voice gets
 * picked, so each theme still "sounds" a bit different from the others.
 */
export const THEMES = [
  {
    id: "ember",
    name: "Ember",
    icon: "🔥",
    tagline: "Road-worn rider",
    voiceProfile: { pitch: 0.0, rate: 0.0 }, // warm, even, natural
  },
  {
    id: "voidwire",
    name: "Voidwire",
    icon: "🗡️",
    tagline: "Quick-witted mercenary",
    voiceProfile: { pitch: 0.18, rate: 0.22 }, // quick, sharp, high-energy
  },
  {
    id: "kombat",
    name: "Arena",
    icon: "⚔️",
    tagline: "Tournament fighter",
    voiceProfile: { pitch: -0.22, rate: -0.14 }, // deep, booming, announcer-style
  },
  {
    id: "cryo",
    name: "Cryo",
    icon: "❄️",
    tagline: "Calm precision",
    voiceProfile: { pitch: 0.24, rate: -0.18 }, // high, slow, glacial precision
  },
  {
    id: "toxin",
    name: "Toxin",
    icon: "☣️",
    tagline: "Cyberpunk hacker",
    voiceProfile: { pitch: 0.14, rate: 0.3 }, // clipped, fast, robotic
  },
  {
    id: "royal",
    name: "Royal Ash",
    icon: "👑",
    tagline: "Regal and deliberate",
    voiceProfile: { pitch: -0.28, rate: -0.24 }, // very deep, slow, dignified
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState("ember");
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      <div data-theme={themeId}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}
