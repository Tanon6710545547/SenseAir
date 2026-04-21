"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { SensorReading } from "@/lib/data";

interface TrendChartProps {
  data: SensorReading[];
  dataKey: string;
  color: string;
  label: string;
  unit: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, unit, color }: any) => {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.payload?.rawTs;
  const dt = raw ? new Date(raw) : null;
  const timeStr = dt
    ? dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  return (
    <div style={{
      background: "rgba(5,10,14,0.96)",
      border: `1px solid ${color}50`,
      borderRadius: 8,
      padding: "10px 16px",
      fontFamily: "DM Mono, monospace",
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 24px ${color}15`,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ color: "#4a7a9b", fontSize: 10, marginBottom: 6, letterSpacing: "0.06em" }}>{timeStr}</div>
      <div style={{ color, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {typeof payload[0].value === "number" ? payload[0].value.toFixed(2) : payload[0].value}
        <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 5 }}>{unit}</span>
      </div>
    </div>
  );
};

export default function TrendChart({ data, dataKey, color, label, unit, height = 180 }: TrendChartProps) {
  const isMultiDay = data.length > 26;
  const chartData = data.map((d) => {
    const dt = new Date(d.ts);
    const timeLabel = isMultiDay
      ? dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : `${dt.getHours().toString().padStart(2, "0")}:00`;
    return {
      time: timeLabel,
      rawTs: d.ts,
      value: (d as any)[dataKey],
    };
  });

  const values = chartData.map(d => d.value as number);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yDomain = [Math.max(0, minVal - (maxVal - minVal) * 0.15), maxVal + (maxVal - minVal) * 0.1];

  const tickInterval = isMultiDay
    ? Math.floor(data.length / 7)
    : 3;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="60%" stopColor={color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <filter id={`glow-${dataKey}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(26,52,72,0.4)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "DM Mono" }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "DM Mono" }}
            tickLine={false}
            axisLine={false}
            domain={yDomain}
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip unit={unit} color={color} />} />
          <ReferenceLine
            y={avg}
            stroke={color}
            strokeDasharray="5 4"
            strokeOpacity={0.35}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: "#050a0e", strokeWidth: 2 }}
            filter={`url(#glow-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 4, paddingRight: 8 }}>
        {[
          { l: "MIN", v: minVal },
          { l: "AVG", v: avg },
          { l: "MAX", v: maxVal },
        ].map(s => (
          <div key={s.l} style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#4a7a9b", textAlign: "right" }}>
            <span style={{ opacity: 0.6, marginRight: 4 }}>{s.l}</span>
            <span style={{ color }}>{s.v.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
