"use client";

import { InsightCard as InsightCardType } from "@/types";

const TYPE_CONFIG = {
  warning: { borderColor: "var(--accent-red)", labelColor: "#EF4444", label: "Warning" },
  positive: { borderColor: "var(--accent-lime)", labelColor: "#51FC02", label: "Positive" },
  flag:     { borderColor: "var(--accent-amber)", labelColor: "#F59E0B", label: "Flag" },
  info:     { borderColor: "var(--accent-teal)", labelColor: "#2FF4DD", label: "Info" },
};

interface InsightCardsProps { cards: InsightCardType[]; }

export default function InsightCards({ cards }: InsightCardsProps) {
  if (!cards.length) return null;

  return (
    <div>
      <p className="section-label">Key Insights</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1px", background: "rgba(93,64,56,0.2)" }}>
        {cards.map((card, i) => {
          const cfg = TYPE_CONFIG[card.type] ?? TYPE_CONFIG.info;
          return (
            <div
              key={i}
              className="slide-up"
              style={{
                background: "var(--bg-card)",
                borderLeft: `2px solid ${cfg.borderColor}`,
                padding: "1.25rem 1.25rem 1.25rem 1rem",
                animationDelay: `${i * 60}ms`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.58rem", fontWeight: 700,
                  color: cfg.labelColor,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  border: `1px solid ${cfg.labelColor}40`,
                  padding: "0.15rem 0.5rem", borderRadius: 1,
                }}>
                  {cfg.label}
                </span>
                {card.category && (
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.58rem", fontWeight: 700,
                    color: "var(--text-dim)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    border: "1px solid rgba(93,64,56,0.25)",
                    padding: "0.15rem 0.5rem", borderRadius: 1,
                  }}>
                    {card.category}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)", marginBottom: "0.4rem", lineHeight: 1.4 }}>
                {card.title}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                {card.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
