import { useState } from "react";
import { api, saveToken } from "../api";

export default function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? api.login : api.signup;
      const res = await fn(email, password);
      saveToken(res.access_token);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark} />
          <div>
            <div style={styles.brandName}>SENTINEL</div>
            <div style={styles.brandSub}>demand forecasting &amp; inventory control</div>
          </div>
        </div>

        <div style={styles.tabRow}>
          <button
            style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
            onClick={() => setMode("login")}
            type="button"
          >
            Sign in
          </button>
          <button
            style={{ ...styles.tab, ...(mode === "signup" ? styles.tabActive : {}) }}
            onClick={() => setMode("signup")}
            type="button"
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.submit} type="submit" disabled={loading}>
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 50% 0%, #16212C 0%, #0F1720 60%)",
  },
  card: {
    width: 380,
    background: "var(--bg-panel)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 10,
    padding: "32px 28px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background:
      "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-cyan-dim) 100%)",
    flexShrink: 0,
  },
  brandName: {
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.08em",
    color: "var(--text-primary)",
  },
  brandSub: {
    fontSize: 12,
    color: "var(--text-secondary)",
    marginTop: 2,
  },
  tabRow: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    background: "var(--bg-base)",
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "none",
    borderRadius: 6,
    color: "var(--text-secondary)",
    fontSize: 13,
    fontWeight: 500,
  },
  tabActive: {
    background: "var(--bg-panel-raised)",
    color: "var(--text-primary)",
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "var(--text-secondary)",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-base)",
    border: "1px solid var(--border-hairline)",
    borderRadius: 6,
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
  },
  error: {
    marginTop: 14,
    padding: "8px 12px",
    background: "var(--accent-red-dim)",
    color: "#F5C4BE",
    borderRadius: 6,
    fontSize: 13,
  },
  submit: {
    width: "100%",
    marginTop: 22,
    padding: "11px 0",
    background: "var(--accent-cyan)",
    border: "none",
    borderRadius: 6,
    color: "#0B1B1F",
    fontWeight: 600,
    fontSize: 14,
  },
};
