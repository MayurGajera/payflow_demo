"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setStatusMsg({
        type: "error",
        text: "New passwords do not match",
      });
    }
    if (newPassword.length < 6) {
      return setStatusMsg({
        type: "error",
        text: "New password must be at least 6 characters",
      });
    }

    setSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setStatusMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Your Profile</h1>
          <p>Manage your account settings</p>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 2rem" }}>
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Account Details
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("security");
              setStatusMsg({ type: "", text: "" }); // clear messages on switch
            }}
          >
            Security & Password
          </button>
        </div>

        {activeTab === "details" && (
          <div className="card tab-content">
            <div className="card-header">
              <h2>Account Details</h2>
            </div>
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="text"
                  className="input"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Assigned Role</label>
                <input
                  type="text"
                  className="input"
                  value={user?.role || ""}
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="action-panel tab-content" style={{ marginTop: 0 }}>
            <h3>Change Password</h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                marginBottom: "1.5rem",
                textTransform: "none",
                letterSpacing: "normal",
              }}
            >
              Update your password securely. Minimum 6 characters.
            </p>

            {statusMsg.text && (
              <div
                className={`alert ${statusMsg.type === "error" ? "alert-error" : "alert-success"}`}
                style={{ marginBottom: "1rem" }}
              >
                {statusMsg.text}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "fit-content" }}
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
