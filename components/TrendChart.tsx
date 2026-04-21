"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { SensorReading } from "@/lib/data";

interface TrendChartProps {
  data: SensorReading[];
  dataKey: string;
  color: string;
  label: string;
  unit: string;
}

const CustomTooltip = ({ active, payload, label, unit, color }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0a1520",
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: "8px 14px",
        fontFamily: "DM Mono, monospace",
        boxShadow: `0 0 20px ${color}20`,
      }}>
        <div style={{ color: "#4a7a9b", fontSize: 11, marginBottom: 4 }}>{label}</div>
        <div style={{ color, fontSize: 18, fontWeight: 700 }}>
          {payload[0].value} <span style={{ fontSize: 11, opacity: 0.7 }}>{unit}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data, dataKey, color, label, unit }: TrendChartProps) {
  const chartData = data.map((d) => ({
    time: new Date(d.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    value: (d as any)[dataKey],
  }));

  const values = chartData.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,52,72,0.5)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "DM Mono" }}
            tickLine={false}
            axisLine={false}
            interval={7}
          />
          <YAxis
            tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "DM Mono" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} color={color} />} />
          <ReferenceLine
            y={avg}
            stroke={color}
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{ value: `avg ${avg.toFixed(1)}`, fill: color, fontSize: 10, fontFamily: "DM Mono" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#050a0e", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
