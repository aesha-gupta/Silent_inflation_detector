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
  { key: "others", label: "Others / Miscellaneous" },
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
    if (!month) {
      showToast("Please select a month.", "error");
      return;
    }

    const payload: Record<string, number | string> = { month };
    let hasNegative = false;
    for (const cat of CATEGORIES) {
      const v = parseFloat(values[cat.key] || "0");
      if (v < 0) { hasNegative = true; break; }
      payload[cat.key] = v;
    }

    if (hasNegative) {
      showToast("Spending values cannot be negative.", "error");
      return;
    }

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

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            backgroundColor: toast.type === "error" ? "#EF4444" : "#10B981",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            zIndex: 999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Month picker */}
        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field font-mono-numbers"
            required
            style={{ maxWidth: "16rem" }}
          />
        </div>

        {/* Category inputs in 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {cat.label}
                {cat.flag && (
                  <span style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B", fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", border: "1px solid rgba(245,158,11,0.3)", letterSpacing: "0.06em" }}>
                    ⚑ Not tracked by RBI CPI Urban
                  </span>
                )}
              </label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ backgroundColor: "#1F2937", padding: "0.5rem 0.6rem", borderRadius: "0.5rem 0 0 0.5rem", fontSize: "0.875rem", color: "#6B7280", border: "1px solid #1F2937", borderRight: "none" }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={values[cat.key] || ""}
                  onChange={(e) => handleChange(cat.key, e.target.value)}
                  className="input-field font-mono-numbers"
                  style={{ borderRadius: "0 0.5rem 0.5rem 0", borderLeft: "none" }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? (
            <>
              <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Saving…
            </>
          ) : (
            "Save & Go to Dashboard →"
          )}
        </button>
      </form>
    </div>
  );
}
