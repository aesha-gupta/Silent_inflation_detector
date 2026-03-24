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
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--frame-color)",
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
      <div className="w-full min-h-screen flex items-center justify-center border-b border-[var(--frame-color)]">
        <Skeleton h={40} w="300px" />
      </div>
    );
  }

  /* ── No data ── */
  if (needsMore) {
    return (
      <div className="w-full min-h-(100vh) flex items-center justify-center pad-grid border-b border-[var(--frame-color)]">
        <div className="text-center">
          <p className="font-mono text-xs text-accent-teal uppercase tracking-widest mb-4">
            [ No Telemetry Data ]
          </p>
          <h2 className="brutalist-heading text-4xl mb-4">Awaiting Input</h2>
          <Link href="/" className="btn-primary mt-4">INITIALIZE DATA →</Link>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="w-full min-h-(100vh) flex items-center justify-center pad-grid border-b border-[var(--frame-color)]">
        <div className="text-center">
          <p className="text-accent-red font-mono uppercase tracking-widest mb-4">[ ERR: {error} ]</p>
          <button onClick={fetchAll} className="btn-primary">RETRY CONNECTION</button>
        </div>
      </div>
    );
  }

  const isAbove = (latest?.difference ?? 0) >= 0;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">

      {/* ── Main Data Column ── */}
      <div className="flex-1 flex flex-col border-r border-[var(--frame-color)]">
        
        {/* Header Block */}
        <div className="pad-grid border-b border-[var(--frame-color)] flex justify-between items-end relative overflow-hidden">
          <div className="z-10">
            <p className="font-mono text-[10px] text-accent-teal tracking-widest uppercase mb-2">
              .01 // TELEMETRY REPORT
            </p>
            <h1 className="brutalist-heading" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              DASHBOARD
            </h1>
          </div>
          <div className="z-10 text-right">
            <p className="font-mono text-xs text-text-muted">
              {history.length} RECORDS · LATEST: {latest?.month}
            </p>
          </div>
          {/* Decorative giant digit */}
          <div className="absolute -bottom-8 -right-4 font-display font-black text-[10rem] text-[var(--frame-color)] opacity-20 leading-none select-none">
            01
          </div>
        </div>

        {/* ── TOP KPIs (Grid row) ── */}
        {latest && (
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[var(--frame-color)] bg-[var(--bg-card)]">
            
            {/* KPI 1 */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--frame-color)] relative group">
              <div className="absolute top-2 right-2 font-mono text-[9px] text-text-dim">+</div>
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold mb-4">
                Personal Rate
              </p>
              <p className="font-mono text-5xl font-bold tracking-tighter" style={{ color: isAbove ? "var(--accent-orange)" : "var(--accent-lime)" }}>
                <CountUp end={latest.personal_inflation_rate} decimals={2} duration={1.5} />
                <span className="text-2xl ml-1">%</span>
              </p>
            </div>

            {/* KPI 2 */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--frame-color)] relative group">
              <div className="absolute top-2 right-2 font-mono text-[9px] text-text-dim">+</div>
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold mb-4">
                National Baseline
              </p>
              <p className="font-mono text-5xl font-bold text-text-muted tracking-tighter">
                <CountUp end={latest.national_cpi_rate} decimals={2} duration={1.5} />
                <span className="text-2xl ml-1">%</span>
              </p>
            </div>

            {/* KPI 3 */}
            <div className="p-6 md:p-8 relative group">
              <div className="absolute top-2 right-2 font-mono text-[9px] text-text-dim">+</div>
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold mb-4">
                Variance
              </p>
              <p className="font-mono text-5xl font-bold tracking-tighter flex items-end" style={{ color: isAbove ? "var(--accent-orange)" : "var(--accent-lime)" }}>
                <span className="text-2xl mr-2 mb-1">{isAbove ? "↑" : "↓"}</span>
                <CountUp end={Math.abs(latest.difference)} decimals={2} duration={1.5} />
                <span className="text-xl ml-2 mb-1 text-text-dim uppercase tracking-widest">PP</span>
              </p>
            </div>

          </div>
        )}

        {/* ── Main content sections ── */}
        <div className="flex flex-col">
          
          <div className="pad-grid border-b border-[var(--frame-color)] relative">
            <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">CHART.01</div>
            {history.length >= 1 && <InflationChart data={history} />}
          </div>

          <div className="pad-grid border-b border-[var(--frame-color)] relative">
            <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">ALLOCATION.02</div>
            {latest?.category_contributions && <CategoryBreakdown contributions={latest.category_contributions} />}
          </div>

          {Object.keys(forecasts).length > 0 && (
            <div className="pad-grid border-b border-[var(--frame-color)] relative">
               <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">PREDICTION.03</div>
              <ForecastPanel forecasts={forecasts} />
            </div>
          )}

          {insights.length > 0 && (
            <div className="pad-grid border-b border-[var(--frame-color)] relative">
               <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">ANALYSIS.04</div>
              <InsightCards cards={insights} />
            </div>
          )}

          <div className="pad-grid border-b border-[var(--frame-color)] relative">
             <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">ANOMALY.05</div>
            <AnomalyBadge anomalies={anomalies} />
          </div>

          {latest && latest.entertainment_spend > 0 && (
            <div className="pad-grid border-b border-[var(--frame-color)] relative">
               <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">FLAG.06</div>
              <EntertainmentFlag amount={latest.entertainment_spend} />
            </div>
          )}

        </div>
      </div>

      {/* ── Sidebar Column ── */}
      <div className="w-full lg:w-[320px] lg:min-h-[calc(100vh-3.5rem)] bg-[var(--bg-card)] relative">
        <div className="sticky top-0 h-full">
          {Object.keys(rawSpending).length > 0 ? (
            <SpendingSidebar
              spending={rawSpending}
              month={(rawSpending.month as unknown as string) ?? latest?.month ?? ""}
            />
          ) : (
            <div className="p-8 text-center text-text-dim font-mono text-xs">No Sidebar Data</div>
          )}

          {/* Action Footer in Sidebar */}
          <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[var(--frame-color)] bg-[var(--bg-card-low)]">
            <Link href="/whatif" className="btn-primary w-full text-center flex justify-center py-4">
              LAUNCH SIMULATOR →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
