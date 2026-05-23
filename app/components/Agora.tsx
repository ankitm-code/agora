"use client";

import { useState } from "react";
import { Philosopher } from "@/app/lib/philosophers";
import PhilosopherGrid from "./PhilosopherGrid";
import TopicRecommender from "./TopicRecommender";
import ChatWindow from "./ChatWindow";

type Mode = "home" | "pick" | "topic" | "free" | "chat-philosopher" | "chat-free";

export default function Agora() {
  const [mode, setMode] = useState<Mode>("home");
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | undefined>();

  const enterChat = (p: Philosopher) => {
    setSelectedPhilosopher(p);
    setMode("chat-philosopher");
  };

  if (mode === "chat-philosopher") {
    return (
      <ChatWindow
        philosopher={selectedPhilosopher}
        mode="philosopher"
        onBack={() => setMode("home")}
      />
    );
  }

  if (mode === "chat-free") {
    return (
      <ChatWindow
        mode="free"
        onBack={() => setMode("home")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="px-8 py-5 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setMode("home")}
          className="tracking-widest text-xs uppercase font-semibold"
          style={{ color: "var(--amber)", letterSpacing: "0.15em" }}
        >
          Agora
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Philosophy in Conversation
        </span>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {mode === "home" && (
          <div className="fade-in">
            {/* Hero */}
            <div className="text-center mb-16">
              <h1
                className="text-5xl font-normal mb-4"
                style={{ color: "var(--text)", letterSpacing: "-0.01em" }}
              >
                The Agora
              </h1>
              <p
                className="text-lg mx-auto max-w-lg leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Enter into dialogue with the great thinkers of history.
                Ask what you dare not ask anywhere else.
              </p>
            </div>

            {/* Three modes */}
            <div className="grid md:grid-cols-3 gap-6">
              <ModeCard
                icon="👤"
                title="Choose a philosopher"
                description="Select a thinker by tradition, era, or instinct — and speak directly with them."
                cta="Browse philosophers"
                onClick={() => setMode("pick")}
              />
              <ModeCard
                icon="🔍"
                title="Explore a topic"
                description="Name a theme — freedom, death, justice, meaning — and find who has wrestled with it most."
                cta="Enter a topic"
                onClick={() => setMode("topic")}
              />
              <ModeCard
                icon="💭"
                title="Open dialogue"
                description="No philosopher selected. Bring any thought, question, or contradiction and explore it freely."
                cta="Begin"
                onClick={() => setMode("chat-free")}
                accent
              />
            </div>

            <p
              className="text-center text-xs mt-12"
              style={{ color: "var(--text-muted)", opacity: 0.5 }}
            >
              Powered by Claude · Conversations are not saved
            </p>
          </div>
        )}

        {mode === "pick" && (
          <div className="fade-in">
            <SectionHeader
              title="Choose your interlocutor"
              subtitle="20 philosophers across 2,500 years of thought"
              onBack={() => setMode("home")}
            />
            <PhilosopherGrid onSelect={enterChat} />
          </div>
        )}

        {mode === "topic" && (
          <div className="fade-in">
            <SectionHeader
              title="Explore by topic"
              subtitle="Find the philosopher most suited to your question"
              onBack={() => setMode("home")}
            />
            <TopicRecommender onSelect={enterChat} />
          </div>
        )}
      </main>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  cta,
  onClick,
  accent = false,
}: {
  icon: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-7 rounded-lg flex flex-col gap-4 transition-all group"
      style={{
        background: accent ? "var(--surface-2)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--amber-dim)" : "var(--border)"}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--amber-dim)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = accent ? "var(--amber-dim)" : "var(--border)";
      }}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h3
          className="text-lg mb-2 leading-tight"
          style={{ color: "var(--text)", fontFamily: "Palatino Linotype, Palatino, Georgia, serif" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      <span
        className="text-sm mt-auto transition-colors"
        style={{ color: "var(--amber)" }}
      >
        {cta} →
      </span>
    </button>
  );
}

function SectionHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="text-sm mb-4 block transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--amber)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        ← Back
      </button>
      <h2 className="text-3xl mb-2" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {subtitle}
      </p>
      <div className="mt-4 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}
