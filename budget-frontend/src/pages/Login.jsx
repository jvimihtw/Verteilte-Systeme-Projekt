import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Synchroner Lock gegen doppeltes Absenden (ignoriert Reacts Render-Delay)
  const isSubmittingRef = useRef(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Sofortiger, synchroner Abbruch bei Mehrfachklick
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      loginUser(result.user || result.data?.user || result);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't sign in. Check your details and try again."
      );
      // Nur bei einem Fehler den Lock wieder freigeben, damit man es erneut versuchen kann
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your ledger</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}