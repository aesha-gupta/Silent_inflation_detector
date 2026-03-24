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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex-1 w-full min-h-(100vh) flex items-center justify-center p-8">
        <div className="font-mono text-xs text-text-muted flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-accent-teal animate-pulse" />
          ESTABLISHING SECURE HANDSHAKE...
        </div>
      </div>
    );
  }

  /* ── No data ── */
  if (noData) {
    return (
      <div className="w-full min-h-(100vh) flex items-center justify-center pad-grid border-b border-[var(--frame-color)]">
        <div className="text-center">
          <p className="font-mono text-xs text-accent-orange uppercase tracking-widest mb-4">
            [ Missing Baseline Data ]
          </p>
          <h2 className="brutalist-heading text-4xl mb-4">NO TELEMETRY RECORDED</h2>
          <Link href="/" className="btn-primary mt-4">INPUT BASELINE →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">

      {/* ── Main Simulator Column ── */}
      <div className="flex-1 flex flex-col border-r border-[var(--frame-color)] relative">
        
        {/* Header Block */}
        <div className="pad-grid border-b border-[var(--frame-color)] flex justify-between items-end relative overflow-hidden bg-[var(--bg-card)]">
          <div className="z-10">
            <Link href="/dashboard" className="inline-block hover-reveal font-mono text-[10px] text-text-muted tracking-widest uppercase mb-6">
              ← RETURN TO DASHBOARD
            </Link>
            <p className="font-mono text-[10px] text-accent-teal tracking-widest uppercase mb-2">
              .02 // SCENARIO ANALYSIS
            </p>
            <h1 className="brutalist-heading" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              WHAT-IF ENGINE
            </h1>
          </div>
          <div className="z-10 text-right">
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-[0.2em] mb-1">
              Active Baseline
            </p>
            <p className="font-mono-numbers text-accent-teal text-xl font-bold">
              {base?.month}
            </p>
          </div>
          {/* Decorative giant digit */}
          <div className="absolute -bottom-8 -right-4 font-display font-black text-[10rem] text-[var(--frame-color)] opacity-20 leading-none select-none">
            02
          </div>
        </div>

        {/* ── Simulator Grid ── */}
        {base && (
          <div className="pad-grid border-b border-[var(--frame-color)] relative">
            <div className="absolute top-0 left-0 bg-[var(--frame-color)] text-[var(--bg-primary)] text-[9px] font-mono px-2 py-0.5">SIMULATOR_CORE</div>
            <WhatIfSimulator baseSpending={base} />
          </div>
        )}

      </div>

      {/* ── Sidebar Column ── */}
      <div className="w-full lg:w-[320px] lg:min-h-[calc(100vh-3.5rem)] bg-[var(--bg-card)] relative">
        <div className="sticky top-0 h-full">
          {Object.keys(rawSpending).length > 0 ? (
            <SpendingSidebar
              spending={rawSpending}
              month={(rawSpending.month as unknown as string) ?? base?.month ?? ""}
            />
          ) : (
            <div className="p-8 text-center text-text-dim font-mono text-xs">No Baseline Data</div>
          )}
        </div>
      </div>

    </div>
  );
}
