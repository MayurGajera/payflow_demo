"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load dashboard metrics");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: "2rem" }}>
          <div className="shimmer-wrapper">
            <div
              className="shimmer-block w-40 h-4"
              style={{ marginBottom: "2rem" }}
            ></div>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div
                  className="shimmer-block w-full"
                  style={{ height: "4rem" }}
                ></div>
              </div>
              <div className="stat-card">
                <div
                  className="shimmer-block w-full"
                  style={{ height: "4rem" }}
                ></div>
              </div>
              <div className="stat-card">
                <div
                  className="shimmer-block w-full"
                  style={{ height: "4rem" }}
                ></div>
              </div>
              <div className="stat-card">
                <div
                  className="shimmer-block w-full"
                  style={{ height: "4rem" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const payouts = stats?.payouts || {};
  const totalPayoutsAmount = Object.values(payouts).reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const totalPayoutsCount = Object.values(payouts).reduce(
    (sum, p) => sum + p.count,
    0,
  );

  return (
    <AppLayout>
      <div
        className="page-header"
        style={{ borderBottom: "none", paddingBottom: 0 }}
      >
        <div>
          <h1>Welcome back, {user?.role}!</h1>
          <p>Here&apos;s an overview of your platform metrics.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ padding: "0 2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Platform Overview
        </h2>

        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Total Payout Volume</h3>
            <p className="value">
              ₹{totalPayoutsAmount.toLocaleString("en-IN")}
            </p>
            <p className="sub-value">Across {totalPayoutsCount} requests</p>
          </div>

          <div className="stat-card">
            <h3>Vendors</h3>
            <p className="value">{stats?.totalVendors || 0}</p>
            <p className="sub-value">Active vendors registered</p>
          </div>
        </div>

        <h2
          style={{
            fontSize: "1.25rem",
            marginTop: "2rem",
            marginBottom: "1rem",
          }}
        >
          Payout Status
        </h2>

        <div className="dashboard-grid">
          <div
            className="stat-card"
            style={{ borderLeft: "4px solid var(--text-muted)" }}
          >
            <h3>Drafts</h3>
            <p className="value">{payouts["Draft"]?.count || 0}</p>
            <p className="sub-value">
              ₹{(payouts["Draft"]?.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="stat-card"
            style={{ borderLeft: "4px solid #3b82f6" }}
          >
            <h3>Pending Approval</h3>
            <p className="value">{payouts["Submitted"]?.count || 0}</p>
            <p className="sub-value">
              ₹{(payouts["Submitted"]?.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="stat-card"
            style={{ borderLeft: "4px solid var(--success)" }}
          >
            <h3>Approved (Processed)</h3>
            <p className="value">{payouts["Approved"]?.count || 0}</p>
            <p className="sub-value">
              ₹{(payouts["Approved"]?.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="stat-card"
            style={{ borderLeft: "4px solid var(--error)" }}
          >
            <h3>Rejected</h3>
            <p className="value">{payouts["Rejected"]?.count || 0}</p>
            <p className="sub-value">
              ₹{(payouts["Rejected"]?.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
