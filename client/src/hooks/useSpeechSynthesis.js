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
const blacklistedVoiceNames = new Set(); // voices that failed synthesis this session

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
  // "Online" voices route through a cloud service (e.g. Microsoft's Azure
  // neural voices) and can silently fail with "synthesis-failed" if that
  // network call is blocked (firewall, VPN, flaky connection). Prefer
  // local/offline voices so speech doesn't depend on that round-trip.
  if (/online/.test(name)) score -= 4;
  if (/google/.test(name)) score += 4;
  if (/microsoft/.test(name)) score += 3;
  if (/robot|whisper|bells|organ|zarvox|trinoids|bahh/.test(name)) score -= 10;
  if (blacklistedVoiceNames.has(voice.name)) score -= 100;

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
  if (voiceCache.has(key) && !blacklistedVoiceNames.has(voiceCache.get(key)?.name)) {
    return voiceCache.get(key);
  }
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
  let voice = await pickBestVoice(lang);
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    onEnd?.();
    return;
  }

  console.log("speakText: starting,", sentences.length, "sentence(s), voice:", voice?.name || "default");
  onStart?.();

  const basePitch = 0.97 + (themeVoice.pitch || 0);
  const baseRate = 1.0 + (themeVoice.rate || 0);

  // Chrome/Edge have a known bug where queuing several utterances back-to-back
  // (e.g. via forEach) can silently drop everything after the first one,
  // especially right after cancel(). Speaking one at a time and only
  // starting the next once the previous one's onend fires avoids that.
  let index = 0;
  let retriedCurrentSentence = false;

  function speakNext() {
    if (index >= sentences.length) {
      onEnd?.();
      return;
    }
    const sentence = sentences[index];
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

    utterance.onend = () => {
      index++;
      retriedCurrentSentence = false;
      speakNext();
    };
    utterance.onerror = async (event) => {
      console.error("SpeechSynthesis error:", event.error, "on voice:", voice?.name);
      // Voice is broken (e.g. an "online" voice that can't reach its
      // cloud service). Blacklist it and try this sentence once more
      // with a different voice before giving up and moving on.
      if (voice) blacklistedVoiceNames.add(voice.name);
      if (!retriedCurrentSentence) {
        retriedCurrentSentence = true;
        voice = await pickBestVoice(lang);
        console.log("Retrying with fallback voice:", voice?.name || "default");
        speakNext();
      } else {
        index++;
        retriedCurrentSentence = false;
        speakNext();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  speakNext();
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

/**
 * Some Chromium builds (notably certain Edge versions) silently block
 * speechSynthesis.speak() if too much time has passed since the user's
 * last real click/tap — which happens here because we call speak() only
 * after the reply has finished streaming in, well after the original
 * "Send" click. Calling this SYNCHRONOUSLY inside a click handler (before
 * any await) "unlocks" the engine for the rest of the tab session, so the
 * later automatic speak() call goes through fine. The unlock utterance
 * itself is inaudible (empty text, zero volume).
 */
export function unlockSpeech() {
  if (!window.speechSynthesis) return;
  try {
    const unlock = new SpeechSynthesisUtterance(" ");
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
  } catch {
    // Non-fatal — worst case the original bug persists on this browser.
  }
}