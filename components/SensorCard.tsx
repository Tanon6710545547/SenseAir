"use client";
import { useEffect, useState, useRef } from "react";

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
  const [displayed, setDisplayed] = useState(value);
  const [visible, setVisible] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return;
    let raf: number;
    const start = performance.now();
    const duration = 600;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(parseFloat((from + (value - from) * ease).toFixed(2)));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const pct = Math.max(0, Math.min(((value - min) / (max - min)) * 100, 100));
  const trend = value > (min + (max - min) * 0.7) ? "high" : value < (min + (max - min) * 0.3) ? "low" : "mid";
  const trendColor = trend === "high" ? "#ff6b35" : trend === "low" ? "#00ff88" : color;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "18px 16px",
        background: "linear-gradient(145deg, #0c1824 0%, #0a1520 50%, #0d1f2f 100%)",
        border: `1px solid ${visible ? color + "28" : "#1a3448"}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, border-color 0.4s ease`,
        boxShadow: visible ? `0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}08` : "none",
        cursor: "default",
      }}
    >
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 60, height: 60,
        background: `radial-gradient(circle at 100% 0%, ${color}12 0%, transparent 70%)`,
      }} />

      {/* Bottom bar glow */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        opacity: pct > 50 ? 1 : 0.4,
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${color}14`,
            border: `1px solid ${color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", fontWeight: 500, color, opacity: 0.9, letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 10, color: "#4a7a9b", marginTop: 1 }}>{desc}</div>
          </div>
        </div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
        <span style={{
          fontSize: 32, fontWeight: 700, fontFamily: "Space Mono, monospace",
          color: trendColor,
          textShadow: `0 0 24px ${trendColor}40`,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {displayed % 1 === 0 ? displayed.toFixed(0) : displayed.toFixed(2)}
        </span>
        <span style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: color + "70" }}>{unit}</span>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "relative", height: 3, borderRadius: 99,
        background: "rgba(26,52,72,0.6)",
        overflow: "hidden", marginBottom: 8,
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}50, ${color})`,
          borderRadius: 99,
          boxShadow: `0 0 8px ${color}60`,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>

      {/* Min / Max labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", opacity: 0.7 }}>{min}</span>
        <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", opacity: 0.7 }}>{max}</span>
      </div>
    </div>
  );
}
