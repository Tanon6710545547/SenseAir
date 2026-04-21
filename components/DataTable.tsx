"use client";
import { useState } from "react";
import { SensorReading, pm25ToAQI, getAQILevel, AVAILABLE_DATES } from "@/lib/data";

interface DataTableProps {
  data: SensorReading[];
}

const COLS = [
  { key: "ts",         label: "Timestamp"   },
  { key: "pm25",       label: "PM2.5 µg/m³" },
  { key: "aqi",        label: "AQI"         },
  { key: "smoke_mq2",  label: "Smoke ppm"   },
  { key: "lpg_mq5",    label: "LPG ppm"     },
  { key: "co_mq9",     label: "CO ppm"      },
  { key: "temp_ky01s", label: "Temp °C"     },
  { key: "hum_ky01s",  label: "Hum %"       },
  { key: "temp_ky013", label: "Temp2 °C"    },
];

const PER_PAGE = 24;

export default function DataTable({ data }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dateFilter, setDateFilter] = useState("all");

  const enriched = data.map(d => ({ ...d, aqi: pm25ToAQI(d.pm25) }));

  const filtered = enriched.filter(row => {
    const matchDate = dateFilter === "all" || row.ts.startsWith(dateFilter);
    const matchSearch = !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    return matchDate && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  const handleDateFilter = (d: string) => { setDateFilter(d); setPage(0); };
  const handleSearch = (v: string) => { setSearch(v); setPage(0); };

  return (
    <div>
      {/* Date filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={() => handleDateFilter("all")} style={pillStyle(dateFilter === "all")}>All Days</button>
        {AVAILABLE_DATES.map(d => {
          const dt = new Date(d + "T00:00:00");
          const label = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <button key={d} onClick={() => handleDateFilter(d)} style={pillStyle(dateFilter === d)}>{label}</button>
          );
        })}
      </div>

      {/* Search + export row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4a7a9b", fontSize: 13 }}>⌕</div>
          <input
            type="text"
            placeholder="Search readings…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              background: "rgba(10,21,32,0.8)", border: "1px solid #1a3448",
              color: "#e8f4fd", borderRadius: 6, padding: "7px 12px 7px 30px",
              fontFamily: "DM Mono, monospace", fontSize: 12, width: "100%", outline: "none",
            }}
          />
        </div>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#4a7a9b", whiteSpace: "nowrap" }}>
          {filtered.length} rows
        </span>
        <button style={exportBtnStyle} onClick={() => {
          const csv = [COLS.map(c => c.label).join(","),
            ...enriched.map(row => COLS.map(c => {
              const v = (row as any)[c.key];
              return c.key === "ts" ? `"${v}"` : v;
            }).join(","))
          ].join("\n");
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
          a.download = "sensor_data.csv"; a.click();
        }}>
          ↓ CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid rgba(26,52,72,0.6)" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
          <thead>
            <tr style={{ background: "rgba(0,212,255,0.04)" }}>
              {COLS.map(col => (
                <th key={col.key} style={{
                  color: "#4a9ab4", fontFamily: "DM Mono, monospace", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "10px 12px", textAlign: "left",
                  borderBottom: "1px solid rgba(26,52,72,0.8)",
                  whiteSpace: "nowrap", fontWeight: 500,
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => {
              const level = getAQILevel(row.aqi);
              return (
                <tr key={row.id} style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(10,21,32,0.4)",
                  transition: "background 0.15s",
                }}>
                  {COLS.map(col => {
                    const val = (row as any)[col.key];
                    if (col.key === "ts") return (
                      <td key={col.key} style={cellStyle}>
                        {new Date(val).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                      </td>
                    );
                    if (col.key === "aqi") return (
                      <td key={col.key} style={{ ...cellStyle }}>
                        <span style={{
                          background: level.bg, color: level.color,
                          border: `1px solid ${level.color}40`,
                          borderRadius: 4, padding: "2px 8px",
                          fontFamily: "DM Mono, monospace", fontSize: 11, fontWeight: 700,
                        }}>{val}</span>
                      </td>
                    );
                    return (
                      <td key={col.key} style={cellStyle}>
                        {typeof val === "number" ? val.toFixed(2) : val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#4a7a9b" }}>
            Page {safePage + 1} / {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} style={pageBtn(false, safePage === 0)}>←</button>
            {Array.from({ length: Math.min(totalPages, 14) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={pageBtn(i === safePage, false)}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1} style={pageBtn(false, safePage === totalPages - 1)}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "9px 12px",
  fontFamily: "DM Mono, monospace", fontSize: 12, color: "#8ab4cc",
  borderBottom: "1px solid rgba(26,52,72,0.35)", whiteSpace: "nowrap",
};

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: "4px 12px", borderRadius: 20,
  background: active ? "rgba(0,212,255,0.15)" : "rgba(10,21,32,0.6)",
  border: `1px solid ${active ? "rgba(0,212,255,0.5)" : "rgba(26,52,72,0.8)"}`,
  color: active ? "#00d4ff" : "#4a7a9b",
  fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer",
  transition: "all 0.15s ease",
});

const exportBtnStyle: React.CSSProperties = {
  background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)",
  color: "#00d4ff", borderRadius: 6, padding: "7px 14px",
  fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
};

const pageBtn = (active: boolean, disabled: boolean): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 4,
  background: active ? "rgba(0,212,255,0.18)" : "transparent",
  border: `1px solid ${active ? "#00d4ff60" : "#1a3448"}`,
  color: disabled ? "#1a3448" : active ? "#00d4ff" : "#4a7a9b",
  fontFamily: "DM Mono, monospace", fontSize: 11, cursor: disabled ? "default" : "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
});
