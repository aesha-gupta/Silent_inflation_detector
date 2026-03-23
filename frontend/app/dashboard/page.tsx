"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "react-countup";
import { api } from "@/lib/api";
import InflationChart from "@/components/InflationChart";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ForecastPanel from "@/components/ForecastPanel";
import InsightCards from "@/components/InsightCards";
import AnomalyBadge from "@/components/AnomalyBadge";
import EntertainmentFlag from "@/components/EntertainmentFlag";
import SpendingSidebar from "@/components/SpendingSidebar";
import { InflationResult, AnomalyResult, InsightCard, ForecastPoint } from "@/types";

function Skeleton({ w = "100%", h = 24 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, backgroundColor: "#1F2937", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />;
}

export default function DashboardPage() {
  const [history, setHistory] = useState<InflationResult[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, ForecastPoint[]>>({});
  const [rawSpending, setRawSpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [needsMore, setNeedsMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    setNeedsMore(false);
    try {
      const [histRes, anomalyRes, insightRes, spendRes] = await Promise.all([
        api.getInflationHistory(),
        api.getAnomalies("zscore").catch(() => ({ anomalies: [] })),
        api.getInsights().catch(() => ({ insights: [] })),
        api.getSpendingHistory().catch(() => ({ entries: [] })),
      ]);

      setHistory(histRes.history);
      setAnomalies(anomalyRes.anomalies ?? []);
      setInsights(insightRes.insights ?? []);

      // Store the latest month's raw spending for the sidebar
      const entries = (spendRes as any).entries ?? [];
      if (entries.length > 0) {
        const last = entries[entries.length - 1];
        setRawSpending(last);
      }

      // Fetch forecasts
      const fcData: Record<string, ForecastPoint[]> = {};
      await Promise.all(
        ["food", "housing", "transport"].map(async (cat) => {
          try {
            const fc = await api.getForecast(cat, 6);
            fcData[cat] = fc.forecast;
          } catch {}
        })
      );
      setForecasts(fcData);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("no spending data") ||
          err.message?.toLowerCase().includes("at least")) {
        setNeedsMore(true);
      } else {
        setError(err.message || "Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const latest = history[history.length - 1];

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0A0F1E", padding: "2rem 1.5rem" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "2rem" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
            <Skeleton h={40} w="50%" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <Skeleton h={120} /><Skeleton h={120} /><Skeleton h={120} />
            </div>
            <Skeleton h={300} /><Skeleton h={280} /><Skeleton h={200} />
          </div>
          <Skeleton h={400} w="240px" />
        </div>
      </main>
    );
  }

  if (needsMore) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📊</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "0.75rem" }}>No spending data yet</h2>
          <p style={{ color: "#6B7280", marginBottom: "2rem", lineHeight: 1.65 }}>Submit your monthly spending to see your personal inflation rate.</p>
          <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>← Add Spending Data</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <p style={{ color: "#EF4444", marginBottom: "1.5rem" }}>{error}</p>
          <button onClick={fetchAll} className="btn-primary">↺ Retry</button>
        </div>
      </main>
    );
  }

  const isAbove = (latest?.difference ?? 0) >= 0;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0A0F1E", padding: "2rem 1.5rem", paddingBottom: "4rem" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#E5E7EB", marginBottom: "0.2rem" }}>Your Inflation Dashboard</h1>
            <p style={{ fontSize: "0.8rem", color: "#6B7280" }}>
              Based on {history.length} month{history.length !== 1 ? "s" : ""} of spending
            </p>
          </div>
          <Link href="/" style={{ fontSize: "0.82rem", color: "#00D4AA", border: "1px solid rgba(0,212,170,0.3)", padding: "0.4rem 1rem", borderRadius: "0.4rem", textDecoration: "none" }}>
            + Add Month
          </Link>
        </div>

        {/* 2-column layout */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>

          {/* ── Main content column ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Stat cards */}
            {latest && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div className="stat-card">
                  <p style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Inflation</p>
                  <p className="font-mono-numbers" style={{ fontSize: "2.25rem", fontWeight: 800, color: isAbove ? "#EF4444" : "#10B981", lineHeight: 1 }}>
                    <CountUp end={latest.personal_inflation_rate} decimals={2} duration={1.5} suffix="%" />
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#4B5563" }}>personal inflation rate</p>
                </div>
                <div className="stat-card">
                  <p style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>National CPI</p>
                  <p className="font-mono-numbers" style={{ fontSize: "2.25rem", fontWeight: 800, color: "#9CA3AF", lineHeight: 1 }}>
                    <CountUp end={latest.national_cpi_rate} decimals={2} duration={1.5} suffix="%" />
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#4B5563" }}>RBI CPI Urban YoY</p>
                </div>
                <div className="stat-card">
                  <p style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Difference</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.2rem", color: isAbove ? "#EF4444" : "#10B981" }}>{isAbove ? "↑" : "↓"}</span>
                    <p className="font-mono-numbers" style={{ fontSize: "2.25rem", fontWeight: 800, color: isAbove ? "#EF4444" : "#10B981", lineHeight: 1 }}>
                      <CountUp end={Math.abs(latest.difference)} decimals={2} duration={1.5} suffix=" pp" />
                    </p>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#4B5563" }}>{isAbove ? "above" : "below"} national average</p>
                </div>
              </div>
            )}

            {/* Line chart (1-month = value cards; 2+ = line chart) */}
            {history.length >= 1 && <InflationChart data={history} />}

            {/* Category breakdown — above insights */}
            {latest?.category_contributions && (
              <CategoryBreakdown contributions={latest.category_contributions} />
            )}

            {/* Spending forecasts */}
            {Object.keys(forecasts).length > 0 && <ForecastPanel forecasts={forecasts} />}

            {/* Insight cards */}
            {insights.length > 0 && <InsightCards cards={insights} />}

            {/* Anomaly table */}
            <AnomalyBadge anomalies={anomalies} />

            {/* Entertainment flag */}
            {latest && <EntertainmentFlag amount={latest.entertainment_spend} />}

            {/* What-If CTA */}
            <div style={{ textAlign: "center" }}>
              <Link href="/whatif" className="btn-primary" style={{ display: "inline-block" }}>
                Run What-If Simulator →
              </Link>
            </div>
          </div>

          {/* ── Sticky sidebar ── */}
          {Object.keys(rawSpending).length > 0 && (
            <SpendingSidebar
              spending={rawSpending}
              month={rawSpending.month as string ?? latest?.month ?? ""}
            />
          )}
        </div>
      </div>
    </main>
  );
}
