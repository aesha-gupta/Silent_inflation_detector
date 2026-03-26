"use client";

import { useState } from "react";
import SpendingForm from "@/components/SpendingForm";
import BusinessForm from "@/components/BusinessForm";

export default function Home() {
  const [mode, setMode] = useState<"individual" | "business">("individual");

  return (
    <div className="flex flex-col w-full h-full">
      {/* Structural Hero Grid */}
      <section className="hero-grid">
        {/* Left Column - Huge Branding */}
        <div className="hero-cell overflow-hidden group">
          <div className="cell-marker">.01 // DATA INGESTION</div>
          
          <div className="mt-auto relative z-10 transition-transform duration-700 ease-out group-hover:translate-x-4">
            <h2 className="brutalist-sub">YOUR PERSONAL INFLATION</h2>
            <h1 className="brutalist-heading">
              NOT THE <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px var(--accent-orange)" }}>
                AVERAGE
              </span>
            </h1>
            <p className="mt-8 max-w-md font-mono text-sm text-text-muted leading-relaxed">
              India's official CPI is a broad average. We map your exact spending mix against MOSPI datasets to uncover the real rate eroding your wealth.
            </p>
          </div>
          
          {/* Decorative grid element */}
          <div className="absolute bottom-0 right-0 w-24 h-24 border-l border-t border-[var(--frame-color)] flex items-center justify-center opacity-30">
            <span className="font-mono text-xs">+</span>
          </div>
        </div>

        {/* Right Column - Input Form housed in grid */}
        <div className="hero-cell bg-[#050403] relative">
          <div className="cell-marker text-[var(--accent-teal)]">.02 // PARAMETERS</div>
          
          <div className="my-auto w-full max-w-lg mx-auto slide-up">
            <div className="mb-4 pb-4 border-b border-[var(--grid-line-strong)] flex justify-between items-end">
              <h3 className="font-display font-bold text-lg tracking-widest uppercase">Input Telemetry</h3>
              <span className="font-mono text-[10px] text-accent-orange uppercase">Link Active</span>
            </div>

            <div className="flex gap-2 mb-6 border border-[var(--frame-color)] p-1 bg-[var(--bg-card)]">
              <button 
                onClick={() => setMode("individual")}
                className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${mode === "individual" ? "bg-[var(--accent-teal)] text-black font-bold" : "text-[var(--text-muted)] hover:text-white"}`}
              >
                I am an Individual
              </button>
              <button 
                onClick={() => setMode("business")}
                className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${mode === "business" ? "bg-[var(--accent-teal)] text-black font-bold" : "text-[var(--text-muted)] hover:text-white"}`}
              >
                I am a Business
              </button>
            </div>
            
            {mode === "individual" ? <SpendingForm /> : <BusinessForm />}
          </div>
          
          {/* Technical Corner lines */}
          <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-[var(--accent-teal)] opacity-50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-r border-t border-[var(--accent-orange)] opacity-50" />
        </div>
      </section>

      {/* Structural Footer / Info Bar */}
      <section className="grid grid-cols-3 border-b border-[var(--frame-color)] text-xs font-mono uppercase tracking-widest text-text-dim">
        <div className="p-4 border-r border-[var(--frame-color)] flex items-center gap-2">
          <span className="w-2 h-2 bg-accent-lime block" /> System Online
        </div>
        <div className="p-4 border-r border-[var(--frame-color)] text-center">
          Base Year: 2012=100
        </div>
        <div className="p-4 text-right">
          Dataset: CPI Urban (mospi.gov.in)
        </div>
      </section>
      
      {/* Massive Outro Wordmark (like mindjoin footer) */}
      <section className="p-8 pb-0 pt-16 flex flex-col items-center justify-center overflow-hidden h-[40vh] border-b border-[var(--frame-color)] relative">
        <h2 className="font-display font-black text-[12vw] tracking-tighter leading-none text-transparent opacity-20"
            style={{ WebkitTextStroke: "1px var(--text-muted)" }}>
          INFLATION
        </h2>
        <div className="absolute bottom-8 font-mono text-xs text-accent-teal tracking-[0.3em]">
          WHERE COMPUTATION MEETS WEALTH.
        </div>
      </section>
    </div>
  );
}
