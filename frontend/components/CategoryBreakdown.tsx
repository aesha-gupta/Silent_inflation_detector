"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface CategoryBreakdownProps {
  contributions: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#111827",
        border: "1px solid #1F2937",
        borderRadius: "0.5rem",
        padding: "0.6rem 0.9rem",
        fontSize: "0.8rem",
      }}
    >
      <p style={{ color: "#6B7280", marginBottom: "0.2rem" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono), monospace", color: "#00D4AA" }}>
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
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "0.5rem" }}>
        Category Inflation Contributions
      </h2>
      <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "1.25rem" }}>
        Percentage point contribution to your personal inflation rate (latest month)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono), monospace" }}
            axisLine={{ stroke: "#1F2937" }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: "#E5E7EB", fontSize: 12 }}
            axisLine={{ stroke: "#1F2937" }}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(31,41,55,0.4)" }} />
          <Bar dataKey="value" radius={4} maxBarSize={24}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={entry.value === maxVal ? "#00D4AA" : "#374151"}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: number) => v.toFixed(3)}
              style={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "var(--font-mono), monospace" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
