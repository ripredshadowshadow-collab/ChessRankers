import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChessRankers",
  description: "Adaptive AI chess with competitive Elo rankings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
