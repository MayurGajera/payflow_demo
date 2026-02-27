"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

export default function NewPayoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    vendor_id: "",
    amount: "",
    mode: "NEFT",
    note: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "OPS") router.replace("/payouts");
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors || []));
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.vendor_id) return setError("Please select a vendor");
    if (!form.amount || Number(form.amount) <= 0)
      return setError("Amount must be greater than 0");
    setSubmitting(true);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/payouts/${data.payout._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h1>New Payout Request</h1>
        <p>Create a payout in Draft status</p>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vendor *</label>
            <select
              required
              value={form.vendor_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, vendor_id: e.target.value }))
              }
            >
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Mode *</label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mode: e.target.value }))
                }
              >
                <option value="NEFT">NEFT</option>
                <option value="IMPS">IMPS</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Add a note…"
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  Creating…
                </>
              ) : (
                "Create Payout"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/payouts")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
