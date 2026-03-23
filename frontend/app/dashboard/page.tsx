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
  return (
    <div style={{
      width: w, height: h,
      backgroundColor: "var(--bg-card-low)",
      borderRadius: 2,
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
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
      const entries = (spendRes as any).entries ?? [];
      if (entries.length > 0) setRawSpending(entries[entries.length - 1]);

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
      if (err.message?.toLowerCase().includes("no spending data") || err.message?.toLowerCase().includes("at least")) {
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

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "2rem" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Skeleton h={36} w="45%" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px" }}>
              <Skeleton h={110} /><Skeleton h={110} /><Skeleton h={110} />
            </div>
            <Skeleton h={280} /><Skeleton h={250} /><Skeleton h={180} />
          </div>
          <Skeleton h={380} w="240px" />
        </div>
      </main>
    );
  }

  /* ── No data ── */
  if (needsMore) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--accent-teal)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>
            — No Data Yet —
          </p>
          <h2 className="display-heading" style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>No spending data</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.875rem", lineHeight: 1.7 }}>
            Submit your monthly spending to see your personal inflation rate.
          </p>
          <Link href="/" className="btn-primary">← Add Spending Data</Link>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "var(--accent-red)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>{error}</p>
          <button onClick={fetchAll} className="btn-primary">↺ Retry</button>
        </div>
      </main>
    );
  }

  const isAbove = (latest?.difference ?? 0) >= 0;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent-teal)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              ◈ Personal Inflation Dashboard
            </p>
            <h1 className="display-heading" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", marginBottom: "0.25rem" }}>
              Your Inflation Report
            </h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {history.length} month{history.length !== 1 ? "s" : ""} of data · latest: {latest?.month ?? "—"}
            </p>
          </div>
          <Link href="/" className="btn-secondary">+ Add Month</Link>
        </div>

        {/* ── 2-col layout ── */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>

          {/* ── Main column ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Stat cards */}
            {latest && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(93,64,56,0.2)" }}>
                <div className="stat-card">
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Your Inflation</p>
                  <p className="font-mono-numbers" style={{ fontSize: "2.6rem", fontWeight: 700, color: isAbove ? "var(--accent-orange)" : "var(--accent-lime)", lineHeight: 1, marginTop: "0.25rem" }}>
                    <CountUp end={latest.personal_inflation_rate} decimals={2} duration={1.5} suffix="%" />
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>personal rate</p>
                </div>

                <div className="stat-card">
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>National CPI</p>
                  <p className="font-mono-numbers" style={{ fontSize: "2.6rem", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1, marginTop: "0.25rem" }}>
                    <CountUp end={latest.national_cpi_rate} decimals={2} duration={1.5} suffix="%" />
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>RBI CPI Urban YoY</p>
                </div>

                <div className="stat-card">
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Difference</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginTop: "0.25rem" }}>
                    <span style={{ fontSize: "1.1rem", color: isAbove ? "var(--accent-orange)" : "var(--accent-lime)" }}>{isAbove ? "↑" : "↓"}</span>
                    <p className="font-mono-numbers" style={{ fontSize: "2.6rem", fontWeight: 700, color: isAbove ? "var(--accent-orange)" : "var(--accent-lime)", lineHeight: 1 }}>
                      <CountUp end={Math.abs(latest.difference)} decimals={2} duration={1.5} suffix=" pp" />
                    </p>
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>{isAbove ? "above" : "below"} national avg</p>
                </div>
              </div>
            )}

            {/* Chart */}
            {history.length >= 1 && <InflationChart data={history} />}

            {/* Category breakdown */}
            {latest?.category_contributions && (
              <CategoryBreakdown contributions={latest.category_contributions} />
            )}

            {/* Forecast */}
            {Object.keys(forecasts).length > 0 && <ForecastPanel forecasts={forecasts} />}

            {/* Insights */}
            {insights.length > 0 && <InsightCards cards={insights} />}

            {/* Anomalies */}
            <AnomalyBadge anomalies={anomalies} />

            {/* Entertainment */}
            {latest && <EntertainmentFlag amount={latest.entertainment_spend} />}

            {/* What-If CTA */}
            <div style={{ textAlign: "center", paddingTop: "1rem" }}>
              <Link href="/whatif" className="btn-primary" style={{ fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                Run What-If Simulator →
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          {Object.keys(rawSpending).length > 0 && (
            <SpendingSidebar
              spending={rawSpending}
              month={(rawSpending.month as unknown as string) ?? latest?.month ?? ""}
            />
          )}
        </div>
      </div>
    </main>
  );
}
