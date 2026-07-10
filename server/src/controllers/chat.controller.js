import { streamChatResponse, getChatResponse } from "../services/gemini.service.js";

/**
 * Streaming endpoint — writes plain-text chunks as they arrive from Gemini
 * so the UI can render the reply progressively instead of waiting for the
 * whole thing (this is what removes the "long pause" before an answer
 * shows up).
 */
export async function handleChatStream(req, res) {
  const { message, history, language } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no"); // disable proxy buffering if present

  try {
    for await (const chunk of streamChatResponse(history || [], message, language)) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error("Gemini streaming error:", err.message);
    // Headers may already be sent once streaming has started, so we can
    // only cleanly send a JSON error if nothing was written yet.
    if (!res.headersSent) {
      res.status(500).json({
        error: "Something went wrong while talking to Gemini. Check your API key and try again.",
      });
    } else {
      res.end();
    }
  }
}

/** Non-streaming fallback endpoint. */
export async function handleChat(req, res) {
  const { message, history, language } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = await getChatResponse(history || [], message, language);
    return res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return res.status(500).json({
      error: "Something went wrong while talking to Gemini. Check your API key and try again.",
    });
  }
}
