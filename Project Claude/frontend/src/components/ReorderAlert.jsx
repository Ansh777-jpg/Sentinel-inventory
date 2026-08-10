export default function ReorderAlert({ alert }) {
  const needsReorder = alert.needs_reorder;

  return (
    <div
      style={{
        ...styles.card,
        borderColor: needsReorder ? "var(--accent-amber-dim)" : "var(--border-hairline)",
      }}
    >
      <div style={styles.headerRow}>
        <div style={styles.statusDot(needsReorder)} />
        <span style={styles.statusLabel(needsReorder)}>
          {needsReorder ? "Reorder recommended" : "Stock level nominal"}
        </span>
      </div>

      <div style={styles.grid}>
        <div>
          <div style={styles.metricLabel}>Reorder point</div>
          <div style={styles.metricValue}>{alert.reorder_point}</div>
        </div>
        <div>
          <div style={styles.metricLabel}>Suggested qty</div>
          <div
            style={{
              ...styles.metricValue,
              color: needsReorder ? "var(--accent-amber)" : "var(--text-primary)",
            }}
          >
            {alert.suggested_reorder_qty}
          </div>
        </div>
        <div>
          <div style={styles.metricLabel}>Lead time</div>
          <div style={styles.metricValue}>{alert.lead_time_days}d</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--bg-panel)",
    border: "1px solid",
    borderRadius: 8,
    padding: "16px 18px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 16,
  },
  statusDot: (active) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: active ? "var(--accent-amber)" : "var(--accent-green)",
    boxShadow: active
      ? "0 0 0 4px rgba(232, 162, 61, 0.15)"
      : "0 0 0 4px rgba(95, 191, 143, 0.12)",
  }),
  statusLabel: (active) => ({
    fontSize: 13,
    fontWeight: 500,
    color: active ? "var(--accent-amber)" : "var(--accent-green)",
    fontFamily: "var(--font-mono)",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  metricLabel: {
    fontSize: 10.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "var(--font-mono)",
    color: "var(--text-primary)",
  },
};
