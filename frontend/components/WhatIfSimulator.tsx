"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { MonthlySpending, WhatIfResult } from "@/types";

const CPI_CATEGORIES = [
  { key: "food",        label: "Food & Beverages",     spendKey: "food" },
  { key: "housing",     label: "Housing & Rent",        spendKey: "housing" },
  { key: "transport",   label: "Transport",             spendKey: "transport" },
  { key: "clothing",    label: "Clothing & Footwear",   spendKey: "clothing" },
  { key: "healthcare",  label: "Healthcare",            spendKey: "healthcare" },
  { key: "others",      label: "Others / Miscellaneous",spendKey: "others" },
];

interface WhatIfSimulatorProps {
  baseSpending: MonthlySpending | null;
}

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function WhatIfSimulator({ baseSpending }: WhatIfSimulatorProps) {
  const [category, setCategory] = useState("food");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseAmt = baseSpending
    ? ((baseSpending as any)[CPI_CATEGORIES.find(c => c.key === category)?.spendKey ?? category] ?? 0)
    : 0;

  const sliderMax = Math.max(baseAmt * 3, 5000);

  const simulate = async (cat: string, amt: number) => {
    if (!baseSpending) return;
    const changePct = baseAmt > 0
      ? ((amt - baseAmt) / baseAmt) * 100
      : amt > 0 ? 100 : 0;

    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateWhatIf({
        base_spending: baseSpending,
        category: cat,
        change_percent: changePct,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const scheduleSimulate = (cat: string, amt: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => simulate(cat, amt), 300);
  };

  useEffect(() => {
    setNewAmount(baseAmt);
    if (baseSpending) simulate(category, baseAmt);
  }, [baseSpending, category]); // eslint-disable-line

  const handleCatChange = (cat: string) => setCategory(cat);

  const handleAmountChange = (amt: number) => {
    setNewAmount(amt);
    scheduleSimulate(category, amt);
  };

  const isPositive = (result?.delta ?? 0) > 0;
  const changePct = baseAmt > 0 ? ((newAmount - baseAmt) / baseAmt) * 100 : (newAmount > 0 ? 100 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* ── Controls ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        {/* Category selector */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCatChange(e.target.value)}
            className="input-field"
            style={{ maxWidth: "22rem", cursor: "pointer", fontFamily: "var(--font-display)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            {CPI_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Rupee Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: "26rem", marginBottom: "0.75rem" }}>
            <label style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
              New monthly spend
            </label>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: changePct > 0 ? "var(--accent-orange)" : changePct < 0 ? "var(--accent-lime)" : "var(--text-muted)" }}>
              {changePct > 0 ? "▲ " : changePct < 0 ? "▼ " : ""}
              {Math.abs(changePct).toFixed(1)}% vs current
            </span>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>CURRENT</p>
              <p className="font-mono-numbers" style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>{fmt(baseAmt)}</p>
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text-dim)", marginBottom: "0.15rem" }}>→</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>NEW</p>
              <p className="font-mono-numbers" style={{ fontSize: "1.3rem", fontWeight: 700, color: changePct > 0 ? "var(--accent-orange)" : changePct < 0 ? "var(--accent-lime)" : "var(--text-primary)" }}>
                {fmt(newAmount)}
              </p>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.round(sliderMax)}
            step={100}
            value={newAmount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value))}
            style={{ width: "100%", maxWidth: "26rem", accentColor: "var(--accent-teal)", cursor: "pointer", height: "3px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "26rem", fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginTop: "0.4rem" }}>
            <span>₹0</span>
            <span>{fmt(baseAmt)} (curr)</span>
            <span>{fmt(Math.round(sliderMax))}</span>
          </div>
        </div>
      </div>

      {/* ── Result ── */}
      {loading && (
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.05em" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Calculating impact…
        </div>
      )}
      
      {error && (
        <div style={{ color: "var(--accent-red)", fontSize: "0.8rem", padding: "0.75rem 1rem", backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 2 }}>
          {error}
        </div>
      )}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderTop: "1px solid rgba(93,64,56,0.25)", paddingTop: "1.5rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>Projected Impact</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.3rem" }}>Original</p>
              <p className="font-mono-numbers" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-muted)" }}>
                {result.original_inflation.toFixed(2)}%
              </p>
            </div>
            <div style={{ fontSize: "1.5rem", color: "var(--text-dim)" }}>→</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.3rem" }}>New Rate</p>
              <p className="font-mono-numbers" style={{ fontSize: "2rem", fontWeight: 700, color: isPositive ? "var(--accent-orange)" : "var(--accent-lime)" }}>
                {result.new_inflation.toFixed(2)}%
              </p>
            </div>
            <div style={{ marginLeft: "1rem", paddingLeft: "1.5rem", borderLeft: "1px solid rgba(93,64,56,0.25)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.3rem" }}>Delta</p>
              <p className="font-mono-numbers" style={{ fontSize: "2rem", fontWeight: 700, color: isPositive ? "var(--accent-orange)" : "var(--accent-lime)" }}>
                {result.delta > 0 ? "+" : ""}{result.delta.toFixed(2)} pp
              </p>
            </div>
          </div>
          
          <div style={{ padding: "0.85rem 1rem", backgroundColor: "rgba(47,244,221,0.05)", border: "1px solid rgba(47,244,221,0.2)", borderRadius: 2, fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
}
