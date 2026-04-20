import * as React from "react";

export const Field: React.FC<{
  label?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, invalid, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
    {label && (
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)", paddingLeft: 4 }}>
        {label}
      </label>
    )}
    {children}
    {hint && (
      <div
        style={{
          fontSize: 11,
          color: invalid ? "var(--danger)" : "var(--fg-subtle)",
          paddingLeft: 4,
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

export const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 12 }) => (
  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap }}>{children}</div>
);
