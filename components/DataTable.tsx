"use client";
import { useState } from "react";
import { SensorReading, pm25ToAQI, getAQILevel } from "@/lib/data";

interface DataTableProps {
  data: SensorReading[];
}

const COLS = [
  { key: "id", label: "ID" },
  { key: "ts", label: "Timestamp" },
  { key: "pm25", label: "PM2.5 µg/m³" },
  { key: "smoke_mq2", label: "Smoke ppm" },
  { key: "lpg_mq5", label: "LPG ppm" },
  { key: "co_mq9", label: "CO ppm" },
  { key: "temp_ky01s", label: "Temp °C" },
  { key: "hum_ky01s", label: "Hum %" },
  { key: "temp_ky013", label: "Temp2 °C" },
  { key: "aqi", label: "AQI" },
];

export default function DataTable({ data }: DataTableProps) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const enriched = data.map(d => ({ ...d, aqi: pm25ToAQI(d.pm25) }));
  const filtered = enriched.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(filter.toLowerCase()))
  );
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            placeholder="Search this table..."
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0); }}
            style={{
              background: "#0a1520",
              border: "1px solid #1a3448",
              color: "#e8f4fd",
              borderRadius: 4,
              padding: "6px 12px",
              fontFamily: "DM Mono, monospace",
              fontSize: 13,
              width: "100%",
              outline: "none",
            }}
          />
        </div>
        <div style={{ color: "#4a7a9b", fontFamily: "DM Mono, monospace", fontSize: 12 }}>
          {filtered.length} rows
        </div>
        <button
          style={{
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff",
            borderRadius: 4,
            padding: "6px 14px",
            fontFamily: "DM Mono, monospace",
            fontSize: 12,
            cursor: "pointer",
          }}
          onClick={() => {
            const csv = [COLS.map(c => c.label).join(","),
              ...enriched.map(row => COLS.map(c => (row as any)[c.key]).join(","))
            ].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv]));
            a.download = "air_quality_data.csv"; a.click();
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key} style={{
                  background: "rgba(0,212,255,0.05)",
                  color: "#00d4ff",
                  fontFamily: "DM Mono, monospace",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "10px 14px",
                  textAlign: "left",
                  borderBottom: "1px solid #1a3448",
                  whiteSpace: "nowrap",
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
                  background: i % 2 === 0 ? "transparent" : "rgba(10,21,32,0.5)",
                  transition: "background 0.15s",
                }}>
                  {COLS.map(col => {
                    const val = (row as any)[col.key];
                    if (col.key === "ts") return (
                      <td key={col.key} style={{ padding: "9px 14px", fontFamily: "DM Mono, monospace", fontSize: 12, color: "#8ab4cc", borderBottom: "1px solid rgba(26,52,72,0.4)", whiteSpace: "nowrap" }}>
                        {new Date(val).toLocaleString()}
                      </td>
                    );
                    if (col.key === "aqi") return (
                      <td key={col.key} style={{ padding: "9px 14px", borderBottom: "1px solid rgba(26,52,72,0.4)" }}>
                        <span style={{
                          background: level.bg,
                          color: level.color,
                          border: `1px solid ${level.color}40`,
                          borderRadius: 3,
                          padding: "2px 8px",
                          fontFamily: "DM Mono, monospace",
                          fontSize: 12,
                          fontWeight: 700,
                        }}>{val}</span>
                      </td>
                    );
                    return (
                      <td key={col.key} style={{ padding: "9px 14px", fontFamily: "DM Mono, monospace", fontSize: 13, color: "#8ab4cc", borderBottom: "1px solid rgba(26,52,72,0.4)" }}>
                        {typeof val === "number" ? val.toFixed(1) : val}
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
      <div className="flex items-center justify-between mt-4">
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#4a7a9b" }}>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: 28, height: 28,
              borderRadius: 4,
              background: i === page ? "rgba(0,212,255,0.15)" : "transparent",
              border: `1px solid ${i === page ? "#00d4ff" : "#1a3448"}`,
              color: i === page ? "#00d4ff" : "#4a7a9b",
              fontFamily: "DM Mono, monospace",
              fontSize: 12,
              cursor: "pointer",
            }}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
