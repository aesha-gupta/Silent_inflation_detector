"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ForecastPoint } from "@/types";

interface ForecastPanelProps {
  forecasts: Record<string, ForecastPoint[]>;
}

const CAT_COLORS: Record<string, string> = {
  food: "#2FF4DD",
  housing: "#FC4402",
  transport: "#F59E0B",
};

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      backgroundColor: "var(--bg-card-low)",
      border: "1px solid rgba(93,64,56,0.4)",
      borderRadius: 2,
      padding: "0.6rem 0.9rem",
    }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color, fontWeight: 700 }}>₹{d?.predicted?.toLocaleString("en-IN")}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-dim)" }}>
        ₹{d?.lower?.toLocaleString("en-IN")} – ₹{d?.upper?.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

function SingleForecast({ cat, data }: { cat: string; data: ForecastPoint[] }) {
  const color = CAT_COLORS[cat] ?? "#2FF4DD";
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);

  return (
    <div style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid rgba(93,64,56,0.25)",
      borderRadius: 2,
      padding: "1.25rem",
      flex: 1,
      minWidth: 0,
      position: "relative",
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.15rem" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
        6-Month Forecast
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(93,64,56,0.2)" />
          <XAxis dataKey="month" tick={{ fill: "var(--text-dim)", fontSize: 8 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "var(--text-dim)", fontSize: 8, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} color={color} />} />
          <Area type="monotone" dataKey="upper" stroke="none" fill={`url(#grad-${cat})`} fillOpacity={0.3} legendType="none" />
          <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-primary)" fillOpacity={1} legendType="none" />
          <Area type="monotone" dataKey="predicted" stroke={color} strokeWidth={1.5} fill={`url(#grad-${cat})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ForecastPanel({ forecasts }: ForecastPanelProps) {
  return (
    <div>
      <p className="section-label">Spending Forecasts</p>
      <div style={{ display: "flex", gap: "1px", flexWrap: "wrap", background: "rgba(93,64,56,0.2)" }}>
        {Object.entries(forecasts).map(([cat, data]) => (
          <SingleForecast key={cat} cat={cat} data={data} />
        ))}
      </div>
    </div>
  );
}
