import axios from "axios";

// In production (Vercel), set VITE_API_BASE_URL to your deployed Render
// backend URL, e.g. https://your-app.onrender.com/api
// Locally it falls back to the dev server on port 8088.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088/api";

/**
 * Sends a message + history to the backend and returns the full reply
 * (non-streaming fallback — kept simple for callers that don't need
 * progressive rendering).
 */
export async function sendMessage(message, history, language) {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    history,
    language,
  });
  return response.data.reply;
}

/**
 * Streams a reply from the backend. Calls onChunk(text) as each piece
 * arrives and onDone(fullText) once the stream ends. This is what kills
 * the "long pause" — text starts appearing as soon as Gemini starts
 * generating instead of waiting for the whole response.
 */
export async function streamMessage(message, history, language, { onChunk, onDone, onError }) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, language }),
    });

    if (!response.ok || !response.body) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onChunk?.(chunk, full);
    }

    onDone?.(full);
  } catch (err) {
    onError?.(err);
  }
}
