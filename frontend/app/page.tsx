"use client";

import SpendingForm from "@/components/SpendingForm";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingBottom: "6rem" }}>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "6rem 1.5rem 4rem" }}>
        <div className="badge-pill" style={{ marginBottom: "2rem", display: "inline-flex" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-teal)", flexShrink: 0 }} />
          CPI Urban India — Live Data
        </div>

        <h1
          className="display-heading"
          style={{
            fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
            maxWidth: 720,
            margin: "0 auto 1.5rem",
            lineHeight: 1.08,
          }}
        >
          Your inflation rate.{" "}
          <span style={{ color: "var(--accent-orange)" }}>Not the government&apos;s average.</span>
        </h1>

        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
          color: "var(--text-muted)",
          maxWidth: 560,
          margin: "0 auto",
          lineHeight: 1.75,
        }}>
          India&apos;s official CPI is an average across all households.
          We calculate yours — based on how you <em style={{ color: "var(--text-primary)", fontStyle: "normal" }}>actually</em> spend.
        </p>
      </section>

      {/* ── Spending form card ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="card" style={{ marginBottom: "5rem" }}>
          {/* Card header */}
          <div style={{ marginBottom: "1.75rem" }}>
            <p className="section-label">Monthly Spending Input</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              All amounts in Indian Rupees (₹). Leave blank to treat as ₹0.
            </p>
          </div>
          <SpendingForm />
        </div>

        {/* ── How It Works ── */}
        <div>
          <p className="section-label">How It Works</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", background: "rgba(93,64,56,0.2)" }}>
            {[
              {
                num: "01",
                title: "Enter your monthly spend",
                body: "Split your expenses across 7 categories — Food, Housing, Transport, Clothing, Healthcare, Entertainment, Others.",
                accent: "var(--accent-teal)",
              },
              {
                num: "02",
                title: "We weight it against CPI Urban",
                body: "Your spend share per category is multiplied by the RBI/MOSPI CPI Urban YoY inflation for that category.",
                accent: "var(--accent-orange)",
              },
              {
                num: "03",
                title: "See your real inflation rate",
                body: "Compare your personal inflation to the national headline CPI and discover where your money is most pressured.",
                accent: "var(--accent-lime)",
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: "var(--bg-card)",
                  padding: "2rem 1.75rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Ghost watermark number */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "-0.5rem",
                    right: "-0.25rem",
                    fontSize: "7rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: step.accent,
                    opacity: 0.06,
                    lineHeight: 1,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {step.num}
                </span>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: step.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: "0.75rem",
                }}>
                  Step {step.num}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.6rem" }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "3.5rem", fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          CPI Urban data source: MOSPI (mospi.gov.in) · Base year 2012=100 · Urban India only
        </p>
      </div>
    </main>
  );
}
