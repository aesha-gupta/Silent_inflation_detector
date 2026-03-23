"use client";

import { AnomalyResult } from "@/types";

interface AnomalyBadgeProps {
  anomalies: AnomalyResult[];
}

export default function AnomalyBadge({ anomalies }: AnomalyBadgeProps) {
  return (
    <div className="card">
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "1rem" }}>
        Anomaly Detection
      </h2>

      {anomalies.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#10B981",
            padding: "0.75rem 1rem",
            backgroundColor: "rgba(16,185,129,0.06)",
            borderRadius: "0.5rem",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>✓</span>
          <span style={{ fontSize: "0.875rem" }}>No anomalies detected in your spending history.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1F2937" }}>
                {["Month", "Category", "Direction", "Z-Score", "Message"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      color: "#6B7280",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #1F2937",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(31,41,55,0.4)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-mono), monospace", color: "#E5E7EB" }}>{a.month}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#E5E7EB", textTransform: "capitalize" }}>{a.category}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: a.direction === "spike" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                        color: a.direction === "spike" ? "#EF4444" : "#10B981",
                        border: `1px solid ${a.direction === "spike" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                      }}
                    >
                      {a.direction === "spike" ? "↑ spike" : "↓ drop"}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", fontFamily: "var(--font-mono), monospace", color: a.direction === "spike" ? "#EF4444" : "#10B981" }}>
                    {a.zscore > 0 ? "+" : ""}{a.zscore.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#9CA3AF", maxWidth: "20rem" }}>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
