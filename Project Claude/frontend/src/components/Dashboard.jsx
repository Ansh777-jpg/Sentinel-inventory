import { useEffect, useState } from "react";
import { api, clearToken } from "../api";
import ItemSidebar from "./ItemSidebar";
import MetricCard from "./MetricCard";
import ForecastChart from "./ForecastChart";
import ReorderAlert from "./ReorderAlert";
import UploadModal from "./UploadModal";

export default function Dashboard({ onLogout }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  async function refreshItems() {
    const list = await api.listItems();
    setItems(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].item_id);
    }
  }

  async function refreshSummary() {
    try {
      const s = await api.dashboardSummary();
      setSummary(s);
    } catch (_) {}
  }

  useEffect(() => {
    refreshItems();
    refreshSummary();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api
      .getForecast(selectedId, 30, currentStock)
      .then(setForecastData)
      .catch(() => setForecastData(null))
      .finally(() => setLoading(false));
  }, [selectedId, currentStock]);

  function handleUploaded() {
    setShowUpload(false);
    refreshItems();
    refreshSummary();
  }

  function handleLogout() {
    clearToken();
    onLogout();
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark} />
          <span style={styles.brandName}>SENTINEL</span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout} type="button">
          Sign out
        </button>
      </div>

      <div style={styles.body}>
        <ItemSidebar
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUploadClick={() => setShowUpload(true)}
        />

        <div style={styles.main}>
          {summary && (
            <div style={styles.metricsRow}>
              <MetricCard label="Tracked items" value={summary.total_items} />
              <MetricCard
                label="Needs reorder"
                value={summary.items_needing_reorder}
                tone={summary.items_needing_reorder > 0 ? "amber" : "default"}
              />
              <MetricCard
                label="Selected item"
                value={forecastData ? forecastData.item_name : "—"}
                tone="cyan"
              />
            </div>
          )}

          {!selectedId && (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No item selected</div>
              <div style={styles.emptyDesc}>
                Upload a CSV of historical demand data to generate your first forecast.
              </div>
              <button style={styles.emptyBtn} onClick={() => setShowUpload(true)} type="button">
                Upload data
              </button>
            </div>
          )}

          {selectedId && loading && (
            <div style={styles.loadingState}>Generating forecast...</div>
          )}

          {selectedId && !loading && forecastData && (
            <>
              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <span style={styles.panelTitle}>Demand forecast — next 30 days</span>
                  <div style={styles.legend}>
                    <span style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: "#8A9BAE" }} />
                      Historical
                    </span>
                    <span style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, background: "#4FC3D9" }} />
                      Forecast
                    </span>
                  </div>
                </div>
                <ForecastChart history={forecastData.history} forecast={forecastData.forecast} />
              </div>

              <div style={styles.lowerRow}>
                <div style={styles.stockInput}>
                  <label style={styles.stockLabel}>Current stock on hand</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    style={styles.numberInput}
                    min={0}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <ReorderAlert alert={forecastData.reorder_alert} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}

const styles = {
  wrap: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: 52,
    borderBottom: "1px solid var(--border-hairline)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 20,
    height: 20,
    borderRadius: 5,
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-cyan-dim) 100%)",
  },
  brandName: {
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.08em",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid var(--border-hairline)",
    borderRadius: 6,
    color: "var(--text-secondary)",
    fontSize: 12,
    padding: "6px 12px",
  },
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
  },
  metricsRow: {
    display: "flex",
    gap: 14,
    marginBottom: 20,
  },
  panel: {
    background: "var(--bg-panel)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 8,
    padding: 18,
    marginBottom: 20,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
  },
  legend: {
    display: "flex",
    gap: 14,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11.5,
    color: "var(--text-secondary)",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  lowerRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  stockInput: {
    background: "var(--bg-panel)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 8,
    padding: "16px 18px",
    width: 180,
    flexShrink: 0,
  },
  stockLabel: {
    display: "block",
    fontSize: 11,
    color: "var(--text-secondary)",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  numberInput: {
    width: "100%",
    padding: "8px 10px",
    background: "var(--bg-base)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 6,
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: 14,
  },
  emptyState: {
    background: "var(--bg-panel)",
    border: "1px dashed var(--border-strong)",
    borderRadius: 10,
    padding: "60px 24px",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: "var(--text-secondary)",
    maxWidth: 340,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  emptyBtn: {
    marginTop: 18,
    padding: "9px 18px",
    background: "var(--accent-cyan)",
    border: "none",
    borderRadius: 6,
    color: "#0B1B1F",
    fontWeight: 600,
    fontSize: 13,
  },
  loadingState: {
    padding: 60,
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: 13,
    fontFamily: "var(--font-mono)",
  },
};
