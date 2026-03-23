"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CATEGORIES = [
  { key: "food", label: "Food & Beverages" },
  { key: "housing", label: "Housing & Rent" },
  { key: "transport", label: "Transport" },
  { key: "clothing", label: "Clothing & Footwear" },
  { key: "healthcare", label: "Healthcare" },
  { key: "entertainment", label: "Entertainment", flag: true },
  { key: "others", label: "Others / Misc." },
];

export default function SpendingForm() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (key: string, val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setValues((prev) => ({ ...prev, [key]: clean }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month) { showToast("Please select a month.", "error"); return; }
    const payload: Record<string, number | string> = { month };
    let hasNeg = false;
    for (const cat of CATEGORIES) {
      const v = parseFloat(values[cat.key] || "0");
      if (v < 0) { hasNeg = true; break; }
      payload[cat.key] = v;
    }
    if (hasNeg) { showToast("Values cannot be negative.", "error"); return; }
    setLoading(true);
    try {
      await api.submitSpending(payload);
      showToast("Spending saved!", "success");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      showToast(err.message || "Failed to save spending.", "error");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.4rem",
    fontFamily: "var(--font-display)",
    fontSize: "0.62rem",
    fontWeight: 700,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem",
          backgroundColor: toast.type === "error" ? "var(--accent-red)" : "var(--accent-lime)",
          color: toast.type === "error" ? "#fff" : "#000",
          padding: "0.65rem 1.25rem", borderRadius: 2,
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.75rem",
          letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 999,
          border: `1px solid ${toast.type === "error" ? "var(--accent-red)" : "var(--accent-lime)"}`,
        }}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Month */}
        <div>
          <label style={labelStyle}>Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field"
            required
            style={{ maxWidth: "14rem" }}
          />
        </div>

        {/* 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem 1.5rem" }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <label style={labelStyle}>
                {cat.label}
                {cat.flag && (
                  <span style={{
                    marginLeft: "0.5rem",
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "var(--accent-amber)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    fontSize: "0.55rem", fontWeight: 700,
                    padding: "0.1rem 0.4rem", letterSpacing: "0.06em",
                    textTransform: "uppercase", borderRadius: 1,
                  }}>
                    ⚑ Extras
                  </span>
                )}
              </label>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <span style={{
                  backgroundColor: "var(--bg-card-low)",
                  border: "1px solid rgba(93,64,56,0.35)",
                  borderRight: "none",
                  borderRadius: "2px 0 0 2px",
                  padding: "0.55rem 0.65rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={values[cat.key] || ""}
                  onChange={(e) => handleChange(cat.key, e.target.value)}
                  className="input-field"
                  style={{ borderRadius: "0 2px 2px 0", borderLeft: "none" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem 2rem" }}>
            {loading ? (
              <>
                <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Saving…
              </>
            ) : (
              "Calculate My Inflation →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
