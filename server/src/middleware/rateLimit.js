import rateLimit from "express-rate-limit";

// Protects the Gemini-backed chat endpoints from being hammered — every
// request costs against your API quota/billing, so this caps how many
// messages a single IP can send in a given window.
//
// Tunable via env vars so you can loosen/tighten it per environment
// without a code change:
//   RATE_LIMIT_WINDOW_MS  (default: 15 minutes)
//   RATE_LIMIT_MAX        (default: 30 requests per window per IP)
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || 30;

export const chatRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true, // return RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: "You're sending messages too quickly. Take a breather and try again in a few minutes.",
  },
});
