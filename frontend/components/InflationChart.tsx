"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  personal_inflation_rate: number;
  national_cpi_rate: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "#111827", border: "1px solid #1F2937", borderRadius: "0.5rem", padding: "0.75rem 1rem", fontSize: "0.8rem" }}>
      <p style={{ color: "#6B7280", marginBottom: "0.4rem", fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontFamily: "var(--font-mono), monospace" }}>
          {p.name}: <strong>{p.value?.toFixed(2)}%</strong>
        </p>
      ))}
    </div>
  );
};

export default function InflationChart({ data }: { data: DataPoint[] }) {
  // Single-month: 3 value cards + hint to add more
  if (data.length === 1) {
    const d = data[0];
    const diff = d.personal_inflation_rate - d.national_cpi_rate;
    const above = diff >= 0;
    return (
      <div className="card">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "0.25rem" }}>
          Personal vs National Inflation
        </h2>
        <p style={{ fontSize: "0.78rem", color: "#6B7280", marginBottom: "1.5rem" }}>
          {d.month} — add more months to see the trend line
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { label: "Your Rate", value: `${d.personal_inflation_rate.toFixed(2)}%`, color: "#00D4AA" },
            { label: "National CPI", value: `${d.national_cpi_rate.toFixed(2)}%`, color: "#9CA3AF" },
            { label: "Difference", value: `${above ? "+" : ""}${diff.toFixed(2)} pp`, color: above ? "#EF4444" : "#10B981" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "#0A0F1E", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-mono,monospace)", fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multi-month: full line chart
  return (
    <div className="card">
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "1.25rem" }}>
        Personal vs National Inflation
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={{ stroke: "#1F2937" }} />
          <YAxis tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "var(--font-mono), monospace" }} axisLine={{ stroke: "#1F2937" }} tickLine={{ stroke: "#1F2937" }} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#6B7280", paddingTop: "0.75rem" }} />
          <Line type="monotone" dataKey="personal_inflation_rate" name="Personal Inflation" stroke="#00D4AA" strokeWidth={2} dot={{ fill: "#00D4AA", r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="national_cpi_rate" name="National CPI" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#6B7280", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
