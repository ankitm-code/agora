"use client";

import { useState } from "react";
import { Philosopher } from "@/app/lib/philosophers";

interface TopicRecommenderProps {
  onSelect: (p: Philosopher) => void;
}

export default function TopicRecommender({ onSelect }: TopicRecommenderProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{ philosophers: Philosopher[]; reason: string } | null>(null);

  const search = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setRecommendations(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setRecommendations(data);
    } catch {
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Name a topic, a question, or a theme — and we will find the philosophers who have wrestled with it most deeply.
      </p>

      <div
        className="flex gap-3 p-3 rounded-lg mb-8"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. freedom, justice, death, meaning, knowledge…"
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:opacity-40"
          style={{ color: "var(--text)", fontFamily: "inherit" }}
        />
        <button
          onClick={search}
          disabled={!topic.trim() || loading}
          className="px-5 py-2 rounded text-sm font-medium transition-all shrink-0"
          style={{
            background: topic.trim() && !loading ? "var(--amber)" : "var(--border)",
            color: topic.trim() && !loading ? "#1a1710" : "var(--text-muted)",
            cursor: topic.trim() && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Searching…" : "Find"}
        </button>
      </div>

      {recommendations && (
        <div className="fade-in">
          {recommendations.reason && (
            <p className="text-sm mb-5 italic" style={{ color: "var(--text-muted)" }}>
              {recommendations.reason}
            </p>
          )}
          <div className="space-y-3">
            {recommendations.philosophers.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left p-5 rounded-lg flex items-start gap-4 transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--amber-dim)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                }}
              >
                <span className="text-xl shrink-0 mt-0.5">{p.portrait}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)", fontFamily: "Palatino Linotype, Palatino, Georgia, serif" }}
                    >
                      {p.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--amber)" }}>
                      {p.era} · {p.tradition}
                    </span>
                    {i === 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: "var(--amber-dim)", color: "var(--amber-light)" }}
                      >
                        Best match
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                    {p.bio}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
