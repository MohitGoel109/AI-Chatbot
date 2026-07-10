import { useTheme } from "../context/ThemeContext.jsx";

/**
 * The assistant's avatar — swaps icon per theme (skull, dagger, sword,
 * snowflake, biohazard, crown) instead of reusing one icon everywhere.
 */
function AvatarBadge({ active = false, size = "md" }) {
  const { theme } = useTheme();
  return (
    <span className={`avatar-badge avatar-${size} ${active ? "active" : ""}`}>
      <span className="avatar-badge-icon">{theme.icon}</span>
    </span>
  );
}

export default AvatarBadge;
