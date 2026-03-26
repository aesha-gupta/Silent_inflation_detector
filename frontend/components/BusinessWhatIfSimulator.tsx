"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { SectorDefinition, BusinessInflationResult } from "@/types";

export default function BusinessWhatIfSimulator() {
  const [baseParams, setBaseParams] = useState<any>(null);
  const [baseResult, setBaseResult] = useState<BusinessInflationResult | null>(null);
  const [sectorsData, setSsectorsData] = useState<Record<string, SectorDefinition>>({});
  
  const [category, setCategory] = useState<string>("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [simulatedResult, setSimulatedResult] = useState<BusinessInflationResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const storedResult = sessionStorage.getItem("businessResult");
      const storedParams = sessionStorage.getItem("businessParams");
      if (storedResult) setBaseResult(JSON.parse(storedResult));
      if (storedParams) {
        const parsed = JSON.parse(storedParams);
        setBaseParams(parsed);
        const keys = Object.keys(parsed.costs);
        if (keys.length > 0) {
          setCategory(keys[0]);
          setNewAmount(parsed.costs[keys[0]]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    api.getBusinessSectors()
      .then(setSsectorsData)
      .catch(e => console.error("Failed to load sectors", e));
  }, []);

  const baseAmt = baseParams?.costs?.[category] ?? 0;
  const sliderMax = Math.max(baseAmt * 3, 50000);

  const simulate = async (cat: string, amt: number) => {
    if (!baseParams) return;
    setLoading(true);
    setError(null);
    try {
      // Create new costs object
      const simulatedCosts = { ...baseParams.costs, [cat]: amt };
      
      const res = await api.getBusinessInflation({
        sector: baseParams.sector,
        costs: simulatedCosts,
        month: baseParams.month,
      });
      setSimulatedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to run simulation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSlider = (v: number) => {
    setNewAmount(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      simulate(category, v);
    }, 500);
  };

  const handleCategoryChange = (key: string) => {
    setCategory(key);
    const amt = baseParams?.costs?.[key] ?? 0;
    setNewAmount(amt);
    setSimulatedResult(null); // reset sim when category changes
  };

  if (!baseParams || !baseResult) {
    return (
      <div className="pad-grid border-b border-[var(--frame-color)]">
        <p className="font-mono text-sm text-[var(--accent-orange)]">No underlying business data found. Please run the business inflation calculator first.</p>
      </div>
    );
  }

  const activeSector = sectorsData[baseParams.sector];
  const activeCategories = activeSector?.categories || {};

  // For Delta display
  const currentInflation = simulatedResult ? simulatedResult.business_inflation_rate : baseResult.business_inflation_rate;
  const originalInflation = baseResult.business_inflation_rate;
  const delta = currentInflation - originalInflation;

  const isWorse = delta > 0;
  const isBetter = delta < 0;
  const isNeutral = delta === 0;

  return (
    <div className="max-w-3xl mx-auto w-full p-6 md:p-12">
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[var(--accent-teal)] tracking-widest uppercase mb-2">
          .01 // SIMULATION ENGINE
        </p>
        <h1 className="brutalist-heading text-4xl mb-4">Business What-If Simulator</h1>
        <p className="font-mono text-sm text-text-muted">
          Adjust cost constraints for your sector ({activeSector?.display_name || baseParams.sector}) and observe real-time impact on your overall business inflation rate.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--frame-color)] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-mono text-xs text-[var(--text-dim)] uppercase tracking-wider mb-2">Cost Driver to Simulate</label>
            <div className="flex flex-col gap-2">
              {Object.entries(activeCategories).map(([catKey, label]) => {
                const isActive = catKey === category;
                return (
                  <button
                    key={catKey}
                    onClick={() => handleCategoryChange(catKey)}
                    className={`text-left p-3 border font-mono text-sm transition-colors ${
                      isActive 
                        ? "border-[var(--accent-teal)] bg-[var(--accent-teal)] text-black" 
                        : "border-[var(--frame-color)] text-[var(--text-muted)] hover:border-text-muted"
                    }`}
                  >
                    {label as string} <span className="float-right text-[10px] pt-0.5">[{baseParams.costs[catKey] > 0 ? 'Active' : 'Zero'}]</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-display font-bold uppercase tracking-widest text-[#fff] mb-6">
              Adjust <span className="text-[var(--accent-teal)]">{activeCategories[category] as string}</span> Cost
            </h3>
            
            <div className="mb-8">
              <input
                type="range"
                className="range-accent w-full"
                min={0}
                max={sliderMax}
                step={100}
                value={newAmount}
                onChange={(e) => handleSlider(Number(e.target.value))}
              />
              <div className="flex justify-between font-mono text-[10px] text-[var(--text-dim)] mt-2">
                <span>₹0</span>
                <span>Base: ₹{baseAmt.toLocaleString("en-IN")}</span>
                <span>₹{sliderMax.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-[var(--frame-color)] p-4 relative bg-[var(--bg-primary)]">
               <span className="font-mono text-xl text-[var(--text-dim)]">₹</span>
               <input
                 type="number"
                 value={newAmount}
                 onChange={(e) => {
                   let v = Number(e.target.value);
                   setNewAmount(v);
                   if (debounceRef.current) clearTimeout(debounceRef.current);
                   debounceRef.current = setTimeout(() => simulate(category, v), 600);
                 }}
                 className="bg-transparent border-b border-[var(--frame-color)] font-mono text-2xl w-full text-white outline-none focus:border-[var(--accent-teal)] transition-colors"
               />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="animate-pulse h-32 bg-[var(--bg-card)] border border-[var(--frame-color)] flex items-center justify-center font-mono text-xs text-[var(--text-dim)]">
          RECALCULATING MATRIX...
        </div>
      )}

      {error && (
        <div className="p-4 border border-[var(--accent-red)] text-[var(--accent-red)] font-mono text-sm bg-[var(--accent-red)]/10">
          [ERR] {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--frame-color)] p-6 relative">
              <div className="absolute top-0 right-0 bg-[var(--frame-color)] text-[var(--bg-primary)] px-2 py-0.5 text-[9px] font-mono">NEW INFLATION</div>
              <p className="font-mono text-5xl font-bold tracking-tighter mt-4" style={{ color: "var(--text-primary)" }}>
                  {currentInflation.toFixed(2)}<span className="text-2xl ml-1">%</span>
              </p>
              <p className="font-mono text-xs text-[var(--text-dim)] mt-2">Simulated overall cost pressure</p>
            </div>
            
            <div className="bg-[var(--bg-card)] border border-[var(--frame-color)] p-6 relative">
              <div className="absolute top-0 right-0 bg-[var(--frame-color)] text-[var(--bg-primary)] px-2 py-0.5 text-[9px] font-mono">IMPACT</div>
              <p className="font-mono text-5xl font-bold tracking-tighter flex items-end mt-4" style={{ color: isWorse ? "var(--accent-red)" : isBetter ? "var(--accent-lime)" : "var(--text-dim)" }}>
                  {isWorse && <span className="text-2xl mr-2 mb-1">↑</span>}
                  {isBetter && <span className="text-2xl mr-2 mb-1">↓</span>}
                  {Math.abs(delta).toFixed(2)}
                  <span className="text-xl ml-2 mb-1 text-[var(--text-dim)] uppercase tracking-widest">PP</span>
              </p>
              <p className="font-mono text-xs text-[var(--text-dim)] mt-2">
                  {isNeutral ? "No change in overall cost burden." : isWorse ? "Increased cost pressure." : "Decreased cost pressure."}
              </p>
            </div>
          </div>
          
          {/* Analysis Note */}
          <div className="p-4 border-l-2 border-[var(--accent-orange)] bg-[var(--accent-orange)]/5">
            <p className="font-mono text-xs text-[var(--text-muted)] leading-relaxed">
              <span className="text-[var(--accent-orange)] font-bold">ANALYST NOTE:</span> This simulation shows the mathematical property of weighted averages — shifting spend toward items with lower base inflation rates lowers your <em>aggregate</em> rate. <strong className="text-[var(--text-primary)]">This is not a recommendation to spend more on those overheads just to reduce the rate.</strong> Good margins come from reducing total absolute costs, evaluating supply chain contracts, and identifying cost efficiency, not just chasing a lower blended percentage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
