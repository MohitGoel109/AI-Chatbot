import { LANGUAGES } from "../utils/languages.js";

function LanguageSelector({ languageId, onChange }) {
  return (
    <div className="language-select-wrap">
      <span className="language-select-icon">🌐</span>
      <select
        className="language-select"
        value={languageId}
        onChange={(e) => onChange(e.target.value)}
        title="Reply language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
