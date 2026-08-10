import { useState } from "react";
import { api } from "../api";

export default function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    try {
      const res = await api.uploadCsv(file);
      setStatus("done");
      setMessage(`${res.records_created} records uploaded.`);
      onUploaded();
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>Upload inventory data</div>
        <p style={styles.desc}>
          CSV must include columns: <code style={styles.code}>date</code>,{" "}
          <code style={styles.code}>item_id</code>,{" "}
          <code style={styles.code}>item_name</code>,{" "}
          <code style={styles.code}>quantity</code>. Category is optional.
        </p>

        <label style={styles.dropzone}>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? file.name : "Click to choose a CSV file"}
        </label>

        {message && (
          <div
            style={{
              ...styles.message,
              color: status === "error" ? "#F5C4BE" : "#B9E8C9",
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose} type="button">
            Close
          </button>
          <button
            style={styles.uploadBtn}
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
            type="button"
          >
            {status === "uploading" ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 10, 14, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    width: 440,
    background: "var(--bg-panel-raised)",
    border: "1px solid var(--border-strong)",
    borderRadius: 10,
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: 18,
  },
  code: {
    fontFamily: "var(--font-mono)",
    background: "var(--bg-base)",
    padding: "1px 5px",
    borderRadius: 3,
    fontSize: 12,
    color: "var(--accent-cyan)",
  },
  dropzone: {
    display: "block",
    textAlign: "center",
    padding: "22px 12px",
    border: "1px dashed var(--border-strong)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  message: {
    marginTop: 14,
    fontSize: 13,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    padding: "9px 16px",
    background: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    color: "var(--text-secondary)",
    fontSize: 13,
  },
  uploadBtn: {
    padding: "9px 16px",
    background: "var(--accent-cyan)",
    border: "none",
    borderRadius: 6,
    color: "#0B1B1F",
    fontWeight: 600,
    fontSize: 13,
  },
};
