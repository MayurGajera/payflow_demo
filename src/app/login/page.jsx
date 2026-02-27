"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    if (role === "ops") {
      setEmail("ops@demo.com");
      setPassword("ops123");
    } else {
      setEmail("finance@demo.com");
      setPassword("fin123");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>⚡ PayFlow</h1>
          <p>Payout Management Platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="form-group">
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
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            Demo credentials
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => fillDemo("ops")}
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}
            >
              OPS user
            </button>
            <button
              onClick={() => fillDemo("finance")}
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem" }}
            >
              FINANCE user
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
