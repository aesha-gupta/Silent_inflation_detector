"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import WhatIfSimulator from "@/components/WhatIfSimulator";
import SpendingSidebar from "@/components/SpendingSidebar";
import { MonthlySpending } from "@/types";

export default function WhatIfPage() {
  const [base, setBase] = useState<MonthlySpending | null>(null);
  const [rawSpending, setRawSpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    api
      .getSpendingHistory()
      .then((res) => {
        const entries = (res as any).entries ?? [];
        if (!entries.length) {
          setNoData(true);
        } else {
          const last = entries[entries.length - 1];
          setBase(last as MonthlySpending);
          setRawSpending(last);
        }
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-dim)",
            letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
            marginBottom: "1.25rem", transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            ← Dashboard
          </Link>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent-teal)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            ◈ Scenario Analysis
          </p>
          <h1 className="display-heading" style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", marginBottom: "0.6rem" }}>
            What-If Simulator
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 560, fontFamily: "var(--font-body)" }}>
            Adjust your monthly category spending with sliders and see how it shifts your personal inflation rate in real time.
          </p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
            <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Loading base spending…
          </div>
        )}

        {/* ── No data ── */}
        {!loading && noData && (
          <div style={{
            backgroundColor: "rgba(252, 68, 2, 0.05)",
            border: "1px solid rgba(252, 68, 2, 0.2)",
            borderRadius: 2,
            padding: "2rem",
            textAlign: "center",
          }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-orange)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              No spending data yet
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem", fontFamily: "var(--font-body)" }}>
              Submit at least 1 month of spending first.
            </p>
            <Link href="/" className="btn-primary">Add Spending →</Link>
          </div>
        )}

        {/* ── Simulator ── */}
        {!loading && base && (
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card">
                {/* Base month label */}
                <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(93,64,56,0.2)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.3rem" }}>
                    Base Month
                  </p>
                  <p className="font-mono-numbers" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-teal)" }}>
                    {base.month}
                  </p>
                </div>
                <WhatIfSimulator baseSpending={base} />
              </div>
            </div>

            {Object.keys(rawSpending).length > 0 && (
              <SpendingSidebar spending={rawSpending} month={rawSpending.month as any ?? base.month} />
            )}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
