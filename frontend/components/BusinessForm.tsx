"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SectorDefinition } from "@/types";

type MultiBusinessRow = {
  month: string;
  costs: Record<string, string>;
};

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const createEmptyCosts = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, ""])) as Record<string, string>;

const createEmptyBusinessRow = (keys: string[]): MultiBusinessRow => ({
  month: "",
  costs: createEmptyCosts(keys),
});

const previousMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
};

export default function BusinessForm() {
  const router = useRouter();
  const [sectors, setSsectors] = useState<Record<string, SectorDefinition>>({});
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [entryMode, setEntryMode] = useState<"single" | "multi">("single");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [month, setMonth] = useState("");
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [multiRows, setMultiRows] = useState<MultiBusinessRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMonth(previousMonth());

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

  useEffect(() => {
    const activeSectorDef = sectors[selectedSector];
    if (!activeSectorDef) return;

    const categoryKeys = Object.keys(activeSectorDef.categories);
    setCosts(createEmptyCosts(categoryKeys));
    setMultiRows((prev) => {
      if (prev.length === 0) return [createEmptyBusinessRow(categoryKeys)];
      return prev.map((row) => ({ month: row.month, costs: createEmptyCosts(categoryKeys) }));
    });
  }, [selectedSector, sectors]);

  const handleCostChange = (key: string, val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setCosts(prev => ({ ...prev, [key]: clean }));
  };

  const handleMultiCostChange = (rowIndex: number, catKey: string, val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setMultiRows((prev) => prev.map((row, i) => {
      if (i !== rowIndex) return row;
      return { ...row, costs: { ...row.costs, [catKey]: clean } };
    }));
  };

  const handleMultiMonthChange = (rowIndex: number, val: string) => {
    setMultiRows((prev) => prev.map((row, i) => (i === rowIndex ? { ...row, month: val } : row)));
  };

  const addMultiRow = () => {
    const activeSectorDef = sectors[selectedSector];
    if (!activeSectorDef) return;
    setMultiRows((prev) => [...prev, createEmptyBusinessRow(Object.keys(activeSectorDef.categories))]);
  };

  const removeMultiRow = (rowIndex: number) => {
    const activeSectorDef = sectors[selectedSector];
    if (!activeSectorDef) return;
    setMultiRows((prev) => {
      if (prev.length === 1) return [createEmptyBusinessRow(Object.keys(activeSectorDef.categories))];
      return prev.filter((_, i) => i !== rowIndex);
    });
  };

  const fillSampleRows = () => {
    const activeSectorDef = sectors[selectedSector];
    if (!activeSectorDef) return;
    const categoryKeys = Object.keys(activeSectorDef.categories);
    const monthA = previousMonth();
    const [y, m] = monthA.split("-");
    const monthBDate = new Date(Number(y), Number(m) - 1, 1);
    monthBDate.setMonth(monthBDate.getMonth() - 1);
    const monthB = `${monthBDate.getFullYear()}-${String(monthBDate.getMonth() + 1).padStart(2, "0")}`;

    const rowA = createEmptyBusinessRow(categoryKeys);
    rowA.month = monthB;
    categoryKeys.forEach((k, idx) => {
      rowA.costs[k] = String((idx + 2) * 1000);
    });

    const rowB = createEmptyBusinessRow(categoryKeys);
    rowB.month = monthA;
    categoryKeys.forEach((k, idx) => {
      rowB.costs[k] = String((idx + 2) * 1200);
    });

    setMultiRows([rowA, rowB]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const activeSectorDef = sectors[selectedSector];
    if (!activeSectorDef) {
      setError("Please select a valid sector.");
      setSubmitting(false);
      return;
    }

    const categoryKeys = Object.keys(activeSectorDef.categories);

    if (entryMode === "multi") {
      const nonEmptyRows = multiRows.filter((row) => {
        const hasMonth = row.month.trim().length > 0;
        const hasCost = categoryKeys.some((k) => (row.costs[k] || "").trim().length > 0);
        return hasMonth || hasCost;
      });

      if (nonEmptyRows.length === 0) {
        setError("Add at least one month row for business data.");
        setSubmitting(false);
        return;
      }

      const seenMonths = new Set<string>();
      const entries: Array<{ month: string; costs: Record<string, number> }> = [];

      for (let i = 0; i < nonEmptyRows.length; i += 1) {
        const row = nonEmptyRows[i];
        const rowMonth = row.month.trim();
        if (!MONTH_REGEX.test(rowMonth)) {
          setError(`Row ${i + 1}: month must be YYYY-MM.`);
          setSubmitting(false);
          return;
        }
        if (seenMonths.has(rowMonth)) {
          setError(`Duplicate month found: ${rowMonth}`);
          setSubmitting(false);
          return;
        }
        seenMonths.add(rowMonth);

        const parsedCosts: Record<string, number> = {};
        for (const catKey of categoryKeys) {
          const val = row.costs[catKey] || "";
          const numeric = val.trim() === "" ? 0 : Number(val);
          if (Number.isNaN(numeric) || numeric < 0) {
            setError(`Row ${i + 1}: invalid value for ${activeSectorDef.categories[catKey]}.`);
            setSubmitting(false);
            return;
          }
          parsedCosts[catKey] = numeric;
        }

        if (Object.values(parsedCosts).reduce((a, b) => a + b, 0) <= 0) {
          setError(`Row ${i + 1}: at least one cost must be greater than zero.`);
          setSubmitting(false);
          return;
        }

        entries.push({ month: rowMonth, costs: parsedCosts });
      }

      try {
        const res = await api.getBusinessInflationBatch({ sector: selectedSector, entries });
        const history = (res?.results || []) as Array<Record<string, any>>;
        const latest = history[history.length - 1];

        sessionStorage.setItem("businessHistory", JSON.stringify(history));
        if (latest) {
          sessionStorage.setItem("businessResult", JSON.stringify(latest));
          sessionStorage.setItem("businessMonth", String(latest.month || ""));
        }
        sessionStorage.setItem("businessParams", JSON.stringify({
          sector: selectedSector,
          month: latest?.month || entries[entries.length - 1].month,
          costs: entries[entries.length - 1].costs,
        }));
        router.push("/business-dashboard");
      } catch (err: any) {
        setError(err.message || "Failed to calculate business inflation.");
        setSubmitting(false);
      }
      return;
    }

    try {
      const parsedCosts: Record<string, number> = {};
      for (const key of categoryKeys) {
        parsedCosts[key] = parseFloat(costs[key] || "0") || 0;
      }

      const res = await api.getBusinessInflation({
        sector: selectedSector,
        costs: parsedCosts,
        month,
      });

      sessionStorage.removeItem("businessHistory");
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
  const activeCategoryEntries = activeSectorDef ? Object.entries(activeSectorDef.categories) : [];

  const modeButtonStyle = (isActive: boolean): React.CSSProperties => ({
    border: "1px solid rgba(93,64,56,0.35)",
    padding: "0.45rem 0.6rem",
    fontFamily: "var(--font-mono)",
    fontSize: "0.68rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    backgroundColor: isActive ? "var(--accent-teal)" : "transparent",
    color: isActive ? "#000" : "var(--text-muted)",
    fontWeight: 700,
  });

  const categoryLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.4rem",
    fontFamily: "var(--font-display)",
    fontSize: "0.62rem",
    fontWeight: 700,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)] text-[var(--accent-red)] p-3 text-xs font-mono">
          {error}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem",
        border: "1px solid rgba(93,64,56,0.35)",
        backgroundColor: "var(--bg-card-low)",
        padding: "0.4rem",
      }}>
        <button type="button" onClick={() => setEntryMode("single")} style={modeButtonStyle(entryMode === "single")}>
          Single Month
        </button>
        <button type="button" onClick={() => setEntryMode("multi")} style={modeButtonStyle(entryMode === "multi")}>
          Multi Month
        </button>
      </div>

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

      {entryMode === "single" ? (
        <div className="space-y-4 pt-4 border-t border-[var(--frame-color)]">
          <p className="font-mono text-[10px] text-[var(--accent-teal)] uppercase tracking-widest">
            Input Monthly Costs (₹)
          </p>

          {activeCategoryEntries.map(([catKey, label]) => (
            <div key={catKey}>
              <label style={categoryLabelStyle}>{label}</label>
              <div className="flex relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-teal)] transition-colors">
                  ₹
                </span>
                <input
                  className="input-field w-full pl-8"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={costs[catKey] || ""}
                  onChange={e => handleCostChange(catKey, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pt-4 border-t border-[var(--frame-color)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="font-mono text-[10px] text-[var(--accent-teal)] uppercase tracking-widest">
              Input Multiple Months (₹)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillSampleRows}
                className="border border-[var(--frame-color)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
              >
                Use Sample
              </button>
              <button
                type="button"
                onClick={addMultiRow}
                className="border border-[var(--frame-color)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
              >
                Add Row
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {multiRows.map((row, rowIndex) => (
              <div key={`b-row-${rowIndex}`} className="border border-[var(--frame-color)] bg-[var(--bg-card-low)] p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Month Row {rowIndex + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeMultiRow(rowIndex)}
                    className="border border-[var(--frame-color)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block space-y-2">
                    <span className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-wider">Month</span>
                    <input
                      type="month"
                      className="input-field w-full font-mono text-sm py-3"
                      value={row.month}
                      onChange={(e) => handleMultiMonthChange(rowIndex, e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeCategoryEntries.map(([catKey, label]) => (
                    <div key={`${rowIndex}-${catKey}`}>
                      <label style={categoryLabelStyle}>{label}</label>
                      <div className="flex relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                          ₹
                        </span>
                        <input
                          className="input-field w-full pl-8"
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={row.costs[catKey] || ""}
                          onChange={(e) => handleMultiCostChange(rowIndex, catKey, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {submitting ? "PROCESSING..." : entryMode === "single" ? "CALCULATE MARGIN PRESSURE →" : "CALCULATE MULTI-MONTH PRESSURE →"}
      </button>
    </form>
  );
}
