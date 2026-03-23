import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inflation Detector — Your Personal CPI",
  description:
    "Your personal inflation rate — not the government's average. Weighted against your actual spend mix using CPI Urban India data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        {/* ── Global Navbar ── */}
        <nav className="nav-bar">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-dot" />
            Inflation Detector
          </Link>
          <ul className="nav-links">
            <li><Link href="/" className="nav-link">Home</Link></li>
            <li><Link href="/dashboard" className="nav-link">Dashboard</Link></li>
            <li><Link href="/whatif" className="nav-link">What-If</Link></li>
            <li>
              <Link href="/" className="btn-secondary" style={{ padding: "0.35rem 1rem", fontSize: "0.65rem" }}>
                + Add Month
              </Link>
            </li>
          </ul>
        </nav>

        {/* Offset content below fixed navbar */}
        <div style={{ paddingTop: "64px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
