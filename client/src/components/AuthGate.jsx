import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * Shows a magic-link sign-in form until the user is authenticated, then
 * renders children. Chat history is tied to the logged-in user's id via
 * Supabase Row Level Security (see supabase-schema.sql).
 */
function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  };

  // Still checking for an existing session on load.
  if (session === undefined) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (session) {
    return children;
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Sign in to Ember</h2>
        <p>We'll email you a magic link — no password needed. Your chat history is tied to your account.</p>

        {status === "sent" ? (
          <p className="auth-sent">
            ✅ Check <strong>{email}</strong> for your sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSendLink} className="auth-form">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}

        {status === "error" && <p className="auth-error">{errorMsg}</p>}
      </div>
    </div>
  );
}

export default AuthGate;
