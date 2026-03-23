"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ForecastPoint } from "@/types";

interface ForecastPanelProps {
  forecasts: Record<string, ForecastPoint[]>;
}

const CAT_COLORS: Record<string, string> = {
  food: "#00D4AA",
  housing: "#60A5FA",
  transport: "#F59E0B",
};

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        backgroundColor: "#111827",
        border: "1px solid #1F2937",
        borderRadius: "0.5rem",
        padding: "0.6rem 0.9rem",
        fontSize: "0.78rem",
      }}
    >
      <p style={{ color: "#6B7280", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ color, fontFamily: "var(--font-mono), monospace" }}>₹{d?.predicted?.toLocaleString("en-IN")}</p>
      <p style={{ color: "#4B5563", fontSize: "0.7rem" }}>
        ₹{d?.lower?.toLocaleString("en-IN")} – ₹{d?.upper?.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

function SingleForecast({ cat, data }: { cat: string; data: ForecastPoint[] }) {
  const color = CAT_COLORS[cat] ?? "#00D4AA";
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);

  return (
    <div
      style={{
        backgroundColor: "#111827",
        border: "1px solid #1F2937",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        flex: 1,
        minWidth: 0,
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
        {label} Forecast
      </p>
      <p style={{ fontSize: "0.7rem", color: "#4B5563", marginBottom: "0.75rem" }}>Next 6 months</p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="month" tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#4B5563", fontSize: 9, fontFamily: "var(--font-mono), monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
          <Tooltip content={(props) => <CustomTooltip {...props} color={color} />} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill={`url(#grad-${cat})`}
            fillOpacity={0.3}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#0A0F1E"
            fillOpacity={1}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${cat})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ForecastPanel({ forecasts }: ForecastPanelProps) {
  return (
    <div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "1rem" }}>
        Spending Forecasts
      </h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {Object.entries(forecasts).map(([cat, data]) => (
          <SingleForecast key={cat} cat={cat} data={data} />
        ))}
      </div>
    </div>
  );
}
