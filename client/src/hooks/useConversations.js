import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

const GREETING = "Hey. I'm Ember — ask me anything, by typing or by voice.";

/**
 * Manages the list of a user's saved conversations plus the messages of
 * whichever one is currently active. Replaces the old localStorage-based
 * history with real per-user persistence via Supabase + RLS.
 */
export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([{ role: "model", text: GREETING }]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (!error) setConversations(data || []);
  }, [userId]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([{ role: "model", text: GREETING }]);
      return;
    }
    const { data, error } = await supabase
      .from("messages")
      .select("role, text")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (!error) {
      setMessages(data && data.length ? data : [{ role: "model", text: GREETING }]);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loadConversations().finally(() => setLoading(false));
  }, [userId, loadConversations]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  // Creates a new conversation row (called lazily on first message sent,
  // not on every "New chat" click, so we don't litter empty rows).
  const createConversation = useCallback(
    async (firstMessageText) => {
      const title = firstMessageText.slice(0, 60);
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select()
        .single();
      if (error) throw error;
      setConversations((prev) => [data, ...prev]);
      setActiveId(data.id);
      return data.id;
    },
    [userId]
  );

  const saveMessage = useCallback(async (conversationId, role, text) => {
    const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, role, text });
    if (error) console.error("Failed to save message:", error.message);
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveId(null);
    setMessages([{ role: "model", text: GREETING }]);
  }, []);

  const deleteConversation = useCallback(
    async (conversationId) => {
      await supabase.from("conversations").delete().eq("id", conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeId === conversationId) startNewChat();
    },
    [activeId, startNewChat]
  );

  return {
    conversations,
    activeId,
    setActiveId,
    messages,
    setMessages,
    loading,
    createConversation,
    saveMessage,
    startNewChat,
    deleteConversation,
  };
}
