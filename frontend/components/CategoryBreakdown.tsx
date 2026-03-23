"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";

interface CategoryBreakdownProps {
  contributions: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: "var(--bg-card-low)",
      border: "1px solid rgba(93,64,56,0.4)",
      borderRadius: 2,
      padding: "0.6rem 0.9rem",
      fontFamily: "var(--font-display)",
    }}>
      <p style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent-teal)", fontWeight: 700 }}>
        {payload[0]?.value?.toFixed(3)} pp
      </p>
    </div>
  );
};

export default function CategoryBreakdown({ contributions }: CategoryBreakdownProps) {
  const data = Object.entries(contributions)
    .map(([cat, val]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: parseFloat(val.toFixed(4)),
    }))
    .sort((a, b) => b.value - a.value);

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="card">
      <p className="section-label">Category Contributions</p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Percentage point contribution to your personal inflation rate (latest month)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, left: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(93,64,56,0.25)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "var(--text-dim)", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={{ stroke: "rgba(93,64,56,0.3)" }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
            axisLine={{ stroke: "rgba(93,64,56,0.3)" }}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(93,64,56,0.12)" }} />
          <Bar dataKey="value" radius={0} maxBarSize={18}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={entry.value === maxVal ? "#FC4402" : "rgba(47,244,221,0.35)"}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: any) => typeof v === 'number' ? v.toFixed(3) : v}
              style={{ fill: "var(--text-dim)", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
