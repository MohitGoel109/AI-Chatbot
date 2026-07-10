# Ember — AI Chatbot (React + Node.js + Gemini API)

A themeable, voice-enabled AI chatbot assistant.

**🔗 Live app:** https://ai-chatbot-gamma-lime-36.vercel.app
**🔗 Backend API:** https://ai-chatbot-myo5.onrender.com
**🔗 Repository:** https://github.com/MohitGoel109/AI-Chatbot

> Note: the backend is on Render's free tier, which spins down when idle.
> The first message after a period of inactivity can take 30-50 seconds
> to respond while it wakes back up — that's expected, not a bug.

## Features

- 6 original visual/voice themes (Ember, Voidwire, Arena, Cryo, Toxin, Royal Ash) — switch live via the theme button, each with its own colors, fonts, animated background, and voice pitch/rate
- Voice input (speak your message) and voice output (replies read aloud), with a hands-free mode that auto-listens after the assistant finishes speaking
- Reply language selector: English, Hindi, Hinglish, Bhojpuri, Bengali, Haryanvi (formal tone, respectful pronouns)
- Streamed replies (text appears as it's generated, not after a long wait)
- Markdown rendering, "explain simpler" button, chat history saved across refreshes
- Casual, warm assistant persona (not a corporate script) — see `PERSONA_INSTRUCTION` in `server/src/services/gemini.service.js`
- Rate limiting on the chat endpoints to protect API quota/billing

## Folder structure

```
ai-chatbot-demo/
├── client/     React app (Vite)
└── server/     Node/Express backend
```

## Run it locally

### 1. Get a Gemini API key
https://aistudio.google.com/apikey — free to create.

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
```
Open `.env` and fill in:
```
GEMINI_API_KEY=your_real_key_here
PORT=8088
```
Leave `CLIENT_ORIGIN`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` as-is for local dev.

Start it:
```bash
npm run dev
```
You should see `Server running on http://localhost:8088`.

### 3. Set up the client
New terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173). No env setup needed locally — it falls back to `localhost:8088` automatically.

If `npm install` fails on a rollup native-binding error (known npm bug), run:
```bash
npm install @rollup/rollup-linux-x64-gnu --no-save
```
(swap for `@rollup/rollup-darwin-x64` on Mac, `@rollup/rollup-win32-x64-msvc` on Windows)

## Deployment

- **Backend** deployed on [Render](https://render.com) — root directory `server`, build `npm install`, start `npm start`. Env vars: `GEMINI_API_KEY`, `CLIENT_ORIGIN` (your Vercel URL), `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.
- **Frontend** deployed on [Vercel](https://vercel.com) — root directory `client`. Env var: `VITE_API_BASE_URL` = your Render URL + `/api`.

## Notes

- Voice input/output uses the browser's built-in Web Speech API — works best in **Chrome or Edge**.
- Browsers don't ship dedicated Bhojpuri or Haryanvi voices, so those two languages fall back to a Hindi (hi-IN) accent for speech — the text itself is correct, only the spoken accent is an approximation.
- The Gemini API key lives only on the server, never exposed to the browser.
- Model used: `gemini-2.5-flash` (configurable in `server/src/services/gemini.service.js`).

## Common issues

- **"couldn't reach the server"**: backend isn't running, or (in production) `VITE_API_BASE_URL` / `CLIENT_ORIGIN` don't match your actual deployed URLs exactly (check for trailing slashes, http vs https).
- **Mic button does nothing**: browser doesn't support SpeechRecognition, or mic permission was denied.
- **"You're sending messages too quickly"**: rate limit hit (default 30 requests/15 min per IP) — wait or adjust `RATE_LIMIT_MAX`.
