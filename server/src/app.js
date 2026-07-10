import "./config/env.js";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Render (and most PaaS hosts) sit behind a reverse proxy, so Express
// needs this to read the real client IP from X-Forwarded-For — without
// it, rate limiting would key off the proxy's IP for every request.
app.set("trust proxy", 1);

// CLIENT_ORIGIN can be a single URL or a comma-separated list (e.g. your
// Vercel prod URL + preview URLs). Falls back to "*" for local dev.
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : "*";

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Chatbot server is running.");
});

app.use("/api", chatRoutes);

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not set. Copy .env.example to .env and add your key."
  );
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
