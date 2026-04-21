import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SenseAir — Air Quality Monitor",
  description: "Real-time indoor/outdoor air quality monitoring by Team 26",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
