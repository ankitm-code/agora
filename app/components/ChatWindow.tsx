"use client";

import { useState, useRef, useEffect } from "react";
import { Philosopher } from "@/app/lib/philosophers";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  philosopher?: Philosopher;
  mode: "philosopher" | "topic" | "free";
  onBack: () => void;
}

export default function ChatWindow({ philosopher, mode, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosopherId: philosopher?.id,
          messages: newMessages,
          mode,
        }),
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setStreamingText(full);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamingText("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "The connection faltered. Try again." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const header = mode === "free"
    ? { name: "The Agora", subtitle: "Open philosophical dialogue", portrait: "🏛️" }
    : { name: philosopher!.name, subtitle: `${philosopher!.era} · ${philosopher!.tradition}`, portrait: philosopher!.portrait };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <button
          onClick={onBack}
          className="text-sm transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--amber)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← Back
        </button>
        <div className="w-px h-6" style={{ background: "var(--border)" }} />
        <span className="text-2xl">{header.portrait}</span>
        <div>
          <h2 className="font-semibold text-lg leading-tight" style={{ color: "var(--text)" }}>
            {header.name}
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {header.subtitle}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setStreamingText(""); }}
            className="ml-auto text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--amber)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !streamingText && (
          <div className="max-w-xl mx-auto text-center pt-16 fade-in">
            <div className="text-5xl mb-4">{header.portrait}</div>
            <h3 className="text-xl mb-2" style={{ color: "var(--text)" }}>
              {mode === "free"
                ? "What weighs on your mind?"
                : `Speak with ${header.name}`}
            </h3>
            {philosopher && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {philosopher.bio}
              </p>
            )}
            {mode === "free" && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Offer a thought, a question, a contradiction. The conversation is yours to begin.
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-2xl fade-in ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
          >
            {msg.role === "assistant" && (
              <div className="text-xs mb-1 pl-1" style={{ color: "var(--text-muted)" }}>
                {header.name}
              </div>
            )}
            <div
              className={`px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "user-bubble" : "philosopher-bubble"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="max-w-2xl mr-auto fade-in">
            <div className="text-xs mb-1 pl-1" style={{ color: "var(--text-muted)" }}>
              {header.name}
            </div>
            <div className="philosopher-bubble px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap">
              {streamingText}
              <span className="cursor-blink" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-4 border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="max-w-2xl mx-auto flex gap-3 items-end rounded-lg p-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={handleKey}
            placeholder={
              mode === "free"
                ? "Share a thought or question…"
                : `Ask ${header.name} something…`
            }
            rows={1}
            className="flex-1 bg-transparent resize-none text-[15px] leading-relaxed outline-none placeholder:opacity-40"
            style={{
              color: "var(--text)",
              minHeight: "28px",
              maxHeight: "160px",
              fontFamily: "inherit",
            }}
            disabled={streaming}
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="shrink-0 px-4 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: input.trim() && !streaming ? "var(--amber)" : "var(--border)",
              color: input.trim() && !streaming ? "#1a1710" : "var(--text-muted)",
              cursor: input.trim() && !streaming ? "pointer" : "not-allowed",
            }}
          >
            {streaming ? "…" : "Send"}
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          ↵ to send · Shift+↵ for new line
        </p>
      </div>
    </div>
  );
}
