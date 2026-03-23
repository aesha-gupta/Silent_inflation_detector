"use client";

interface EntertainmentFlagProps {
  amount: number;
}

export default function EntertainmentFlag({ amount }: EntertainmentFlagProps) {
  if (amount <= 0) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: "0.75rem",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: "2rem",
          height: "2rem",
          backgroundColor: "rgba(245,158,11,0.15)",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          marginTop: "0.1rem",
        }}
      >
        ⚑
      </div>
      <div>
        <p
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#F59E0B",
            marginBottom: "0.35rem",
          }}
        >
          Entertainment spending is invisible to policymakers
        </p>
        <p style={{ fontSize: "0.875rem", color: "#D1D5DB", lineHeight: 1.6 }}>
          ₹{amount.toLocaleString("en-IN")}/month spent on entertainment is{" "}
          <strong style={{ color: "#F59E0B" }}>not included</strong> in RBI&apos;s
          official CPI Urban basket — meaning your true cost of living is
          underrepresented in government inflation data.
        </p>
      </div>
    </div>
  );
}
