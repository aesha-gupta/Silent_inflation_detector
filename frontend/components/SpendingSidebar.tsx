"use client";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Beverages",
  housing: "Housing & Rent",
  transport: "Transport",
  clothing: "Clothing & Footwear",
  healthcare: "Healthcare",
  entertainment: "Entertainment",
  others: "Others",
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "#00D4AA",
  housing: "#6366F1",
  transport: "#F59E0B",
  clothing: "#EC4899",
  healthcare: "#10B981",
  entertainment: "#F97316",
  others: "#6B7280",
};

interface SpendingSidebarProps {
  spending: Record<string, number>;
  month: string;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function SpendingSidebar({ spending, month }: SpendingSidebarProps) {
  const keys = ["food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"];
  const total = keys.reduce((s, k) => s + (spending[k] ?? 0), 0);

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        position: "sticky",
        top: "1.5rem",
        alignSelf: "flex-start",
        backgroundColor: "#111827",
        border: "1px solid #1F2937",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1F2937", paddingBottom: "0.75rem" }}>
        <p style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
          Spending — {month}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#00D4AA",
          }}
        >
          {fmt(total)}
        </p>
        <p style={{ fontSize: "0.68rem", color: "#4B5563" }}>total this month</p>
      </div>

      {/* Category rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {keys.map((k) => {
          const amt = spending[k] ?? 0;
          const share = total > 0 ? (amt / total) * 100 : 0;
          const color = CATEGORY_COLORS[k];
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                  {CATEGORY_LABELS[k]}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.72rem",
                    color: amt > 0 ? "#E5E7EB" : "#374151",
                    fontWeight: amt > 0 ? 600 : 400,
                  }}
                >
                  {amt > 0 ? fmt(amt) : "—"}
                </span>
              </div>
              {/* Mini bar */}
              <div style={{ height: 3, backgroundColor: "#1F2937", borderRadius: 2 }}>
                <div
                  style={{
                    height: 3,
                    width: `${share}%`,
                    backgroundColor: color,
                    borderRadius: 2,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Note for entertainment */}
      {(spending["entertainment"] ?? 0) > 0 && (
        <div
          style={{
            backgroundColor: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "0.4rem",
            padding: "0.45rem 0.6rem",
            fontSize: "0.65rem",
            color: "#F59E0B",
            lineHeight: 1.5,
          }}
        >
          ⚑ Entertainment not in RBI CPI basket
        </div>
      )}
    </aside>
  );
}
