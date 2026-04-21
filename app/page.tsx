"use client";
import { useEffect, useState, useRef } from "react";
import { generateHistoricalData, pm25ToAQI, getAQILevel, SENSORS, SensorReading } from "@/lib/data";
import AQIGauge from "@/components/AQIGauge";
import SensorCard from "@/components/SensorCard";
import TrendChart from "@/components/TrendChart";
import DataTable from "@/components/DataTable";

const NAV_ITEMS = ["Dashboard", "Analytics", "Data Log", "About"];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [data, setData] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [selectedChart, setSelectedChart] = useState("pm25");
  const [time, setTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const hist = generateHistoricalData(48);
    setData(hist);
    setLatest(hist[hist.length - 1]);
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setTime(new Date());
      setData(prev => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const newR: SensorReading = {
          id: last.id + 1, ts: new Date().toISOString(),
          pm25: parseFloat((Math.max(1, last.pm25 + (Math.random()-0.5)*4)).toFixed(1)),
          smoke_mq2: parseFloat((Math.max(0, last.smoke_mq2 + (Math.random()-0.5)*2)).toFixed(1)),
          lpg_mq5: parseFloat((Math.max(0, last.lpg_mq5 + (Math.random()-0.5))).toFixed(1)),
          co_mq9: parseFloat((Math.max(0, last.co_mq9 + (Math.random()-0.5)*0.5)).toFixed(1)),
          temp_ky01s: parseFloat((last.temp_ky01s + (Math.random()-0.5)*0.5).toFixed(1)),
          hum_ky01s: parseFloat((Math.min(100,Math.max(0,last.hum_ky01s + (Math.random()-0.5)*2))).toFixed(1)),
          temp_ky013: parseFloat((last.temp_ky013 + (Math.random()-0.5)*0.5).toFixed(1)),
        };
        const next = [...prev.slice(-47), newR];
        setLatest(newR);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const aqi = latest ? pm25ToAQI(latest.pm25) : 0;
  const level = getAQILevel(aqi);
  const selectedSensor = SENSORS.find(s => s.key === selectedChart) || SENSORS[0];

  return (
    <div style={{ minHeight: "100vh", background: "#050a0e", color: "#e8f4fd", fontFamily: "Syne, sans-serif" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 400, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${level.color}12 0%, transparent 70%)`,
        transition: "background 1s ease",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <header style={{
          borderBottom: "1px solid #1a3448",
          background: "rgba(5,10,14,0.9)", backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100, padding: "0 2rem",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${level.color}30, ${level.color}10)`,
                border: `1px solid ${level.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                boxShadow: `0 0 16px ${level.color}30`, transition: "all 1s ease",
              }}>💨</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.02em" }}>SenseAir</div>
                <div style={{ fontSize: 10, color: "#4a7a9b", fontFamily: "DM Mono, monospace", letterSpacing: "0.1em" }}>AIR QUALITY MONITOR</div>
              </div>
            </div>
            <nav style={{ display: "flex", gap: 4, flex: 1 }}>
              {NAV_ITEMS.map(item => (
                <button key={item} onClick={() => setActiveNav(item)} style={{
                  padding: "6px 16px", borderRadius: 4, border: "none",
                  background: activeNav === item ? `${level.color}15` : "transparent",
                  color: activeNav === item ? level.color : "#4a7a9b",
                  fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  borderBottom: activeNav === item ? `2px solid ${level.color}` : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}>{item}</button>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "DM Mono, monospace", fontSize: 12, color: "#4a7a9b" }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isLive ? "#00ff88" : "#ff3d5a",
                  boxShadow: isLive ? "0 0 8px #00ff88" : "none",
                  animation: isLive ? "pulseLive 2s ease-in-out infinite" : "none",
                }} />
                {isLive ? "LIVE" : "PAUSED"}
              </div>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#4a7a9b" }}>
                {time.toLocaleTimeString()}
              </div>
              <button onClick={() => setIsLive(v => !v)} style={{
                padding: "5px 12px", borderRadius: 4,
                background: isLive ? "rgba(255,61,90,0.1)" : "rgba(0,255,136,0.1)",
                border: `1px solid ${isLive ? "#ff3d5a40" : "#00ff8840"}`,
                color: isLive ? "#ff3d5a" : "#00ff88",
                fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer",
              }}>{isLive ? "⏸ PAUSE" : "▶ RESUME"}</button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>

          {/* DASHBOARD */}
          {activeNav === "Dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
                <div style={{
                  background: "linear-gradient(135deg, #0a1520, #0d1f2f)",
                  border: `1px solid ${level.color}30`,
                  borderRadius: 12, padding: "24px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 60px ${level.color}08`,
                  transition: "border-color 1s, box-shadow 1s",
                }}>
                  <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 8 }}>
                    COMPOSITE AIR QUALITY INDEX
                  </div>
                  {latest && <AQIGauge aqi={aqi} size={220} />}
                  <div style={{
                    marginTop: 12, padding: "10px 16px",
                    background: level.bg, border: `1px solid ${level.color}30`,
                    borderRadius: 6, textAlign: "center", width: "100%",
                  }}>
                    <div style={{ color: level.color, fontSize: 12, fontFamily: "DM Mono, monospace" }}>{level.advice}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      { label: "PM2.5", val: latest?.pm25??0, unit: "µg/m³", color: "#00d4ff" },
                      { label: "CO Level", val: latest?.co_mq9??0, unit: "ppm", color: "#ff3d5a" },
                      { label: "Temperature", val: latest?.temp_ky01s??0, unit: "°C", color: "#00ff88" },
                      { label: "Humidity", val: latest?.hum_ky01s??0, unit: "%", color: "#4fc3f7" },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: "linear-gradient(135deg, #0a1520, #0d1f2f)",
                        border: `1px solid ${stat.color}25`,
                        borderRadius: 10, padding: 16,
                      }}>
                        <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.1em", marginBottom: 8 }}>{stat.label.toUpperCase()}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "Space Mono, monospace", textShadow: `0 0 20px ${stat.color}40` }}>{stat.val.toFixed(1)}</div>
                        <div style={{ fontSize: 11, color: stat.color+"70", fontFamily: "DM Mono, monospace" }}>{stat.unit}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: "1px solid #1a3448", borderRadius: 10, padding: 16, flex: 1 }}>
                    <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.1em", marginBottom: 10 }}>PM2.5 — LAST 24 HOURS</div>
                    {data.length > 0 && <TrendChart data={data} dataKey="pm25" color="#00d4ff" label="PM2.5" unit="µg/m³" />}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 14 }}>◈ REAL-TIME SENSOR READINGS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {latest && SENSORS.map((s, i) => (
                    <SensorCard key={s.key} icon={s.icon} label={s.label}
                      value={(latest as any)[s.key]} unit={s.unit} color={s.color} desc={s.desc}
                      min={0} max={s.key==="hum_ky01s"?100:s.key.startsWith("temp")?50:s.key==="pm25"?150:50}
                      delay={i*80} />
                  ))}
                </div>
              </div>

              <div style={{
                background: `linear-gradient(135deg, ${level.bg}, rgba(10,21,32,0.5))`,
                border: `1px solid ${level.color}30`,
                borderRadius: 12, padding: 20,
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                gap: 20, alignItems: "center",
              }}>
                <div style={{ fontSize: 36 }}>{aqi<=50?"✅":aqi<=100?"😐":aqi<=150?"😷":aqi<=200?"⚠️":"🚨"}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: level.color, marginBottom: 4 }}>Health Advisory — {level.label}</div>
                  <div style={{ color: "#8ab4cc", fontSize: 14 }}>{level.advice}</div>
                </div>
                <div style={{ background: level.bg, border: `1px solid ${level.color}40`, borderRadius: 8, padding: "8px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: level.color, fontFamily: "Space Mono, monospace" }}>{aqi}</div>
                  <div style={{ fontSize: 10, color: level.color+"80", fontFamily: "DM Mono, monospace", letterSpacing: "0.1em" }}>AQI</div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeNav === "Analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em" }}>◈ SENSOR TREND ANALYTICS — LAST 24H</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SENSORS.map(s => (
                  <button key={s.key} onClick={() => setSelectedChart(s.key)} style={{
                    padding: "6px 16px", borderRadius: 4,
                    background: selectedChart===s.key ? `${s.color}15` : "transparent",
                    border: `1px solid ${selectedChart===s.key ? s.color+"60" : "#1a3448"}`,
                    color: selectedChart===s.key ? s.color : "#4a7a9b",
                    fontFamily: "DM Mono, monospace", fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                  }}>{s.icon} {s.label}</button>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: `1px solid ${selectedSensor.color}25`, borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: selectedSensor.color }}>{selectedSensor.icon} {selectedSensor.label}</div>
                    <div style={{ fontSize: 12, color: "#4a7a9b", fontFamily: "DM Mono, monospace" }}>{selectedSensor.desc}</div>
                  </div>
                  <div style={{ background: `${selectedSensor.color}10`, border: `1px solid ${selectedSensor.color}30`, borderRadius: 6, padding: "8px 16px", fontFamily: "Space Mono, monospace", fontSize: 22, fontWeight: 700, color: selectedSensor.color }}>
                    {latest ? (latest as any)[selectedSensor.key].toFixed(1) : 0}
                    <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>{selectedSensor.unit}</span>
                  </div>
                </div>
                {data.length > 0 && <div style={{ height: 260 }}><TrendChart data={data} dataKey={selectedChart} color={selectedSensor.color} label={selectedSensor.label} unit={selectedSensor.unit} /></div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                {SENSORS.filter(s => s.key !== selectedChart).map(s => (
                  <div key={s.key} onClick={() => setSelectedChart(s.key)} style={{
                    background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: "1px solid #1a3448",
                    borderRadius: 10, padding: 16, cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: s.color }}>{s.icon} {s.label}</div>
                      <div style={{ fontFamily: "Space Mono, monospace", fontSize: 14, fontWeight: 700, color: s.color }}>
                        {latest ? (latest as any)[s.key].toFixed(1) : 0} {s.unit}
                      </div>
                    </div>
                    {data.length > 0 && <TrendChart data={data} dataKey={s.key} color={s.color} label={s.label} unit={s.unit} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATA LOG */}
          {activeNav === "Data Log" && (
            <div>
              <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 20 }}>◈ RAW SENSOR DATA LOG — {data.length} READINGS</div>
              <div style={{ background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: "1px solid #1a3448", borderRadius: 12, padding: 24 }}>
                <DataTable data={data} />
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeNav === "About" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 1000 }}>
              <div style={{ background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: "1px solid #1f3d54", borderRadius: 12, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💨</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#00d4ff" }}>SenseAir</div>
                    <div style={{ fontSize: 11, color: "#4a7a9b", fontFamily: "DM Mono, monospace" }}>Team 26 · Air Quality Monitor</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#8ab4cc", lineHeight: 1.7, marginBottom: 20 }}>
                  Real-time indoor/outdoor air quality monitoring station measuring multiple environmental parameters. Computes composite AQI and exposes REST API for health-risk alerts and trend queries.
                </div>
                <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 10 }}>TEAM MEMBERS</div>
                {["Tanon LIKHITTAPHONG", "Pannathon NITHIWATCHARIN"].map(name => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(0,212,255,0.04)", borderRadius: 6, marginBottom: 6, border: "1px solid rgba(0,212,255,0.08)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13 }}>{name}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 10, marginTop: 20 }}>API CAPABILITIES</div>
                {[
                  { q: "Is the air safe to breathe right now?", a: "Computed AQI with health category" },
                  { q: "Which pollutant is driving the risk?", a: "Dominant pollutant identification" },
                  { q: "Has air quality gotten worse in the last hour?", a: "Trend analysis" },
                  { q: "Should I open the window?", a: "Indoor vs outdoor comparison" },
                  { q: "When was the worst air quality today?", a: "Peak pollution timestamps" },
                ].map(item => (
                  <div key={item.q} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: "2px solid rgba(0,212,255,0.2)" }}>
                    <div style={{ fontSize: 12, color: "#8ab4cc" }}>{item.q}</div>
                    <div style={{ fontSize: 11, color: "#00d4ff", fontFamily: "DM Mono, monospace", marginTop: 2 }}>→ {item.a}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg, #0a1520, #0d1f2f)", border: "1px solid #1f3d54", borderRadius: 12, padding: 28 }}>
                <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 16 }}>SENSOR HARDWARE — 6 MODULES</div>
                {[
                  { name: "PMS7003", role: "Dust / PM2.5 sensor", color: "#00d4ff" },
                  { name: "MQ-2", role: "Smoke & combustible gas", color: "#ffcc00" },
                  { name: "MQ-5", role: "LPG / methane gas", color: "#ff9500" },
                  { name: "MQ-9", role: "Carbon monoxide (CO)", color: "#ff3d5a" },
                  { name: "KY-015", role: "Temperature & humidity", color: "#00ff88" },
                  { name: "KY-013", role: "Analog temperature", color: "#ce93d8" },
                ].map(sensor => (
                  <div key={sensor.name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: `${sensor.color}06`, border: `1px solid ${sensor.color}20`, borderRadius: 8, marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sensor.color, boxShadow: `0 0 8px ${sensor.color}` }} />
                      <div>
                        <div style={{ fontFamily: "Space Mono, monospace", fontSize: 14, fontWeight: 700, color: sensor.color }}>{sensor.name}</div>
                        <div style={{ fontSize: 12, color: "#8ab4cc" }}>{sensor.role}</div>
                      </div>
                    </div>
                    <div style={{ background: `${sensor.color}15`, border: `1px solid ${sensor.color}30`, borderRadius: 4, padding: "3px 10px", fontFamily: "DM Mono, monospace", fontSize: 12, color: sensor.color }}>1x</div>
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: 16, background: "rgba(0,212,255,0.04)", borderRadius: 8, border: "1px solid rgba(0,212,255,0.1)" }}>
                  <div style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 10 }}>DATA SOURCES</div>
                  <div style={{ fontSize: 12, color: "#8ab4cc", lineHeight: 1.9 }}>
                    🔵 Onboard sensors sampled every 30 seconds<br/>
                    🔵 Local SQLite/InfluxDB time-series database<br/>
                    🔵 IQAir AQI standard methodology<br/>
                    🔵 Thai Pollution Control Department thresholds<br/>
                    🔵 OpenWeatherMap API for outdoor context
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid #1a3448", padding: "16px 2rem", marginTop: 40 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#4a7a9b" }}>SenseAir v1.0 · Team 26 · Air Quality Monitor</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#4a7a9b", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
              System operational
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes pulseLive { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
