"use client";

import { AnomalyResult } from "@/types";

interface AnomalyBadgeProps {
  anomalies: AnomalyResult[];
  methodsRun?: string[];
}

export default function AnomalyBadge({ anomalies, methodsRun = [] }: AnomalyBadgeProps) {
  const methodLabel = (method?: string) => {
    if (method === "isolation_forest") return "Isolation Forest";
    if (method === "zscore") return "Z-Score";
    if (method === "small_sample_guardrail") return "Small-Sample Guardrail";
    return "Unknown";
  };

  const methodsSummary = methodsRun.length > 0
    ? methodsRun.map(methodLabel).join(" + ")
    : "Need at least 3 months (Z-Score) or 6 months (Isolation Forest)";

  return (
    <div className="card">
      <p className="section-label">Anomaly Detection</p>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-dim)",
        marginBottom: "0.75rem",
      }}>
        Detectors: {methodsSummary}
      </p>

      {anomalies.length === 0 ? (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          color: "var(--accent-lime)",
          padding: "0.75rem 1rem",
          backgroundColor: "rgba(81,252,2,0.04)",
          border: "1px solid rgba(81,252,2,0.18)",
          borderRadius: 1,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>✓</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)" }}>No anomalies detected in your spending history.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(93,64,56,0.25)" }}>
                {["Method", "Confidence", "Month", "Category", "Direction", "Score", "Message"].map((h) => (
                  <th key={h} style={{
                    padding: "0.5rem 0.75rem", textAlign: "left",
                    fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
                    color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(93,64,56,0.15)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(93,64,56,0.12)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-display)", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{methodLabel(a.method)}</td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-display)", fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{a.confidence ?? "-"}</td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-primary)" }}>{a.month}</td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize", letterSpacing: "0.05em" }}>{a.category}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      color: a.direction === "spike" ? "var(--accent-orange)" : "var(--accent-lime)",
                      border: `1px solid ${a.direction === "spike" ? "rgba(252,68,2,0.3)" : "rgba(81,252,2,0.25)"}`,
                      padding: "0.15rem 0.5rem", borderRadius: 1,
                    }}>
                      {a.direction === "spike" ? "↑ spike" : "↓ drop"}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: a.direction === "spike" ? "var(--accent-orange)" : "var(--accent-lime)" }}>
                    {a.zscore > 0 ? "+" : ""}{a.zscore.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "20rem" }}>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
