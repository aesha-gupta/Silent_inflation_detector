"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "react-countup";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BusinessInflationResult } from "@/types";

export default function BusinessDashboardPage() {
  const [result, setResult] = useState<BusinessInflationResult | null>(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("businessResult");
      const storedMonth = sessionStorage.getItem("businessMonth");
      if (stored) {
        setResult(JSON.parse(stored));
      }
      if (storedMonth) {
        setMonth(storedMonth);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center border-b border-[var(--frame-color)]">
        <div className="animate-pulse h-10 w-64 bg-[var(--bg-card)] border border-[var(--frame-color)]" />
      </div>
    );
  }

  if (!result) {
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

  const isAbove = result.difference > 0;
  
  // Format data for Recharts
  const chartData = Object.entries(result.category_contributions).map(([name, val]) => ({
    name,
    value: val
  })).sort((a, b) => b.value - a.value);

  const raiseColorMap = {
    "Yes": "var(--accent-red)",
    "Monitor": "var(--accent-orange)",
    "No": "var(--accent-lime)"
  };

  const raiseBgMap = {
    "Yes": "var(--accent-red)",
    "Monitor": "var(--accent-orange)",
    "No": "var(--accent-lime)"
  };

  const currentRaiseColor = raiseColorMap[result.should_raise_prices];

  return (
    <div className="flex flex-col w-full min-h-screen max-w-5xl mx-auto border-x border-[var(--frame-color)]">
        {/* Header Block */}
        <div className="pad-grid border-b border-[var(--frame-color)] flex justify-between items-end relative overflow-hidden">
          <div className="z-10">
            <p className="font-mono text-[10px] text-[var(--accent-teal)] tracking-widest uppercase mb-2">
              .01 // BUSINESS REPORT
            </p>
            <h1 className="brutalist-heading" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
              {result.sector_display_name}
            </h1>
          </div>
          <div className="z-10 text-right">
            <p className="font-mono text-xs text-[var(--text-muted)]">
              PERIOD: {month}
            </p>
          </div>
        </div>

        {/* ── TOP KPIs (Grid row) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[var(--frame-color)] bg-[var(--bg-card)]">
          {/* KPI 1 */}
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--frame-color)] relative group">
            <div className="absolute top-2 right-2 font-mono text-[9px] text-[var(--text-dim)]">+</div>
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold mb-4">
              Input Cost Inflation
            </p>
            <p className="font-mono text-5xl font-bold tracking-tighter" style={{ color: isAbove ? "var(--accent-red)" : "var(--accent-lime)" }}>
              <CountUp end={result.business_inflation_rate} decimals={2} duration={1.5} />
              <span className="text-2xl ml-1">%</span>
            </p>
          </div>

          {/* KPI 2 */}
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--frame-color)] relative group">
            <div className="absolute top-2 right-2 font-mono text-[9px] text-[var(--text-dim)]">+</div>
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold mb-4">
              WPI (General)
            </p>
            <p className="font-mono text-5xl font-bold text-[var(--text-muted)] tracking-tighter">
              <CountUp end={result.wpi_general_rate} decimals={2} duration={1.5} />
              <span className="text-2xl ml-1">%</span>
            </p>
          </div>

          {/* KPI 3 */}
          <div className="p-6 md:p-8 relative group">
            <div className="absolute top-2 right-2 font-mono text-[9px] text-[var(--text-dim)]">+</div>
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold mb-4">
              Difference
            </p>
            <p className="font-mono text-5xl font-bold tracking-tighter flex items-end" style={{ color: isAbove ? "var(--accent-red)" : "var(--accent-lime)" }}>
              <span className="text-2xl mr-2 mb-1">{isAbove ? "↑" : "↓"}</span>
              <CountUp end={Math.abs(result.difference)} decimals={2} duration={1.5} />
              <span className="text-xl ml-2 mb-1 text-[var(--text-dim)] uppercase tracking-widest">PP</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 border-b border-[var(--frame-color)]">
          {/* Should Raise Prices Card */}
          <div 
            className="p-6 mb-8 border"
            style={{ 
              backgroundColor: `${currentRaiseColor}20`,
              borderColor: currentRaiseColor
            }}
          >
            <p className="font-mono text-xs uppercase tracking-widest mb-1 text-[var(--text-dim)]">Strategic Signal</p>
            <h2 className="font-display text-2xl font-bold mb-2 uppercase" style={{ color: currentRaiseColor }}>
              Should I Raise Prices: {result.should_raise_prices}
            </h2>
            <p className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
              {result.raise_prices_message}
            </p>
          </div>

          {/* Margin Pressure Insight */}
          <div className="bg-[var(--bg-card)] border border-[var(--frame-color)] p-5 mb-8">
            <h3 className="font-mono text-xs text-[var(--accent-orange)] uppercase tracking-wider mb-2">
              Critical Insight
            </h3>
            <p className="font-mono text-sm leading-relaxed">
              Your <strong className="text-white">{result.top_cost_driver}</strong> is your biggest margin pressure. It contributes <strong className="text-[var(--accent-red)]">{result.category_contributions[result.top_cost_driver].toFixed(2)}%</strong> points to your overall cost inflation.
            </p>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <h3 className="font-display text-sm uppercase tracking-widest text-[var(--text-dim)] mb-6">
              Cost Driver Breakdown (Percentage Points)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "var(--frame-color)", opacity: 0.4 }}
                    contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--frame-color)", borderRadius: 0, fontFamily: "monospace", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === result.top_cost_driver ? "var(--accent-red)" : "var(--accent-teal)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Link */}
          <div className="text-center">
            <Link href="/business-whatif" className="btn-primary inline-flex">
              RUN WHAT-IF SIMULATOR →
            </Link>
          </div>

        </div>
    </div>
  );
}
