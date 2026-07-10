/**
 * Wrapper around the browser's built-in SpeechSynthesis (TTS), tuned to
 * sound less flat than the default and to respect a target language/accent
 * plus a theme-driven pitch/rate flavor.
 *
 * Free, no-API-key improvements:
 * 1. Voice picking — score available voices, preferring ones that match
 *    the requested language/accent and sound natural/enhanced/online.
 * 2. Expressive pacing — speak sentence-by-sentence with small pitch/rate
 *    nudges based on punctuation, instead of one flat monotone utterance.
 */

let voicesReadyPromise = null;
const voiceCache = new Map(); // lang -> best voice

function scoreVoice(voice, targetLang) {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (targetLang) {
    const targetBase = targetLang.split("-")[0];
    if (voice.lang === targetLang) score += 10;
    else if (voice.lang?.startsWith(targetBase)) score += 6;
  } else if (voice.lang?.startsWith("en")) {
    score += 5;
  }

  if (/natural|enhanced|premium|neural/.test(name)) score += 6;
  if (/online/.test(name)) score += 3;
  if (/google/.test(name)) score += 4;
  if (/microsoft/.test(name)) score += 3;
  if (/robot|whisper|bells|organ|zarvox|trinoids|bahh/.test(name)) score -= 10;

  return score;
}

function waitForVoices() {
  if (voicesReadyPromise) return voicesReadyPromise;
  voicesReadyPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis?.getVoices() || [];
    if (existing.length > 0) return resolve(existing);
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    setTimeout(() => resolve(window.speechSynthesis?.getVoices() || []), 1000);
  });
  return voicesReadyPromise;
}

async function pickBestVoice(targetLang) {
  const key = targetLang || "default";
  if (voiceCache.has(key)) return voiceCache.get(key);
  const voices = await waitForVoices();
  if (!voices.length) return null;
  const best = [...voices].sort((a, b) => scoreVoice(b, targetLang) - scoreVoice(a, targetLang))[0];
  voiceCache.set(key, best);
  return best;
}

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Speaks `text` aloud.
 * options:
 *   lang        BCP-47 tag to prefer a voice for (e.g. "hi-IN")
 *   themeVoice  { pitch, rate } small offsets from the current theme
 *   onStart / onEnd  lifecycle callbacks (drive UI state / hands-free loop)
 */
export async function speakText(text, { lang, themeVoice = {}, onStart, onEnd } = {}) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const voice = await pickBestVoice(lang);
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    onEnd?.();
    return;
  }

  onStart?.();

  const basePitch = 0.97 + (themeVoice.pitch || 0);
  const baseRate = 1.0 + (themeVoice.rate || 0);

  sentences.forEach((sentence, i) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    if (voice) utterance.voice = voice;
    utterance.lang = lang || voice?.lang || "en-US";

    let pitch = basePitch;
    let rate = baseRate;
    if (sentence.endsWith("?")) pitch += 0.08;
    if (sentence.endsWith("!")) {
      pitch += 0.05;
      rate += 0.04;
    }
    utterance.pitch = Math.min(Math.max(pitch, 0.5), 1.7);
    utterance.rate = Math.min(Math.max(rate, 0.65), 1.4);
    utterance.volume = 1;

    if (i === sentences.length - 1) {
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
