import { useState, useRef, useEffect, useCallback } from "react";
import { streamMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { speakText, stopSpeaking, unlockSpeech } from "../hooks/useSpeechSynthesis.js";
import { useConversations } from "../hooks/useConversations.js";
import { supabase } from "../lib/supabaseClient.js";
import { playChainTick } from "../utils/sfx.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { getLanguage } from "../utils/languages.js";
import LanguageSelector from "./LanguageSelector.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import AvatarBadge from "./AvatarBadge.jsx";
import Markdown from "./Markdown.jsx";
import ConversationSidebar from "./ConversationSidebar.jsx";

function ChatWindow({ onClose, session }) {
  const { theme } = useTheme();
  const userId = session.user.id;

  const {
    conversations,
    activeId,
    setActiveId,
    messages,
    setMessages,
    createConversation,
    saveMessage,
    startNewChat,
    deleteConversation,
  } = useConversations(userId);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [languageId, setLanguageId] = useState("english");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const handsFreeModeRef = useRef(handsFreeMode);
  handsFreeModeRef.current = handsFreeMode;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildHistory = (msgs) => {
    const firstUserIndex = msgs.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) return [];
    return msgs.slice(firstUserIndex).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
  };

  const speakReply = useCallback(
    (fullText) => {
      const lang = getLanguage(languageId);
      speakText(fullText, {
        lang: lang.speechLang,
        themeVoice: theme.voiceProfile,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          if (handsFreeModeRef.current) startListening();
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageId, theme]
  );

  const handleSend = useCallback(
    async (textToSend) => {
      const text = (typeof textToSend === "string" ? textToSend : input).trim();
      if (!text || isLoading) return;

      // Must happen synchronously, before any await below, so it still
      // counts as "within" this click for the browser's audio policy.
      unlockSpeech();

      const historyBeforeThisMessage = buildHistory(messages);
      setMessages((prev) => [...prev, { role: "user", text }]);
      setInput("");
      setIsLoading(true);
      playChainTick();

      // Lazily create the conversation row on the first message of a new chat.
      let conversationId = activeId;
      if (!conversationId) {
        try {
          conversationId = await createConversation(text);
        } catch (err) {
          console.error("Failed to create conversation:", err.message);
        }
      }
      if (conversationId) saveMessage(conversationId, "user", text);

      let replyIndex = -1;
      setMessages((prev) => {
        replyIndex = prev.length;
        return [...prev, { role: "model", text: "" }];
      });

      streamMessage(text, historyBeforeThisMessage, languageId, {
        onChunk: (_chunk, full) => {
          setIsLoading(false);
          setMessages((prev) => {
            const next = [...prev];
            if (next[replyIndex]) next[replyIndex] = { ...next[replyIndex], text: full };
            return next;
          });
        },
        onDone: (full) => {
          setIsLoading(false);
          if (conversationId && full.trim()) saveMessage(conversationId, "model", full);
          if (voiceReplyEnabled && full.trim()) {
            speakReply(full);
          } else if (handsFreeModeRef.current) {
            startListening();
          }
        },
        onError: () => {
          setIsLoading(false);
          setMessages((prev) => {
            const next = [...prev];
            next[replyIndex] = {
              role: "model",
              text: "Ugh, couldn't reach the server. Is it running?",
            };
            return next;
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, isLoading, messages, languageId, voiceReplyEnabled, speakReply, activeId, createConversation, saveMessage]
  );

  const { startListening, isListening, isSupported } = useSpeechRecognition((transcript) => {
    setInput(transcript);
    handleSend(transcript);
  });

  const handleMicClick = () => {
    unlockSpeech();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    startListening();
  };

  const handleSimplify = (userText) => {
    handleSend(`Explain that more simply: "${userText}"`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend(input);
  };

  const toggleHandsFree = () => {
    setHandsFreeMode((v) => {
      const next = !v;
      if (next) setVoiceReplyEnabled(true);
      return next;
    });
  };

  const handleNewChat = () => {
    stopSpeaking();
    startNewChat();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    stopSpeaking();
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <div className="chat-window ignite-in">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        onSignOut={handleSignOut}
        userEmail={session.user.email}
        open={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-title">
            <button className="icon-btn history-toggle" onClick={() => setSidebarOpen((v) => !v)} title="Chat history">
              ☰
            </button>
            <AvatarBadge size="sm" active={isSpeaking} />
            <span>Ember</span>
            <span className={`status-dot ${isListening ? "listening" : isSpeaking ? "speaking" : ""}`} />
          </div>
          <div className="chat-header-actions">
            <button className="close-btn" onClick={onClose} aria-label="Close chat">
              ✕
            </button>
          </div>
        </div>

        <div className="chat-subheader">
          <ThemeSwitcher />
          <LanguageSelector languageId={languageId} onChange={setLanguageId} />
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => {
            const prevUserText =
              msg.role === "model" && i > 0 && messages[i - 1].role === "user" ? messages[i - 1].text : null;
            const isLatest = i === messages.length - 1;
            const showTyping = msg.role === "model" && msg.text === "" && isLatest && isLoading;
            return (
              <div key={i} className={`chat-bubble-row ${msg.role}`}>
                {msg.role === "model" && <AvatarBadge size="sm" active={isLatest && isSpeaking} />}
                <div className={`chat-bubble ${msg.role}`}>
                  {showTyping ? (
                    <span className="typing-inline">
                      <span className="ember-dot" />
                      <span className="ember-dot" />
                      <span className="ember-dot" />
                    </span>
                  ) : msg.role === "model" ? (
                    <Markdown text={msg.text} />
                  ) : (
                    msg.text
                  )}
                  {msg.role === "model" && prevUserText && msg.text && (
                    <button className="simplify-btn" onClick={() => handleSimplify(prevUserText)}>
                      ⚡ Explain simpler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <button
            className={`mic-btn ${isListening ? "listening" : ""} ${isSpeaking ? "speaking" : ""}`}
            onClick={handleMicClick}
            title={isSupported ? "Speak your message" : "Voice input not supported in this browser"}
            disabled={isLoading}
          >
            🎤
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            disabled={isLoading}
          />

          <button className="send-btn" onClick={() => handleSend(input)} disabled={isLoading}>
            Send
          </button>
        </div>

        <div className="chat-toggles">
          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={voiceReplyEnabled}
              onChange={(e) => setVoiceReplyEnabled(e.target.checked)}
            />
            Read replies aloud
          </label>
          <label className="voice-toggle">
            <input type="checkbox" checked={handsFreeMode} onChange={toggleHandsFree} />
            🔥 Hands-free mode
          </label>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
