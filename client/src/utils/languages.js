/**
 * Supported reply languages. `speechLang` is the BCP-47 tag we ask the
 * browser's TTS for. Browsers/OSes generally do NOT ship dedicated
 * Bhojpuri or Haryanvi voices, so those fall back to a Hindi (hi-IN)
 * voice — closest available accent, not a perfect match. Hinglish also
 * falls back to hi-IN since there's no such tag.
 */
export const LANGUAGES = [
  { id: "english", label: "English", speechLang: "en-IN", fallbackNote: null },
  { id: "hindi", label: "हिंदी (Hindi)", speechLang: "hi-IN", fallbackNote: null },
  { id: "hinglish", label: "Hinglish", speechLang: "hi-IN", fallbackNote: "closest available accent" },
  { id: "bhojpuri", label: "भोजपुरी (Bhojpuri)", speechLang: "hi-IN", fallbackNote: "no native voice — using Hindi accent" },
  { id: "bengali", label: "বাংলা (Bengali)", speechLang: "bn-IN", fallbackNote: null },
  { id: "haryanvi", label: "हरियाणवी (Haryanvi)", speechLang: "hi-IN", fallbackNote: "no native voice — using Hindi accent" },
];

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
}
