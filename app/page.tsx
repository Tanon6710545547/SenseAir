"use client";
import { useState, useMemo } from "react";
import {
  HISTORICAL_DATA, AVAILABLE_DATES, getDataForDate, getDailyStats,
  pm25ToAQI, getAQILevel, SENSORS, SensorReading,
} from "@/lib/data";
import AQIGauge from "@/components/AQIGauge";
import SensorCard from "@/components/SensorCard";
import TrendChart from "@/components/TrendChart";
import DataTable from "@/components/DataTable";

const NAV_ITEMS = ["Dashboard", "Analytics", "Data Log", "About"];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[AVAILABLE_DATES.length - 1]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const dayData = useMemo(() => getDataForDate(selectedDate), [selectedDate]);
  const stats = useMemo(() => getDailyStats(selectedDate), [selectedDate]);

  const displayed: SensorReading | null = useMemo(() => {
    if (!dayData.length) return null;
    if (selectedHour === null) return dayData[dayData.length - 1];
    return dayData.find(d => new Date(d.ts).getHours() === selectedHour) ?? dayData[dayData.length - 1];
  }, [dayData, selectedHour]);

  const aqi = displayed ? pm25ToAQI(displayed.pm25) : 0;
  const level = getAQILevel(aqi);

  const dailyAQIs = useMemo(() =>
    AVAILABLE_DATES.map(d => {
      const s = getDailyStats(d);
      return { date: d, avgAQI: s?.avgAQI ?? 0, maxAQI: s?.maxAQI ?? 0, avgPM25: s?.avgPM25 ?? 0 };
    }), []);

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const displayedTs = displayed ? new Date(displayed.ts) : null;
  const displayedTimeStr = displayedTs
    ? displayedTs.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    : "";

  const [selectedChartKey, setSelectedChartKey] = useState("pm25");
  const selectedSensor = SENSORS.find(s => s.key === selectedChartKey) ?? SENSORS[0];

  return (
    <div style={{ minHeight: "100vh", background: "#050a0e", color: "#e8f4fd", fontFamily: "Syne, sans-serif" }}>
      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
      }} />
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 500, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${level.color}0e 0%, transparent 65%)`,
        transition: "background 1.2s ease",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HEADER ── */}
        <header style={{
          borderBottom: "1px solid rgba(26,52,72,0.7)",
          background: "rgba(5,10,14,0.92)", backdropFilter: "blur(24px)",
          position: "sticky", top: 0, zIndex: 100, padding: "0 2rem",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, height: 60 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `linear-gradient(135deg, ${level.color}22, ${level.color}08)`,
                border: `1px solid ${level.color}45`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                boxShadow: `0 0 16px ${level.color}25`,
                transition: "all 1s ease",
              }}>💨</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.03em", color: "#e8f4fd" }}>SenseAir</div>
                <div style={{ fontSize: 9, color: "#4a7a9b", fontFamily: "DM Mono, monospace", letterSpacing: "0.12em" }}>AIR QUALITY MONITOR</div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ display: "flex", gap: 2, flex: 1 }}>
              {NAV_ITEMS.map(item => (
                <button key={item} onClick={() => setActiveNav(item)} style={{
                  padding: "5px 14px", borderRadius: 4, border: "none", cursor: "pointer",
                  background: activeNav === item ? `${level.color}12` : "transparent",
                  color: activeNav === item ? level.color : "#4a7a9b",
                  fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 12,
                  borderBottom: activeNav === item ? `2px solid ${level.color}` : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}>{item}</button>
              ))}
            </nav>

            {/* Timestamp display */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(10,21,32,0.8)", border: "1px solid rgba(26,52,72,0.8)",
              borderRadius: 6, padding: "5px 12px",
              fontFamily: "DM Mono, monospace", fontSize: 11,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: level.color, boxShadow: `0 0 8px ${level.color}`, flexShrink: 0 }} />
              <span style={{ color: level.color }}>{displayedTimeStr}</span>
            </div>
          </div>
        </header>

        {/* ── DATE NAVIGATOR ── */}
        <div style={{
          borderBottom: "1px solid rgba(26,52,72,0.5)",
          background: "rgba(8,14,20,0.7)", backdropFilter: "blur(16px)",
          padding: "10px 2rem",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.12em", flexShrink: 0, marginRight: 4 }}>APR 2026</span>
              {dailyAQIs.map(({ date, avgAQI, maxAQI, avgPM25 }) => {
                const isSelected = date === selectedDate;
                const dayLevel = getAQILevel(avgAQI);
                const dt = new Date(date + "T00:00:00");
                const dayLabel = dt.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = dt.getDate();
                return (
                  <button key={date} onClick={() => { setSelectedDate(date); setSelectedHour(null); }} style={{
                    flexShrink: 0, cursor: "pointer",
                    background: isSelected ? `${dayLevel.color}18` : "rgba(10,21,32,0.5)",
                    border: `1px solid ${isSelected ? dayLevel.color + "70" : "rgba(26,52,72,0.6)"}`,
                    borderRadius: 8, padding: "6px 10px", textAlign: "center",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? `0 0 16px ${dayLevel.color}20` : "none",
                    minWidth: 58,
                  }}>
                    <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: isSelected ? dayLevel.color : "#4a7a9b", letterSpacing: "0.06em", marginBottom: 2 }}>{dayLabel}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isSelected ? dayLevel.color : "#8ab4cc", lineHeight: 1, marginBottom: 3, fontFamily: "Space Mono, monospace" }}>{dayNum}</div>
                    <div style={{
                      height: 3, borderRadius: 99, overflow: "hidden",
                      background: "rgba(26,52,72,0.6)", marginBottom: 3,
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${Math.min((avgPM25 / 55) * 100, 100)}%`,
                        background: dayLevel.color,
                      }} />
                    </div>
                    <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: isSelected ? dayLevel.color : "#4a7a9b" }}>
                      AQI {avgAQI}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── HOUR SCRUBBER ── */}
        <div style={{
          borderBottom: "1px solid rgba(26,52,72,0.4)",
          background: "rgba(5,10,14,0.6)", backdropFilter: "blur(12px)",
          padding: "8px 2rem",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", paddingBottom: 1 }}>
              <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.12em", flexShrink: 0, marginRight: 4 }}>HOUR</span>
              <button onClick={() => setSelectedHour(null)} style={hourBtnStyle(selectedHour === null, level.color, false)}>ALL</button>
              {dayData.map(d => {
                const h = new Date(d.ts).getHours();
                const isActive = selectedHour === h;
                const hAQI = pm25ToAQI(d.pm25);
                const hLevel = getAQILevel(hAQI);
                return (
                  <button key={h} onClick={() => setSelectedHour(isActive ? null : h)} style={hourBtnStyle(isActive, hLevel.color, false)}>
                    {h.toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "1.75rem 2rem" }}>

          {/* DASHBOARD */}
          {activeNav === "Dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Day summary strip */}
              {stats && (
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10,
                  background: "linear-gradient(135deg, #0a1520, #0d1f2f)",
                  border: "1px solid rgba(26,52,72,0.6)", borderRadius: 10, padding: "14px 18px",
                }}>
                  {[
                    { l: "AVG PM2.5", v: stats.avgPM25.toFixed(1), u: "µg/m³", c: "#00d4ff" },
                    { l: "MAX PM2.5", v: stats.maxPM25.toFixed(1), u: "µg/m³", c: "#ff6b35" },
                    { l: "AVG AQI",   v: stats.avgAQI,              u: "index", c: level.color },
                    { l: "TEMP RANGE",v: `${stats.minTemp.toFixed(0)}–${stats.maxTemp.toFixed(0)}`, u: "°C", c: "#00ff88" },
                    { l: "AVG HUMID", v: stats.avgHum.toFixed(0),   u: "%",    c: "#4fc3f7" },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.1em", marginBottom: 4 }}>{s.l}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Space Mono, monospace", color: s.c, textShadow: `0 0 16px ${s.c}30` }}>{s.v}</div>
                      <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: s.c + "70", marginTop: 2 }}>{s.u}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AQI + charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
                {/* AQI Panel */}
                <div style={{
                  background: "linear-gradient(145deg, #0c1824, #0a1520, #0d1f2f)",
                  border: `1px solid ${level.color}28`,
                  borderRadius: 14, padding: "22px 18px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  boxShadow: `0 8px 48px rgba(0,0,0,0.5), 0 0 64px ${level.color}06`,
                  transition: "border-color 1s, box-shadow 1s",
                }}>
                  <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 10 }}>
                    COMPOSITE AIR QUALITY INDEX
                  </div>
                  {displayed && <AQIGauge aqi={aqi} size={210} />}
                  <div style={{
                    marginTop: 10, padding: "10px 14px",
                    background: level.bg, border: `1px solid ${level.color}30`,
                    borderRadius: 8, textAlign: "center", width: "100%",
                  }}>
                    <div style={{ color: level.color, fontSize: 11, fontFamily: "DM Mono, monospace", lineHeight: 1.5 }}>{level.advice}</div>
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* 4 key stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {[
                      { label: "PM2.5",       val: displayed?.pm25 ?? 0,        unit: "µg/m³", color: "#00d4ff" },
                      { label: "CO",           val: displayed?.co_mq9 ?? 0,      unit: "ppm",   color: "#ff3d5a" },
                      { label: "Temperature",  val: displayed?.temp_ky01s ?? 0,  unit: "°C",    color: "#00ff88" },
                      { label: "Humidity",     val: displayed?.hum_ky01s ?? 0,   unit: "%",     color: "#4fc3f7" },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: "linear-gradient(145deg, #0c1824, #0a1520)",
                        border: `1px solid ${s.color}22`, borderRadius: 10, padding: "14px 16px",
                        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${s.color}06`,
                      }}>
                        <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.1em", marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "Space Mono, monospace", textShadow: `0 0 20px ${s.color}35`, lineHeight: 1 }}>
                          {s.val.toFixed(1)}
                        </div>
                        <div style={{ fontSize: 10, color: s.color + "60", fontFamily: "DM Mono, monospace", marginTop: 4 }}>{s.unit}</div>
                      </div>
                    ))}
                  </div>
                  {/* PM2.5 trend */}
                  <div style={{
                    background: "linear-gradient(145deg, #0c1824, #0a1520)", border: "1px solid rgba(26,52,72,0.6)",
                    borderRadius: 10, padding: "14px 16px", flex: 1,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.12em" }}>
                        PM2.5 — {selectedDate}
                      </div>
                      {selectedHour !== null && (
                        <div style={{
                          fontSize: 9, fontFamily: "DM Mono, monospace",
                          color: "#00d4ff", background: "rgba(0,212,255,0.1)",
                          border: "1px solid rgba(0,212,255,0.3)", borderRadius: 4, padding: "2px 8px",
                        }}>
                          {`${selectedHour.toString().padStart(2, "0")}:00 selected`}
                        </div>
                      )}
                    </div>
                    {dayData.length > 0 && <TrendChart data={dayData} dataKey="pm25" color="#00d4ff" label="PM2.5" unit="µg/m³" height={140} />}
                  </div>
                </div>
              </div>

              {/* Sensor cards */}
              <div>
                <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 12 }}>◈ SENSOR READINGS — {displayedTimeStr}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
                  {displayed && SENSORS.map((s, i) => (
                    <SensorCard
                      key={s.key}
                      icon={s.icon} label={s.label}
                      value={(displayed as any)[s.key]}
                      unit={s.unit} color={s.color} desc={s.desc}
                      min={s.min} max={s.max}
                      delay={i * 60}
                    />
                  ))}
                </div>
              </div>

              {/* Health advisory */}
              <div style={{
                background: `linear-gradient(135deg, ${level.bg}, rgba(10,21,32,0.6))`,
                border: `1px solid ${level.color}28`, borderRadius: 12, padding: "18px 22px",
                display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center",
                boxShadow: `0 0 40px ${level.color}08`,
              }}>
                <div style={{ fontSize: 34 }}>
                  {aqi <= 50 ? "✅" : aqi <= 100 ? "😐" : aqi <= 150 ? "😷" : aqi <= 200 ? "⚠️" : "🚨"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: level.color, marginBottom: 4 }}>Health Advisory — {level.label}</div>
                  <div style={{ color: "#8ab4cc", fontSize: 13, lineHeight: 1.5 }}>{level.advice}</div>
                </div>
                <div style={{
                  background: level.bg, border: `1px solid ${level.color}35`,
                  borderRadius: 8, padding: "10px 22px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: level.color, fontFamily: "Space Mono, monospace" }}>{aqi}</div>
                  <div style={{ fontSize: 9, color: level.color + "80", fontFamily: "DM Mono, monospace", letterSpacing: "0.12em", marginTop: 2 }}>AQI</div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeNav === "Analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em" }}>◈ SENSOR ANALYTICS — {selectedDate}</div>
                <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#4a7a9b" }}>Showing hourly data · {dayData.length} readings</div>
              </div>

              {/* Sensor selector */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SENSORS.map(s => (
                  <button key={s.key} onClick={() => setSelectedChartKey(s.key)} style={{
                    padding: "6px 14px", borderRadius: 20,
                    background: selectedChartKey === s.key ? `${s.color}15` : "transparent",
                    border: `1px solid ${selectedChartKey === s.key ? s.color + "55" : "rgba(26,52,72,0.7)"}`,
                    color: selectedChartKey === s.key ? s.color : "#4a7a9b",
                    fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer", transition: "all 0.2s",
                  }}>{s.icon} {s.label}</button>
                ))}
              </div>

              {/* Main chart */}
              <div style={{
                background: "linear-gradient(145deg, #0c1824, #0a1520)",
                border: `1px solid ${selectedSensor.color}22`,
                borderRadius: 14, padding: "22px 20px",
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 64px ${selectedSensor.color}05`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: selectedSensor.color }}>
                      {selectedSensor.icon} {selectedSensor.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#4a7a9b", fontFamily: "DM Mono, monospace", marginTop: 2 }}>{selectedSensor.desc} · hourly average</div>
                  </div>
                  <div style={{
                    background: `${selectedSensor.color}10`, border: `1px solid ${selectedSensor.color}28`,
                    borderRadius: 8, padding: "10px 18px", fontFamily: "Space Mono, monospace",
                    fontSize: 24, fontWeight: 700, color: selectedSensor.color,
                    textShadow: `0 0 20px ${selectedSensor.color}30`,
                  }}>
                    {displayed ? (displayed as any)[selectedSensor.key].toFixed(2) : "–"}
                    <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 6 }}>{selectedSensor.unit}</span>
                  </div>
                </div>
                {dayData.length > 0 && (
                  <TrendChart data={dayData} dataKey={selectedChartKey} color={selectedSensor.color} label={selectedSensor.label} unit={selectedSensor.unit} height={260} />
                )}
              </div>

              {/* All-14-days overview */}
              <div>
                <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 14 }}>◈ 14-DAY OVERVIEW — {selectedSensor.label.toUpperCase()}</div>
                <div style={{
                  background: "linear-gradient(145deg, #0c1824, #0a1520)",
                  border: "1px solid rgba(26,52,72,0.6)", borderRadius: 12, padding: "18px 16px",
                }}>
                  <TrendChart data={HISTORICAL_DATA} dataKey={selectedChartKey} color={selectedSensor.color} label={selectedSensor.label} unit={selectedSensor.unit} height={200} />
                </div>
              </div>

              {/* Small multiples */}
              <div>
                <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em", marginBottom: 14 }}>◈ ALL SENSORS — {selectedDate}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
                  {SENSORS.filter(s => s.key !== selectedChartKey).map(s => (
                    <div key={s.key} onClick={() => setSelectedChartKey(s.key)} style={{
                      background: "linear-gradient(145deg, #0c1824, #0a1520)",
                      border: "1px solid rgba(26,52,72,0.5)", borderRadius: 10, padding: "14px 16px",
                      cursor: "pointer", transition: "border-color 0.2s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: s.color }}>{s.icon} {s.label}</div>
                        <div style={{ fontFamily: "Space Mono, monospace", fontSize: 13, fontWeight: 700, color: s.color }}>
                          {displayed ? (displayed as any)[s.key].toFixed(1) : "–"} {s.unit}
                        </div>
                      </div>
                      {dayData.length > 0 && <TrendChart data={dayData} dataKey={s.key} color={s.color} label={s.label} unit={s.unit} height={120} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DATA LOG */}
          {activeNav === "Data Log" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#4a7a9b", letterSpacing: "0.15em" }}>◈ RAW SENSOR DATA — {HISTORICAL_DATA.length} READINGS · 14 DAYS</div>
              </div>
              <div style={{
                background: "linear-gradient(145deg, #0c1824, #0a1520)", border: "1px solid rgba(26,52,72,0.6)",
                borderRadius: 14, padding: "20px 22px",
              }}>
                <DataTable data={HISTORICAL_DATA} />
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeNav === "About" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1000 }}>
              <div style={{
                background: "linear-gradient(145deg, #0c1824, #0a1520)",
                border: "1px solid rgba(31,61,84,0.8)", borderRadius: 14, padding: "26px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💨</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#00d4ff" }}>SenseAir</div>
                    <div style={{ fontSize: 10, color: "#4a7a9b", fontFamily: "DM Mono, monospace" }}>Team 26 · Air Quality Monitor</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#8ab4cc", lineHeight: 1.75, marginBottom: 20 }}>
                  Real-time indoor/outdoor air quality monitoring station measuring multiple environmental parameters. Computes composite AQI and exposes REST API for health-risk alerts and trend queries.
                </p>
                <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 12 }}>TEAM MEMBERS</div>
                {["Tanon LIKHITTAPHONG", "Pannathon NITHIWATCHARIN"].map(name => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(0,212,255,0.04)", borderRadius: 6, marginBottom: 6, border: "1px solid rgba(0,212,255,0.07)" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>👤</div>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12 }}>{name}</span>
                  </div>
                ))}
                <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(0,212,255,0.04)", borderRadius: 8, border: "1px solid rgba(0,212,255,0.08)" }}>
                  <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 8 }}>DATASET</div>
                  <div style={{ fontSize: 12, color: "#8ab4cc", lineHeight: 1.8 }}>
                    336 hourly readings · Apr 6–19, 2026<br />
                    Location: Bangkok, Thailand (hot season)<br />
                    IQAir AQI standard · PCD thresholds
                  </div>
                </div>
              </div>
              <div style={{ background: "linear-gradient(145deg, #0c1824, #0a1520)", border: "1px solid rgba(31,61,84,0.8)", borderRadius: 14, padding: "26px 24px" }}>
                <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#00d4ff", letterSpacing: "0.1em", marginBottom: 16 }}>SENSOR HARDWARE</div>
                {[
                  { name: "PMS7003", role: "Dust / PM2.5 sensor",      color: "#00d4ff" },
                  { name: "MQ-2",    role: "Smoke & combustible gas",   color: "#ffcc00" },
                  { name: "MQ-5",    role: "LPG / methane gas",         color: "#ff9500" },
                  { name: "MQ-9",    role: "Carbon monoxide (CO)",      color: "#ff3d5a" },
                  { name: "KY-015",  role: "Temperature & humidity",    color: "#00ff88" },
                  { name: "KY-013",  role: "Analog temperature",        color: "#ce93d8" },
                ].map(sensor => (
                  <div key={sensor.name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 13px", background: `${sensor.color}05`,
                    border: `1px solid ${sensor.color}18`, borderRadius: 8, marginBottom: 7,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sensor.color, boxShadow: `0 0 7px ${sensor.color}` }} />
                      <div>
                        <div style={{ fontFamily: "Space Mono, monospace", fontSize: 13, fontWeight: 700, color: sensor.color }}>{sensor.name}</div>
                        <div style={{ fontSize: 11, color: "#8ab4cc", marginTop: 1 }}>{sensor.role}</div>
                      </div>
                    </div>
                    <div style={{ background: `${sensor.color}14`, border: `1px solid ${sensor.color}28`, borderRadius: 4, padding: "3px 10px", fontFamily: "DM Mono, monospace", fontSize: 11, color: sensor.color }}>1x</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid rgba(26,52,72,0.5)", padding: "14px 2rem", marginTop: 32 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#4a7a9b" }}>SenseAir v2.0 · Team 26 · Bangkok, Thailand · Apr 2026</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#4a7a9b", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
              {HISTORICAL_DATA.length} readings · {AVAILABLE_DATES.length} days recorded
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        button:focus { outline: none; }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,52,72,0.8); border-radius: 3px; }
      `}</style>
    </div>
  );
}

function hourBtnStyle(active: boolean, color: string, disabled: boolean): React.CSSProperties {
  return {
    flexShrink: 0, cursor: disabled ? "default" : "pointer", minWidth: 36,
    padding: "3px 6px", borderRadius: 4,
    background: active ? `${color}18` : "transparent",
    border: `1px solid ${active ? color + "55" : "rgba(26,52,72,0.5)"}`,
    color: active ? color : "#4a7a9b",
    fontFamily: "DM Mono, monospace", fontSize: 10,
    transition: "all 0.15s ease",
    textAlign: "center" as const,
  };
}
