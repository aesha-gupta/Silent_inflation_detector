"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SectorDefinition } from "@/types";

export default function BusinessForm() {
  const router = useRouter();
  const [sectors, setSsectors] = useState<Record<string, SectorDefinition>>({});
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSector, setSelectedSector] = useState<string>("");
  const [month, setMonth] = useState("");
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Set default month to previous month
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setMonth(`${d.getFullYear()}-${m}`);

    api.getBusinessSectors()
      .then((data) => {
        setSsectors(data);
        const keys = Object.keys(data);
        if (keys.length > 0) {
          setSelectedSector(keys[0]);
        }
      })
      .catch((err) => setError("Failed to load sectors: " + err.message))
      .finally(() => setLoadingSectors(false));
  }, []);

  const handleCostChange = (key: string, val: string) => {
    setCosts(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const parsedCosts: Record<string, number> = {};
      for (const [key, val] of Object.entries(costs)) {
        parsedCosts[key] = parseFloat(val) || 0;
      }

      const res = await api.getBusinessInflation({
        sector: selectedSector,
        costs: parsedCosts,
        month,
      });

      // Save to sessionStorage for dashboard
      sessionStorage.setItem("businessResult", JSON.stringify(res));
      sessionStorage.setItem("businessMonth", month);
      sessionStorage.setItem("businessParams", JSON.stringify({
        sector: selectedSector,
        costs: parsedCosts,
        month,
      }));
      
      router.push("/business-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to calculate business inflation.");
      setSubmitting(false);
    }
  };

  if (loadingSectors) {
    return <div className="animate-pulse h-64 bg-[var(--bg-card)] border border-[var(--frame-color)]" />;
  }

  const activeSectorDef = sectors[selectedSector];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)] text-[var(--accent-red)] p-3 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-wider">Sector</span>
          <select 
            className="input-field w-full font-mono text-sm py-3"
            value={selectedSector} 
            onChange={e => {
              setSelectedSector(e.target.value);
              setCosts({});
            }}
          >
            {Object.entries(sectors).map(([key, def]) => (
              <option key={key} value={key} className="bg-[var(--bg-primary)]">
                {def.display_name}
              </option>
            ))}
          </select>
        </label>
        
        <label className="block space-y-2">
          <span className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-wider">Month</span>
          <input 
            type="month" 
            className="input-field w-full font-mono text-sm py-3"
            value={month} 
            onChange={e => setMonth(e.target.value)} 
            required 
          />
        </label>
      </div>

      <div className="space-y-4 pt-4 border-t border-[var(--frame-color)]">
        <p className="font-mono text-[10px] text-[var(--accent-teal)] uppercase tracking-widest">
          Input Monthly Costs (₹)
        </p>

        {activeSectorDef && Object.entries(activeSectorDef.categories).map(([catKey, label]) => (
          <div key={catKey} className="flex relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-teal)] transition-colors">
              ₹
            </span>
            <input
              className="input-field w-full pl-8"
              type="number"
              min="0"
              step="any"
              placeholder={label}
              value={costs[catKey] || ""}
              onChange={e => handleCostChange(catKey, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-3 bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/20 mt-4">
        <div className="text-[var(--accent-orange)] mt-0.5">⚠</div>
        <p className="font-mono text-[10px] text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--accent-orange)] font-bold">INFO:</span> Labour inflation assumed at 8% (avg Indian informal sector)
        </p>
      </div>

      <button 
        type="submit" 
        className="btn-primary w-full py-4 text-sm mt-8"
        disabled={submitting}
      >
        {submitting ? "PROCESSING..." : "CALCULATE MARGIN PRESSURE →"}
      </button>
    </form>
  );
}
