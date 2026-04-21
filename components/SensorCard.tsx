"use client";
import { useEffect, useState } from "react";

interface SensorCardProps {
  icon: string;
  label: string;
  value: number;
  unit: string;
  color: string;
  desc: string;
  min: number;
  max: number;
  delay?: number;
}

export default function SensorCard({ icon, label, value, unit, color, desc, min, max, delay = 0 }: SensorCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = value / 30;
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplayed(value); clearInterval(interval); }
      else setDisplayed(parseFloat(start.toFixed(1)));
    }, 20);
    return () => clearInterval(interval);
  }, [value, visible]);

  const pct = Math.min(((value - min) / (max - min)) * 100, 100);

  return (
    <div
      className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 group cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #0a1520 0%, #0d1f2f 100%)",
        border: `1px solid ${visible ? color + "30" : "#1a3448"}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s ease ${delay}ms`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}10 0%, transparent 70%)` }} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: color, opacity: 0.8 }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: "#4a7a9b" }}>{desc}</div>
          </div>
        </div>
        {/* Live dot */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}`, animation: "pulse-glow 2s ease-in-out infinite" }} />
          <span className="text-xs font-mono" style={{ color: "#4a7a9b" }}>LIVE</span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold font-mono" style={{ color, textShadow: `0 0 20px ${color}50` }}>
          {displayed}
        </span>
        <span className="text-sm font-mono" style={{ color: color + "80" }}>{unit}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "#1a3448" }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs font-mono" style={{ color: "#4a7a9b" }}>{min}</span>
        <span className="text-xs font-mono" style={{ color: "#4a7a9b" }}>{max}</span>
      </div>
    </div>
  );
}
