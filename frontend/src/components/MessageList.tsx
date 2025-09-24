"use client";

import { useEffect, useRef } from "react";

import MarkdownContent from "./MarkdownContent";

interface Message {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  timestamp?: number;
}

interface MessageListProps {
  messages: Message[];
  isThinking?: boolean;
}

function TypingIndicator() {
  return (
    <div className="text-left">
      <div className="inline-block max-w-[78%] px-3 py-2 rounded-2xl bg-black/30 border border-white/10 text-white/90">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-white/60 ml-2">Le modèle réfléchit...</span>
        </div>
        <div className="mt-2 space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-white/10 rounded animate-pulse w-full"></div>
          <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message, index: number }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`${isUser ? "text-right" : "text-left"} animate-in slide-in-from-${isUser ? 'right' : 'left'}-4 fade-in duration-300`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="group relative">
        <div
          className={
            `inline-block max-w-[78%] px-3 py-2 rounded-2xl transition-all duration-150 hover:scale-[1.02] ` +
            (isUser
              ? "bg-blue-600/80 text-white shadow-lg"
              : "bg-black/30 border border-white/10 text-white/90 hover:bg-black/40")
          }
        >
          <div className="whitespace-pre-wrap break-words">
            {message.role === "assistant" && !message.content.startsWith("❌") ? (
              <MarkdownContent content={message.content} />
            ) : (
              message.content
            )}
          </div>
        </div>
        {message.timestamp && (
          <div className={`text-[11px] text-white/40 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="mb-4">
        <svg
          className="w-12 h-12 text-white/30 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <p className="text-white/50 text-sm">Pose une question pour commencer</p>
      <p className="text-white/30 text-xs mt-1">Le chat apparaîtra ici</p>
    </div>
  );
}

export default function MessageList({ messages, isThinking = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (scrollRef.current && shouldScrollRef.current) {
      const element = scrollRef.current;
      const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 100;

      if (isNearBottom) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isThinking]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 100;
      shouldScrollRef.current = isNearBottom;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-[360px] max-h-[60vh] lg:max-h-[65vh] overflow-auto space-y-3 pr-2 scroll-smooth"
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Messages du chat"
    >
      {messages.length === 0 && !isThinking ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} index={index} />
          ))}
          {isThinking && <TypingIndicator />}
        </>
      )}
    </div>
  );
}
