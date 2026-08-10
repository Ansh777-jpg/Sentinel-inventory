export default function ItemSidebar({ items, selectedId, onSelect, onUploadClick }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>Tracked items</span>
        <button style={styles.uploadBtn} onClick={onUploadClick} type="button">
          + Upload
        </button>
      </div>

      {items.length === 0 ? (
        <div style={styles.empty}>
          No items yet. Upload a CSV to get started.
        </div>
      ) : (
        <div style={styles.list}>
          {items.map((item) => (
            <button
              key={item.item_id}
              type="button"
              onClick={() => onSelect(item.item_id)}
              style={{
                ...styles.itemRow,
                ...(selectedId === item.item_id ? styles.itemRowActive : {}),
              }}
            >
              <div style={styles.itemName}>{item.item_name}</div>
              <div style={styles.itemMeta}>
                {item.item_id}
                {item.category ? ` · ${item.category}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    width: 260,
    borderRight: "1px solid var(--border-hairline)",
    background: "var(--bg-panel)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  header: {
    padding: "16px 16px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--border-hairline)",
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
  },
  uploadBtn: {
    background: "var(--bg-hover)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    color: "var(--accent-cyan)",
    fontSize: 12,
    fontWeight: 500,
    padding: "5px 10px",
  },
  empty: {
    padding: "24px 16px",
    fontSize: 13,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  list: {
    overflowY: "auto",
    padding: 8,
  },
  itemRow: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 6,
    padding: "10px 12px",
    marginBottom: 2,
  },
  itemRowActive: {
    background: "var(--bg-hover)",
    borderColor: "var(--border-strong)",
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "var(--text-primary)",
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
};
