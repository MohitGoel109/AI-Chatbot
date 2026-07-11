import { useState, useEffect } from "react";
import ChatWidget from "./components/ChatWidget.jsx";
import AuthGate from "./components/AuthGate.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { supabase } from "./lib/supabaseClient.js";

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <AuthGate>
          <ChatWidget session={session} />
        </AuthGate>
      </div>
    </ThemeProvider>
  );
}

export default App;
