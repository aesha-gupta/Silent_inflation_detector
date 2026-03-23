"use client";

interface EntertainmentFlagProps {
  amount: number;
}

export default function EntertainmentFlag({ amount }: EntertainmentFlagProps) {
  if (amount <= 0) return null;

  return (
    <div style={{
      backgroundColor: "rgba(245,158,11,0.04)",
      border: "1px solid rgba(245,158,11,0.2)",
      borderLeft: "3px solid var(--accent-amber)",
      borderRadius: 2,
      padding: "1.25rem 1.5rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
    }}>
      <div style={{
        flexShrink: 0,
        fontFamily: "var(--font-display)",
        fontSize: "0.65rem",
        fontWeight: 700,
        color: "var(--accent-amber)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        border: "1px solid rgba(245,158,11,0.25)",
        padding: "0.2rem 0.5rem",
        borderRadius: 1,
        marginTop: "0.15rem",
        whiteSpace: "nowrap",
      }}>
        ⚑ Flag
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--accent-amber)", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
          Entertainment spending is invisible to policymakers
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
          ₹{amount.toLocaleString("en-IN")}/month on entertainment is{" "}
          <strong style={{ color: "var(--text-primary)" }}>not included</strong> in RBI&apos;s
          official CPI Urban basket — meaning your true cost of living is underrepresented in government data.
        </p>
      </div>
    </div>
  );
}
