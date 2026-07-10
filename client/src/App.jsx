import ChatWidget from "./components/ChatWidget.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <ChatWidget />
      </div>
    </ThemeProvider>
  );
}

export default App;
