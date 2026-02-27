"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ShimmerDetail, ShimmerTable } from "@/components/Shimmer";

const ACTION_LABELS = {
  CREATED: "✦",
  SUBMITTED: "↑",
  APPROVED: "✓",
  REJECTED: "✗",
};
const STATUS_CLASSES = {
  Draft: "badge-draft",
  Submitted: "badge-submitted",
  Approved: "badge-approved",
  Rejected: "badge-rejected",
};

function formatDate(d) {
  return new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PayoutDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [payout, setPayout] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayout = useCallback(async () => {
    try {
      const res = await fetch(`/api/payouts/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayout(data.payout);
      setAudits(data.audits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPayout();
  }, [fetchPayout]);

  async function doAction(action, body = {}) {
    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/payouts/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowRejectModal(false);
      setRejectReason("");
      await fetchPayout();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading)
    return (
      <AppLayout>
        <div style={{ padding: "2rem" }}>
          <ShimmerDetail />
        </div>
      </AppLayout>
    );
  if (error)
    return (
      <AppLayout>
        <div className="alert alert-error">{error}</div>
      </AppLayout>
    );

  const canSubmit = user?.role === "OPS" && payout?.status === "Draft";
  const canApprove = user?.role === "FINANCE" && payout?.status === "Submitted";
  const canReject = user?.role === "FINANCE" && payout?.status === "Submitted";
  const hasActions = canSubmit || canApprove || canReject;

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.push("/payouts")}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
          <div>
            <h1>Payout Detail</h1>
            <p>#{id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="detail-grid">
        {/* Left column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="card">
            <div className="card-header">
              <h2>Payout Info</h2>
              <span className={`badge ${STATUS_CLASSES[payout.status]}`}>
                {payout.status}
              </span>
            </div>
            <div>
              <div className="detail-row">
                <span className="detail-label">Vendor</span>
                <strong>{payout.vendor_id?.name}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <strong>₹{payout.amount.toLocaleString("en-IN")}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mode</span>
                <span className="badge badge-draft">{payout.mode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Note</span>
                <span>{payout.note || "—"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created by</span>
                <span>{payout.created_by?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created at</span>
                <span suppressHydrationWarning>
                  {formatDate(payout.createdAt)}
                </span>
              </div>
              {payout.status === "Rejected" && (
                <div className="detail-row">
                  <span className="detail-label">Rejection reason</span>
                  <span style={{ color: "var(--danger)", fontWeight: 500 }}>
                    {payout.decision_reason}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor details */}
          <div className="card">
            <div className="card-header">
              <h2>Vendor Details</h2>
            </div>
            <div>
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span>{payout.vendor_id?.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">UPI ID</span>
                <span>{payout.vendor_id?.upi_id || "—"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bank Account</span>
                <span>{payout.vendor_id?.bank_account || "—"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">IFSC</span>
                <span>{payout.vendor_id?.ifsc || "—"}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="card">
            <div className="card-header">
              <h2>Audit Trail</h2>
            </div>
            {audits.length === 0 ? (
              <div className="empty-state">
                <p>No audit records found.</p>
              </div>
            ) : (
              <ul className="audit-list">
                {audits.map((a, i) => (
                  <li key={i} className="audit-item">
                    <div className={`audit-dot audit-dot-${a.action}`}>
                      {ACTION_LABELS[a.action]}
                    </div>
                    <div className="audit-body">
                      <div className="audit-action">{a.action}</div>
                      <div className="audit-meta" suppressHydrationWarning>
                        by {a.performed_by?.email} ({a.performed_by?.role}) ·{" "}
                        {formatDate(a.timestamp)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column: actions */}
        <div>
          {hasActions && (
            <div className="action-panel">
              <h3>Actions</h3>
              <div className="action-buttons">
                {canSubmit && (
                  <button
                    className="btn btn-primary"
                    onClick={() => doAction("submit")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner" />…
                      </>
                    ) : (
                      "↑ Submit for Approval"
                    )}
                  </button>
                )}
                {canApprove && (
                  <button
                    className="btn btn-success"
                    onClick={() => doAction("approve")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner" />…
                      </>
                    ) : (
                      "✓ Approve"
                    )}
                  </button>
                )}
                {canReject && (
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    ✗ Reject
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Payout</h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              Please provide a reason for rejection. This will be visible to the
              OPS team.
            </p>
            {actionError && (
              <div className="alert alert-error">{actionError}</div>
            )}
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Budget not allocated, please resubmit next quarter."
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={() =>
                  doAction("reject", { decision_reason: rejectReason })
                }
              >
                {actionLoading ? (
                  <>
                    <span className="spinner" />…
                  </>
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
