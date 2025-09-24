"use client";

import { useEffect, useRef, useState } from "react";

import { apiChat } from "@/lib/api";
import MessageList from "./MessageList";
import SourceChips from "./SourceChips";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  timestamp?: number;
  isError?: boolean;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async () => {
    const q = input.trim();
    console.log("Send function called, input:", q, "busy:", busy);
    if (!q || busy) return;

    setError(null);
    const userMessage: Message = {
      role: "user",
      content: q,
      timestamp: Date.now()
    };

    setMessages((m) => [...m, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const data = await apiChat(q, "default");
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: Date.now()
      };
      setMessages((m) => [...m, assistantMessage]);
    } catch (e: any) {
      const errorMessage = e.message || "Erreur lors de l'appel API";
      setError(errorMessage);

      const errorResponse: Message = {
        role: "assistant",
        content: `❌ Impossible d'obtenir une réponse. Réessaie.`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages((m) => [...m, errorResponse]);

      // Auto-hide error toast after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setBusy(false);
      // Return focus to input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const last = messages[messages.length - 1];
  const hasValidSources = last?.sources?.length && !last.isError;

  useEffect(() => {
    const h = () => {
      setMessages([]);
      setError(null);
    };
    window.addEventListener("chat:clear", h);
    return () => window.removeEventListener("chat:clear", h);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">Erreur de connexion</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 p-0.5 rounded"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageList messages={messages} isThinking={busy} />

      {hasValidSources && <SourceChips sources={last.sources} />}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-150 placeholder:text-white/40"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Pose ta question…"
            disabled={busy}
            aria-label="Message à envoyer"
          />
        </div>
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2 min-w-[100px] justify-center"
          aria-label="Envoyer le message"
        >
          {busy ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Envoi...</span>
            </>
          ) : (
            <span>Envoyer</span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">↵</kbd>
          Envoyer
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">⇧↵</kbd>
          Nouvelle ligne
        </span>
      </div>
    </div>
  );
}
