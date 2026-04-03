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

type MultiMonthRow = {
  month: string;
  food: string;
  housing: string;
  transport: string;
  clothing: string;
  healthcare: string;
  entertainment: string;
  others: string;
};

const createEmptyMultiRow = (): MultiMonthRow => ({
  month: "",
  food: "",
  housing: "",
  transport: "",
  clothing: "",
  healthcare: "",
  entertainment: "",
  others: "",
});

const SAMPLE_MULTI_ROWS: MultiMonthRow[] = [
  { month: "2026-01", food: "12000", housing: "8000", transport: "3000", clothing: "1500", healthcare: "700", entertainment: "900", others: "2000" },
  { month: "2026-02", food: "12500", housing: "8000", transport: "3200", clothing: "1400", healthcare: "650", entertainment: "850", others: "1800" },
];

export default function SpendingForm() {
  const router = useRouter();
  const [entryMode, setEntryMode] = useState<"single" | "multi">("single");
  const [month, setMonth] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [multiRows, setMultiRows] = useState<MultiMonthRow[]>([createEmptyMultiRow()]);
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

  const handleMultiRowChange = (index: number, key: keyof MultiMonthRow, value: string) => {
    setMultiRows((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      if (key === "month") return { ...row, month: value };
      return { ...row, [key]: value.replace(/[^0-9.]/g, "") };
    }));
  };

  const addMultiRow = () => {
    setMultiRows((prev) => [...prev, createEmptyMultiRow()]);
  };

  const removeMultiRow = (index: number) => {
    setMultiRows((prev) => (prev.length === 1 ? [createEmptyMultiRow()] : prev.filter((_, i) => i !== index)));
  };

  const fillSampleRows = () => {
    setMultiRows(SAMPLE_MULTI_ROWS.map((row) => ({ ...row })));
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (entryMode === "multi") {
      const nonEmptyRows = multiRows.filter((row) =>
        row.month.trim().length > 0 || CATEGORIES.some((cat) => (row[cat.key as keyof MultiMonthRow] || "").trim().length > 0)
      );

      if (nonEmptyRows.length === 0) {
        showToast("Add at least one month row.", "error");
        return;
      }

      const parsedEntries: Record<string, number | string>[] = [];
      const seenMonths = new Set<string>();

      for (let i = 0; i < nonEmptyRows.length; i += 1) {
        const row = nonEmptyRows[i];
        const monthValue = row.month.trim();
        if (!monthValue) {
          showToast(`Row ${i + 1} needs a month.`, "error");
          return;
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthValue)) {
          showToast(`Row ${i + 1} month must be YYYY-MM.`, "error");
          return;
        }

        if (seenMonths.has(monthValue)) {
          showToast(`Duplicate month found: ${monthValue}`, "error");
          return;
        }
        seenMonths.add(monthValue);

        const payload: Record<string, number | string> = { month: monthValue };
        for (let idx = 0; idx < CATEGORIES.length; idx += 1) {
          const key = CATEGORIES[idx].key as keyof MultiMonthRow;
          const numeric = Number((row[key] || "0").trim() || "0");
          if (Number.isNaN(numeric) || numeric < 0) {
            showToast(`Row ${i + 1} has invalid amount for ${CATEGORIES[idx].label}.`, "error");
            return;
          }
          payload[CATEGORIES[idx].key] = numeric;
        }
        parsedEntries.push(payload);
      }

      setLoading(true);
      try {
        await api.submitSpendingBatch(parsedEntries);
        showToast(`${parsedEntries.length} months saved!`, "success");
        setTimeout(() => router.push("/dashboard"), 800);
      } catch (err: any) {
        showToast(err.message || "Failed to save monthly rows.", "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!month) { showToast("Please select a month.", "error"); return; }
    const payload: Record<string, number | string> = { month };
    let hasNeg = false;
    for (const cat of CATEGORIES) {
      const v = parseFloat(values[cat.key] || "0");
      const safeV = isNaN(v) ? 0 : v;
      if (safeV < 0) { hasNeg = true; break; }
      payload[cat.key] = safeV;
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

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          border: "1px solid rgba(93,64,56,0.35)",
          backgroundColor: "var(--bg-card-low)",
          padding: "0.4rem",
        }}>
          <button
            type="button"
            onClick={() => setEntryMode("single")}
            style={{
              border: "1px solid rgba(93,64,56,0.35)",
              padding: "0.45rem 0.6rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: entryMode === "single" ? "var(--accent-teal)" : "transparent",
              color: entryMode === "single" ? "#000" : "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            Single Month
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("multi")}
            style={{
              border: "1px solid rgba(93,64,56,0.35)",
              padding: "0.45rem 0.6rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: entryMode === "multi" ? "var(--accent-teal)" : "transparent",
              color: entryMode === "multi" ? "#000" : "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            Multi Month
          </button>
        </div>

        {entryMode === "single" ? (
          <>
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
          </>
        ) : (
          <div>
            <label style={labelStyle}>Enter Multiple Months</label>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.55rem",
              flexWrap: "wrap",
            }}>
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                lineHeight: 1.5,
                margin: 0,
              }}>
                Add rows month by month. Leave a value blank to save it as 0.
              </p>
              <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Rows: {multiRows.length}
                </span>
                <button
                  type="button"
                  onClick={fillSampleRows}
                  style={{
                    border: "1px solid rgba(93,64,56,0.35)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Use Sample
                </button>
                <button
                  type="button"
                  onClick={addMultiRow}
                  style={{
                    border: "1px solid rgba(93,64,56,0.35)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Add Row
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {multiRows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  style={{
                    border: "1px solid rgba(93,64,56,0.35)",
                    backgroundColor: "rgba(10,9,8,0.5)",
                    padding: "0.75rem",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.6rem",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}>
                      Month Row {rowIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMultiRow(rowIndex)}
                      style={{
                        border: "1px solid rgba(93,64,56,0.35)",
                        background: "transparent",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "0.3rem 0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem" }}>
                    <div>
                      <label style={labelStyle}>Month</label>
                      <input
                        type="month"
                        value={row.month}
                        onChange={(e) => handleMultiRowChange(rowIndex, "month", e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      {CATEGORIES.map((cat) => (
                        <div key={`${cat.key}-${rowIndex}`}>
                          <label style={labelStyle}>{cat.label}</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={row[cat.key as keyof MultiMonthRow]}
                            onChange={(e) => handleMultiRowChange(rowIndex, cat.key as keyof MultiMonthRow, e.target.value)}
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.9rem 2rem" }}>
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
      </div>
    </div>
  );
}
