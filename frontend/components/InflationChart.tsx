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
    <div style={{
      backgroundColor: "var(--bg-card-low)",
      border: "1px solid rgba(93,64,56,0.4)",
      borderRadius: 2,
      padding: "0.75rem 1rem",
    }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: p.color, fontWeight: 700 }}>
          {p.name}: {p.value?.toFixed(2)}%
        </p>
      ))}
    </div>
  );
};

export default function InflationChart({ data }: { data: DataPoint[] }) {
  if (data.length === 1) {
    const d = data[0];
    const diff = d.personal_inflation_rate - d.national_cpi_rate;
    const above = diff >= 0;
    return (
      <div className="card">
        <p className="section-label">Personal vs National — {d.month}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Add more months to see the trend line
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "rgba(93,64,56,0.2)" }}>
          {[
            { label: "Your Rate", value: `${d.personal_inflation_rate.toFixed(2)}%`, color: "var(--accent-teal)" },
            { label: "National CPI", value: `${d.national_cpi_rate.toFixed(2)}%`, color: "var(--text-muted)" },
            { label: "Difference", value: `${above ? "+" : ""}${diff.toFixed(2)} pp`, color: above ? "var(--accent-orange)" : "var(--accent-lime)" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "var(--bg-card-low)", padding: "1.25rem", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>{s.label}</p>
              <p className="font-mono-numbers" style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="section-label">Inflation Trend</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(93,64,56,0.25)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-dim)", fontSize: 10, fontFamily: "'Space Grotesk', sans-serif" }}
            axisLine={{ stroke: "rgba(93,64,56,0.3)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-dim)", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={{ stroke: "rgba(93,64,56,0.3)" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: "0.65rem",
              fontFamily: "'Space Grotesk', sans-serif",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              paddingTop: "0.75rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="personal_inflation_rate"
            name="Personal Inflation"
            stroke="#FC4402"
            strokeWidth={2}
            dot={{ fill: "#FC4402", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#FC4402", stroke: "rgba(252,68,2,0.3)", strokeWidth: 4 }}
          />
          <Line
            type="monotone"
            dataKey="national_cpi_rate"
            name="National CPI"
            stroke="rgba(255,253,219,0.35)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ fill: "rgba(255,253,219,0.35)", r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
