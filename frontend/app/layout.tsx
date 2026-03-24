import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";
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
  description: "Your personal inflation rate — not the government's average.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        
        {/* Animated Background — particle canvas + floating orbs */}
        <AnimatedBackground />

        {/* CRT Scanline Overlay Effect */}
        <div className="noise-overlay" />
        <div className="scanline" />

        {/* Framing the entire application viewport mimicking the reference site */}
        <div className="app-frame" style={{ position: "relative", zIndex: 1 }}>
          
          {/* Top Line Navbar integrated into the frame */}
          <nav className="top-nav-line">
            <div className="nav-side">
              <Link href="/" className="nav-link-raw hover-reveal">HOME</Link>
              <Link href="/dashboard" className="nav-link-raw hover-reveal" style={{ marginLeft: "3rem" }}>DASHBOARD</Link>
            </div>
            
            <div className="nav-center">
              <Link href="/" className="nav-logo-raw">
                <span className="logo-glitch" data-text="INFLATION DETECTOR">INFLATION DETECTOR</span>
              </Link>
            </div>
            
            <div className="nav-side" style={{ justifyContent: "flex-end", gap: "3rem" }}>
              <Link href="/whatif" className="nav-link-raw hover-reveal">SIMULATOR</Link>
              <Link href="/" className="nav-action-btn">
                + ADD MONTH
              </Link>
            </div>
          </nav>

          {/* Inner Grid Context */}
          <main className="app-content">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
