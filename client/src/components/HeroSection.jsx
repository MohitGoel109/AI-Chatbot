import EmberField from "./EmberField.jsx";
import ThemeBackdrop from "./ThemeBackdrop.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import AvatarBadge from "./AvatarBadge.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function HeroSection({ onOpenChat }) {
  const { theme } = useTheme();

  return (
    <section className="hero">
      <ThemeBackdrop />
      <EmberField />
      <div className="hero-theme-switcher">
        <ThemeSwitcher />
      </div>
      <div className="hero-badge">{theme.tagline.toUpperCase()} AI</div>
      <h1>
        Meet <span className="flame-text">Ember</span>
      </h1>
      <p className="hero-subtitle">
        A straight-talking AI assistant that actually sounds like it cares —
        type it, or speak it, and let it ride.
      </p>

      <div className="hero-chat-box" onClick={onOpenChat}>
        <div className="hero-chat-icon">
          <AvatarBadge size="lg" />
        </div>
        <h2>Talk to Ember</h2>
        <p>Click here to start chatting — by text or by voice</p>
      </div>

      <div className="hero-chain-rule" aria-hidden="true" />
    </section>
  );
}

export default HeroSection;
