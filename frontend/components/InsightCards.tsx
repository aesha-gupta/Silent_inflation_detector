"use client";

import { InsightCard as InsightCardType } from "@/types";

const TYPE_CONFIG = {
  warning: {
    border: "var(--accent-red)",
    badge: { bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
    label: "Warning",
  },
  positive: {
    border: "var(--accent-green)",
    badge: { bg: "rgba(16,185,129,0.15)", color: "#10B981" },
    label: "Positive",
  },
  flag: {
    border: "var(--accent-amber)",
    badge: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
    label: "Flag",
  },
  info: {
    border: "#60A5FA",
    badge: { bg: "rgba(96,165,250,0.15)", color: "#60A5FA" },
    label: "Info",
  },
};

interface InsightCardsProps {
  cards: InsightCardType[];
}

export default function InsightCards({ cards }: InsightCardsProps) {
  if (!cards.length) return null;

  return (
    <div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "1rem" }}>
        Insights
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {cards.map((card, i) => {
          const config = TYPE_CONFIG[card.type] ?? TYPE_CONFIG.info;
          return (
            <div
              key={i}
              className="card slide-up"
              style={{
                borderLeft: `4px solid ${config.border}`,
                animationDelay: `${i * 50}ms`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <span
                  className="badge"
                  style={{
                    backgroundColor: config.badge.bg,
                    color: config.badge.color,
                    border: `1px solid ${config.badge.color}40`,
                  }}
                >
                  {config.label}
                </span>
                {card.category && (
                  <span
                    className="badge"
                    style={{ backgroundColor: "rgba(31,41,55,0.8)", color: "#6B7280", border: "1px solid #374151" }}
                  >
                    {card.category}
                  </span>
                )}
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#E5E7EB", marginBottom: "0.4rem", lineHeight: 1.4 }}>
                {card.title}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#9CA3AF", lineHeight: 1.6 }}>{card.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
