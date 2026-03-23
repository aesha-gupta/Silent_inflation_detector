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

const CATEGORY_ACCENTS: Record<string, string> = {
  food: "#2FF4DD",
  housing: "#FC4402",
  transport: "#F59E0B",
  clothing: "#8b5cf6",
  healthcare: "#51FC02",
  entertainment: "#f472b6",
  others: "#6b5a4e",
};

interface SpendingSidebarProps {
  spending: Record<string, number>;
  month: string;
}

function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

export default function SpendingSidebar({ spending, month }: SpendingSidebarProps) {
  const keys = ["food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"];
  const total = keys.reduce((s, k) => s + (spending[k] ?? 0), 0);

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      position: "sticky",
      top: "80px",
      alignSelf: "flex-start",
      backgroundColor: "var(--bg-card)",
      border: "1px solid rgba(93,64,56,0.25)",
      borderRadius: 2,
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(93,64,56,0.2)", paddingBottom: "0.85rem" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.3rem" }}>
          Spending — {month}
        </p>
        <p className="font-mono-numbers" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-teal)" }}>
          {fmt(total)}
        </p>
        <p style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "0.1rem" }}>total this month</p>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {keys.map((k) => {
          const amt = spending[k] ?? 0;
          const share = total > 0 ? (amt / total) * 100 : 0;
          const accent = CATEGORY_ACCENTS[k];
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {CATEGORY_LABELS[k]}
                </span>
                <span className="font-mono-numbers" style={{ fontSize: "0.7rem", color: amt > 0 ? "var(--text-primary)" : "var(--text-dim)", fontWeight: amt > 0 ? 600 : 400 }}>
                  {amt > 0 ? fmt(amt) : "—"}
                </span>
              </div>
              {/* Mini bar */}
              <div style={{ height: 2, backgroundColor: "rgba(93,64,56,0.2)" }}>
                <div style={{ height: 2, width: `${share}%`, backgroundColor: accent, transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Entertainment flag */}
      {(spending["entertainment"] ?? 0) > 0 && (
        <div style={{
          backgroundColor: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 1,
          padding: "0.45rem 0.65rem",
          fontFamily: "var(--font-display)",
          fontSize: "0.6rem",
          fontWeight: 700,
          color: "var(--accent-amber)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          ⚑ Entertainment not in RBI CPI basket
        </div>
      )}
    </aside>
  );
}
