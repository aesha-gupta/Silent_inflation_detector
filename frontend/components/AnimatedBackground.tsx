"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: "dot" | "cross" | "dash";
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const COLORS = [
      "rgba(47, 244, 221,",   // teal
      "rgba(252, 68, 2,",     // orange
      "rgba(81, 252, 2,",     // lime
      "rgba(255, 253, 219,",  // warm white
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawnParticle = (): Particle => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.4 + 0.05,
        color,
        type: Math.random() < 0.15 ? "cross" : Math.random() < 0.2 ? "dash" : "dot",
      };
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 80 }, () => {
        const p = spawnParticle();
        p.y = Math.random() * canvas.height; // scatter vertically on init
        return p;
      });
    };

    const drawParticle = (p: Particle) => {
      const col = `${p.color}${p.alpha})`;
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      ctx.lineWidth = p.size * 0.6;

      if (p.type === "dot") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "cross") {
        const s = p.size * 3;
        ctx.beginPath();
        ctx.moveTo(p.x - s, p.y);
        ctx.lineTo(p.x + s, p.y);
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x, p.y + s);
        ctx.stroke();
      } else {
        // dash
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 3, p.y);
        ctx.lineTo(p.x + p.size * 3, p.y);
        ctx.stroke();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint horizontal grid sweep lines
      for (let i = 0; i < canvas.height; i += 60) {
        ctx.strokeStyle = "rgba(93, 64, 56, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Update + draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Fade in near bottom, fade out near top
        const progress = 1 - p.y / canvas.height;
        p.alpha = Math.min(0.45, p.alpha + 0.001) * (1 - Math.pow(Math.max(0, progress - 0.8) / 0.2, 2));

        if (p.y < -20) {
          particles[i] = spawnParticle();
        } else {
          drawParticle(p);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    init();
    tick();

    const handleResize = () => {
      resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* CSS floating orbs — like MindJoin's atmospheric glow blobs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>

        {/* Orb 1 — teal, top-left, slow drift */}
        <div style={{
          position: "absolute",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(47,244,221,0.07) 0%, transparent 70%)",
          top: "-10vw",
          left: "-5vw",
          animation: "orbFloat1 20s ease-in-out infinite",
          filter: "blur(2px)",
        }} />

        {/* Orb 2 — orange, bottom-right */}
        <div style={{
          position: "absolute",
          width: "28vw",
          height: "28vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(252,68,2,0.06) 0%, transparent 70%)",
          bottom: "-8vw",
          right: "-8vw",
          animation: "orbFloat2 25s ease-in-out infinite",
          filter: "blur(3px)",
        }} />

        {/* Orb 3 — teal, center-right, faster */}
        <div style={{
          position: "absolute",
          width: "20vw",
          height: "20vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(47,244,221,0.04) 0%, transparent 70%)",
          top: "40%",
          right: "10%",
          animation: "orbFloat3 18s ease-in-out infinite",
        }} />

        {/* Orb 4 — lime, mid-left */}
        <div style={{
          position: "absolute",
          width: "16vw",
          height: "16vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(81,252,2,0.04) 0%, transparent 70%)",
          top: "55%",
          left: "5%",
          animation: "orbFloat4 22s ease-in-out infinite",
        }} />

        {/* Moving horizontal data beam */}
        <div style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          top: "30%",
          left: 0,
          background: "linear-gradient(to right, transparent, rgba(47,244,221,0.12), transparent)",
          animation: "beamSweep 12s ease-in-out infinite",
        }} />

        <div style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          top: "65%",
          left: 0,
          background: "linear-gradient(to right, transparent, rgba(252,68,2,0.10), transparent)",
          animation: "beamSweep 16s ease-in-out infinite reverse",
        }} />
      </div>
    </>
  );
}
