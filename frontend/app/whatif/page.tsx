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
    <main style={{ minHeight: "100vh", backgroundColor: "#0A0F1E", padding: "2rem 1.5rem", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard" style={{ fontSize: "0.78rem", color: "#6B7280", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "1.25rem" }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#E5E7EB", marginBottom: "0.5rem" }}>What-If Simulator</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "580px" }}>
            Drag the slider to a new monthly spend amount and see how it shifts your personal inflation rate in real time.
          </p>
        </div>

        {loading && (
          <div style={{ color: "#6B7280", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Loading…
          </div>
        )}

        {!loading && noData && (
          <div style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "0.75rem", padding: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>📋</p>
            <p style={{ fontWeight: 700, color: "#F59E0B", marginBottom: "0.5rem" }}>No spending data yet</p>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Submit at least 1 month of spending first.</p>
            <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>Add Spending →</Link>
          </div>
        )}

        {!loading && base && (
          /* 2-column layout: simulator left, sidebar right */
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card">
                <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #1F2937" }}>
                  <p style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Base month</p>
                  <p className="font-mono-numbers" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00D4AA" }}>{base.month}</p>
                </div>
                <WhatIfSimulator baseSpending={base} />
              </div>
            </div>

            {/* Sticky spending sidebar */}
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
