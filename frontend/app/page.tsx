"use client";

import SpendingForm from "@/components/SpendingForm";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0F1E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "4rem",
        paddingBottom: "4rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "860px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "9999px", padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "9999px", backgroundColor: "#00D4AA", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "#00D4AA", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              CPI Urban India
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "#E5E7EB",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Your inflation rate.{" "}
            <span style={{ color: "#00D4AA" }}>Not the government&apos;s average.</span>
          </h1>
          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#6B7280", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            India&apos;s official CPI is an average across all households. We calculate yours
            — based on how you <em style={{ color: "#9CA3AF" }}>actually</em> spend.
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ marginBottom: "4rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#E5E7EB", marginBottom: "0.3rem" }}>
              Enter Your Monthly Spending
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#6B7280" }}>
              All amounts in Indian Rupees (₹). Leave blank to treat as ₹0.
            </p>
          </div>
          <SpendingForm />
        </div>

        {/* How it works */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#E5E7EB", textAlign: "center", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              {
                num: "01",
                title: "Enter your monthly spend",
                body: "Split your expenses across 7 categories — Food, Housing, Transport, Clothing, Healthcare, Entertainment, Others.",
              },
              {
                num: "02",
                title: "We weight it against CPI Urban",
                body: "Your spend share per category is multiplied by the RBI/MOSPI CPI Urban YoY inflation for that category.",
              },
              {
                num: "03",
                title: "See your real inflation rate",
                body: "Compare your personal inflation to the national headline CPI and discover where your money is most pressured.",
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: "#111827",
                  border: "1px solid #1F2937",
                  borderRadius: "0.75rem",
                  padding: "1.5rem",
                }}
              >
                <p
                  className="font-mono-numbers"
                  style={{ fontSize: "2rem", fontWeight: 800, color: "rgba(0,212,170,0.2)", marginBottom: "0.75rem" }}
                >
                  {step.num}
                </p>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#E5E7EB", marginBottom: "0.5rem" }}>
                  {step.title}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "3rem", fontSize: "0.75rem", color: "#374151" }}>
          CPI Urban data source: MOSPI (mospi.gov.in). Base year 2012=100.
        </p>
      </div>
    </main>
  );
}
