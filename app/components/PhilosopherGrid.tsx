"use client";

import { PHILOSOPHERS, Philosopher } from "@/app/lib/philosophers";

interface PhilosopherGridProps {
  onSelect: (p: Philosopher) => void;
}

const TRADITION_ORDER = [
  "Classical Greek",
  "Stoicism",
  "Confucianism",
  "Taoism",
  "Madhyamaka Buddhism",
  "Islamic Philosophy / Aristotelianism",
  "Rationalism",
  "Empiricism / Skepticism",
  "Enlightenment / Idealism",
  "Utilitarianism / Liberalism",
  "Continental / Existentialist",
  "Existentialism",
  "Existentialism / Feminism",
  "Absurdism / Existentialism",
  "Analytic / Philosophy of Language",
];

export default function PhilosopherGrid({ onSelect }: PhilosopherGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {PHILOSOPHERS.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className="text-left p-4 rounded-lg transition-all group"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--amber-dim)";
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.background = "var(--surface)";
          }}
        >
          <div className="text-2xl mb-2">{p.portrait}</div>
          <div
            className="font-semibold text-sm leading-snug mb-1"
            style={{ color: "var(--text)", fontFamily: "Palatino Linotype, Palatino, Georgia, serif" }}
          >
            {p.name}
          </div>
          <div className="text-xs mb-2" style={{ color: "var(--amber)" }}>
            {p.era}
          </div>
          <div
            className="text-xs leading-snug opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            {p.bio}
          </div>
        </button>
      ))}
    </div>
  );
}
