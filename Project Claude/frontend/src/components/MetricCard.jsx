export default function MetricCard({ label, value, tone = "default", sub }) {
  const toneColor =
    tone === "amber"
      ? "var(--accent-amber)"
      : tone === "cyan"
      ? "var(--accent-cyan)"
      : "var(--text-primary)";

  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color: toneColor }}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: "var(--bg-panel)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 8,
    padding: "16px 18px",
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: 600,
    fontFamily: "var(--font-mono)",
    lineHeight: 1,
  },
  sub: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: 8,
  },
};
