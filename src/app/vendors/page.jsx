"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ShimmerTable } from "@/components/Shimmer";

export default function VendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    upi_id: "",
    bank_account: "",
    ifsc: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors?page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data.vendors);
        setTotalPages(data.totalPages || 1);
      } else setError(data.message);
    } catch {
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(`Vendor "${data.vendor.name}" created!`);
      setForm({ name: "", upi_id: "", bank_account: "", ifsc: "" });
      setShowForm(false);
      fetchVendors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1>Vendors</h1>
        <p>Manage your payment vendors</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {user?.role === "OPS" && (
          <div className="card">
            <div className="card-header">
              <h2>Add Vendor</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowForm((v) => !v)}
              >
                {showForm ? "Cancel" : "+ Add"}
              </button>
            </div>
            {showForm && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Vendor name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      value={form.upi_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, upi_id: e.target.value }))
                      }
                      placeholder="vendor@upi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Account</label>
                    <input
                      value={form.bank_account}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bank_account: e.target.value }))
                      }
                      placeholder="Account number"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    value={form.ifsc}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ifsc: e.target.value }))
                    }
                    placeholder="HDFC0001234"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" /> Saving…
                    </>
                  ) : (
                    "Create Vendor"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2>All Vendors ({vendors.length})</h2>
          </div>
          {loading ? (
            <ShimmerTable cols={5} rows={5} />
          ) : vendors.length === 0 ? (
            <div className="empty-state">
              <p>No vendors yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>UPI ID</th>
                    <th>Bank Account</th>
                    <th>IFSC</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.upi_id || "—"}</td>
                      <td>{v.bank_account || "—"}</td>
                      <td>{v.ifsc || "—"}</td>
                      <td>
                        <span className="badge badge-approved">Active</span>
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
                paddingBottom: "1.5rem",
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
      </div>
    </AppLayout>
  );
}
