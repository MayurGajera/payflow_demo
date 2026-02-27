"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const initial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="top-header">
      <div className="profile-menu" style={{ position: "relative" }}>
        <button
          className="profile-trigger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="avatar">{initial}</div>
          <span style={{ fontWeight: 500 }}>{user.email}</span>
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>▼</span>
        </button>

        {menuOpen && (
          <div
            className="dropdown-menu"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              padding: "0.5rem",
              minWidth: "150px",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem",
                borderBottom: "1px solid var(--border)",
                marginBottom: "0.25rem",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Logged in as
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {user.role}
              </div>
            </div>
            <Link
              href="/profile"
              className="btn btn-ghost"
              style={{
                justifyContent: "flex-start",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
              }}
              onClick={() => setMenuOpen(false)}
            >
              ⚙ Edit Profile
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="btn btn-ghost"
              style={{
                justifyContent: "flex-start",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                color: "var(--error)",
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
