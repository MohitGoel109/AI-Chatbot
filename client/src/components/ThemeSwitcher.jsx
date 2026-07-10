import { useState } from "react";
import { THEMES, useTheme } from "../context/ThemeContext.jsx";

function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.id === themeId);

  return (
    <div className="theme-switcher">
      <button className="theme-switcher-btn" onClick={() => setOpen((v) => !v)}>
        <span>{current.icon}</span>
        <span>{current.name}</span>
      </button>
      {open && (
        <div className="theme-switcher-menu">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-option ${t.id === themeId ? "active" : ""}`}
              onClick={() => {
                setThemeId(t.id);
                setOpen(false);
              }}
            >
              <span className="theme-option-icon">{t.icon}</span>
              <span className="theme-option-text">
                <span className="theme-option-name">{t.name}</span>
                <span className="theme-option-tagline">{t.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
