"use client";
import { getAQILevel } from "@/lib/data";

interface AQIGaugeProps {
  aqi: number;
  size?: number;
}

export default function AQIGauge({ aqi, size = 220 }: AQIGaugeProps) {
  const level = getAQILevel(aqi);
  const maxAQI = 500;
  const pct = Math.min(aqi / maxAQI, 1);
  
  // Arc params
  const cx = size / 2;
  const cy = size / 2 + 20;
  const r = (size / 2) - 20;
  const startAngle = -210;
  const totalAngle = 240;
  const angle = startAngle + pct * totalAngle;

  function polar(deg: number, radius: number) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(start: number, end: number, rInner: number, rOuter: number) {
    const s1 = polar(start, rOuter);
    const e1 = polar(end, rOuter);
    const s2 = polar(end, rInner);
    const e2 = polar(start, rInner);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${rInner} ${rInner} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
  }

  const zones = [
    { color: "#00ff88", from: 0, to: 0.1 },
    { color: "#88ff00", from: 0.1, to: 0.2 },
    { color: "#ffcc00", from: 0.2, to: 0.3 },
    { color: "#ff9500", from: 0.3, to: 0.4 },
    { color: "#ff6b35", from: 0.4, to: 0.6 },
    { color: "#cc0066", from: 0.6, to: 0.8 },
    { color: "#ff3d5a", from: 0.8, to: 1.0 },
  ];

  const needleTip = polar(angle, r - 15);
  const needleBase1 = polar(angle + 90, 6);
  const needleBase2 = polar(angle - 90, 6);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background arcs - zones */}
      {zones.map((z, i) => {
        const startDeg = startAngle + z.from * totalAngle;
        const endDeg = startAngle + z.to * totalAngle;
        return (
          <path
            key={i}
            d={arcPath(startDeg, endDeg, r - 18, r)}
            fill={z.color}
            opacity={0.25}
          />
        );
      })}

      {/* Active arc */}
      <path
        d={arcPath(startAngle, angle, r - 18, r)}
        fill={level.color}
        opacity={0.85}
        style={{ filter: `drop-shadow(0 0 8px ${level.color})` }}
      />

      {/* Tick marks */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => {
        const deg = startAngle + p * totalAngle;
        const inner = polar(deg, r + 4);
        const outer = polar(deg, r + 12);
        return (
          <line
            key={i}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke={level.color}
            strokeWidth={1.5}
            opacity={0.5}
          />
        );
      })}

      {/* Needle */}
      <path
        d={`M ${needleBase1.x} ${needleBase1.y} L ${needleTip.x} ${needleTip.y} L ${needleBase2.x} ${needleBase2.y} Z`}
        fill={level.color}
        style={{ filter: `drop-shadow(0 0 6px ${level.color})` }}
      />
      <circle cx={cx} cy={cy} r={8} fill={level.color} opacity={0.9} />
      <circle cx={cx} cy={cy} r={4} fill="#050a0e" />

      {/* Center text */}
      <text x={cx} y={cy - 35} textAnchor="middle" fill={level.color} fontSize={42} fontFamily="Space Mono, monospace" fontWeight="700"
        style={{ filter: `drop-shadow(0 0 10px ${level.color})` }}>
        {aqi}
      </text>
      <text x={cx} y={cy - 18} textAnchor="middle" fill={level.color} fontSize={11} fontFamily="DM Mono, monospace" letterSpacing="2">
        AQI
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill={level.color} fontSize={13} fontFamily="Syne, sans-serif" fontWeight="600">
        {level.label}
      </text>
    </svg>
  );
}
