"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ShimmerTable } from "@/components/Shimmer";

const STATUS_OPTIONS = ["", "Draft", "Submitted", "Approved", "Rejected"];

function statusBadge(status) {
  const cls = {
    Draft: "badge-draft",
    Submitted: "badge-submitted",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return <span className={`badge ${cls[status] || ""}`}>{status}</span>;
}

export default function PayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set("status", statusFilter);
      if (vendorFilter) params.set("vendor_id", vendorFilter);
      const res = await fetch(`/api/payouts?${params}`);
      const data = await res.json();
      if (res.ok) {
        setPayouts(data.payouts);
        setTotalPages(data.totalPages || 1);
      } else setError(data.message);
    } catch {
      setError("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, vendorFilter, page]);

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors || []));
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return (
    <AppLayout>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1>Payout Requests</h1>
            <p>Track and manage all payout requests</p>
          </div>
          {user?.role === "OPS" && (
            <Link href="/payouts/new" className="btn btn-primary">
              + New Payout
            </Link>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Payouts</h2>
          <div className="filter-bar">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={fetchPayouts}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <ShimmerTable cols={7} rows={5} />
        ) : !payouts || payouts.length === 0 ? (
          <div className="empty-state">
            <p>No payouts found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>
                      {p.vendor_id?.name || "—"}
                    </td>
                    <td>₹{p.amount.toLocaleString("en-IN")}</td>
                    <td>
                      <span className="badge badge-draft">{p.mode}</span>
                    </td>
                    <td>{statusBadge(p.status)}</td>
                    <td
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      {p.created_by?.email}
                    </td>
                    <td
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                      suppressHydrationWarning
                    >
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <Link
                        href={`/payouts/${p._id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <span style={{ fontSize: "0.875rem", alignSelf: "center" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
