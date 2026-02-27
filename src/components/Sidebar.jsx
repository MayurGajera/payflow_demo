"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        ⚡ PayFlow
        <span>Payout Management</span>
      </div>
      <nav>
        <Link
          href="/payouts"
          className={pathname.startsWith("/payouts") ? "active" : ""}
        >
          💸 Payouts
        </Link>
        <Link
          href="/vendors"
          className={pathname.startsWith("/vendors") ? "active" : ""}
        >
          🏪 Vendors
        </Link>
        {user.role === "OPS" && (
          <Link
            href="/payouts/new"
            className={pathname === "/payouts/new" ? "active" : ""}
          >
            ➕ New Payout
          </Link>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <strong>{user.email}</strong>
          <span className={`badge badge-${user.role.toLowerCase()}`}>
            {user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
