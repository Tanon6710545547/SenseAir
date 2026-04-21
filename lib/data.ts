export interface SensorReading {
  id: number;
  ts: string;
  pm25: number;
  smoke_mq2: number;
  lpg_mq5: number;
  co_mq9: number;
  temp_ky01s: number;
  hum_ky01s: number;
  temp_ky013: number;
}

export interface AQILevel {
  label: string;
  color: string;
  bg: string;
  min: number;
  max: number;
  advice: string;
}

export const AQI_LEVELS: AQILevel[] = [
  { label: "Good", color: "#00ff88", bg: "rgba(0,255,136,0.1)", min: 0, max: 50, advice: "Air quality is satisfactory." },
  { label: "Moderate", color: "#ffcc00", bg: "rgba(255,204,0,0.1)", min: 51, max: 100, advice: "Sensitive groups may experience minor issues." },
  { label: "Unhealthy for Sensitive Groups", color: "#ff9500", bg: "rgba(255,149,0,0.1)", min: 101, max: 150, advice: "Sensitive groups should limit outdoor activity." },
  { label: "Unhealthy", color: "#ff6b35", bg: "rgba(255,107,53,0.1)", min: 151, max: 200, advice: "Everyone may begin to experience effects." },
  { label: "Very Unhealthy", color: "#cc0066", bg: "rgba(204,0,102,0.1)", min: 201, max: 300, advice: "Health alert: everyone may experience serious effects." },
  { label: "Hazardous", color: "#ff3d5a", bg: "rgba(255,61,90,0.15)", min: 301, max: 500, advice: "Emergency conditions. Avoid all outdoor activity." },
];

export function getAQILevel(aqi: number): AQILevel {
  return AQI_LEVELS.find(l => aqi >= l.min && aqi <= l.max) || AQI_LEVELS[0];
}

export function pm25ToAQI(pm25: number): number {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
}

function randomBetween(a: number, b: number, decimals = 1) {
  return parseFloat((Math.random() * (b - a) + a).toFixed(decimals));
}

export function generateHistoricalData(count = 48): SensorReading[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const ts = new Date(now.getTime() - (count - i) * 30 * 60 * 1000);
    const hour = ts.getHours();
    const peakFactor = hour >= 7 && hour <= 9 ? 1.8 : hour >= 17 && hour <= 20 ? 1.6 : 1;
    return {
      id: i + 1,
      ts: ts.toISOString(),
      pm25: randomBetween(8, 40 * peakFactor, 1),
      smoke_mq2: randomBetween(0, 15 * peakFactor, 1),
      lpg_mq5: randomBetween(0, 5, 1),
      co_mq9: randomBetween(0, 3, 1),
      temp_ky01s: randomBetween(24, 34, 1),
      hum_ky01s: randomBetween(55, 80, 1),
      temp_ky013: randomBetween(23, 33, 1),
    };
  });
}

export const SENSORS = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³", icon: "💨", color: "#00d4ff", desc: "Fine particulate matter" },
  { key: "smoke_mq2", label: "Smoke", unit: "ppm", icon: "🌫", color: "#ffcc00", desc: "MQ-2 Combustible gas" },
  { key: "lpg_mq5", label: "LPG", unit: "ppm", icon: "🔥", color: "#ff9500", desc: "MQ-5 Methane/LPG gas" },
  { key: "co_mq9", label: "CO", unit: "ppm", icon: "⚠️", color: "#ff3d5a", desc: "MQ-9 Carbon Monoxide" },
  { key: "temp_ky01s", label: "Temp (KY-015)", unit: "°C", icon: "🌡", color: "#00ff88", desc: "Temperature & Humidity" },
  { key: "hum_ky01s", label: "Humidity", unit: "%", icon: "💧", color: "#4fc3f7", desc: "Relative humidity" },
  { key: "temp_ky013", label: "Temp (KY-013)", unit: "°C", icon: "🌡", color: "#ce93d8", desc: "Analog temperature" },
];
