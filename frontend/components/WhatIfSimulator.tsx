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

  // Base amount for current category
  const baseAmt = baseSpending
    ? ((baseSpending as any)[CPI_CATEGORIES.find(c => c.key === category)?.spendKey ?? category] ?? 0)
    : 0;

  // Slider range: 0 to 3× the base amount (min 5000 if base is 0)
  const sliderMax = Math.max(baseAmt * 3, 5000);

  const simulate = async (cat: string, amt: number) => {
    if (!baseSpending) return;
    // Convert rupee amount to % change vs base
    const changePct = baseAmt > 0
      ? ((amt - baseAmt) / baseAmt) * 100
      : amt > 0 ? 100 : 0; // if base was 0 and they added money, treat as +100%

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

  // When component loads or category changes, reset slider to base amount
  useEffect(() => {
    setNewAmount(baseAmt);
    if (baseSpending) simulate(category, baseAmt);
  }, [baseSpending, category]); // eslint-disable-line

  const handleCatChange = (cat: string) => {
    setCategory(cat);
    // newAmount will reset via useEffect
  };

  const handleAmountChange = (amt: number) => {
    setNewAmount(amt);
    scheduleSimulate(category, amt);
  };

  const isPositive = (result?.delta ?? 0) > 0;
  const changePct = baseAmt > 0 ? ((newAmount - baseAmt) / baseAmt) * 100 : (newAmount > 0 ? 100 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Category selector */}
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCatChange(e.target.value)}
            className="input-field"
            style={{ maxWidth: "22rem", cursor: "pointer" }}
          >
            {CPI_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Rupee Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: "26rem", marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              New monthly spend
            </label>
            <span style={{ fontSize: "0.72rem", color: changePct > 0 ? "#EF4444" : changePct < 0 ? "#10B981" : "#6B7280" }}>
              {changePct > 0 ? "▲ " : changePct < 0 ? "▼ " : ""}
              {Math.abs(changePct).toFixed(1)}% vs current
            </span>
          </div>

          {/* Current vs new amount labels */}
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.75rem", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#4B5563", marginBottom: "0.1rem" }}>CURRENT</p>
              <p style={{ fontFamily: "var(--font-mono,monospace)", fontSize: "1rem", color: "#6B7280" }}>{fmt(baseAmt)}</p>
            </div>
            <div style={{ fontSize: "1.2rem", color: "#374151", marginBottom: "0.1rem" }}>→</div>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#4B5563", marginBottom: "0.1rem" }}>NEW</p>
              <p style={{ fontFamily: "var(--font-mono,monospace)", fontSize: "1.2rem", fontWeight: 700, color: changePct > 0 ? "#EF4444" : changePct < 0 ? "#10B981" : "#E5E7EB" }}>
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
            style={{ width: "100%", maxWidth: "26rem", accentColor: "#00D4AA", cursor: "pointer", height: "4px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "26rem", fontSize: "0.7rem", color: "#4B5563", marginTop: "0.25rem" }}>
            <span>₹0</span>
            <span>{fmt(baseAmt)} (current)</span>
            <span>{fmt(Math.round(sliderMax))}</span>
          </div>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div style={{ color: "#6B7280", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Calculating…
        </div>
      )}
      {error && (
        <div style={{ color: "#EF4444", fontSize: "0.875rem", padding: "0.75rem 1rem", backgroundColor: "rgba(239,68,68,0.08)", borderRadius: "0.5rem", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}
      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", color: "#6B7280", marginBottom: "0.15rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Original</p>
              <p className="font-mono-numbers" style={{ fontSize: "2rem", fontWeight: 700, color: "#E5E7EB" }}>
                {result.original_inflation.toFixed(2)}%
              </p>
            </div>
            <div style={{ fontSize: "1.5rem", color: "#374151" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", color: "#6B7280", marginBottom: "0.15rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>New</p>
              <p className="font-mono-numbers" style={{ fontSize: "2rem", fontWeight: 700, color: isPositive ? "#EF4444" : "#10B981" }}>
                {result.new_inflation.toFixed(2)}%
              </p>
            </div>
            <div style={{ textAlign: "center", marginLeft: "0.5rem" }}>
              <p style={{ fontSize: "0.7rem", color: "#6B7280", marginBottom: "0.15rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Δ</p>
              <p className="font-mono-numbers" style={{ fontSize: "2.5rem", fontWeight: 800, color: isPositive ? "#EF4444" : "#10B981" }}>
                {result.delta > 0 ? "+" : ""}{result.delta.toFixed(2)} pp
              </p>
            </div>
          </div>
          <div style={{ padding: "1rem 1.25rem", backgroundColor: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "0.75rem", fontSize: "0.875rem", color: "#D1D5DB", lineHeight: 1.6 }}>
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
}
