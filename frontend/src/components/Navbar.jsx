import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, UserCheck, LogOut, BookOpen, AlertCircle, Droplets } from "lucide-react";

export default function Navbar({ onOpenGuide }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar" style={{
      background: "rgba(10, 3, 5, 0.96)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border-color)",
      padding: "0.85rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <img 
          src="/logo.jpg" 
          alt="NyayaAI Blood Emblem" 
          style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover", border: "1.5px solid var(--red-crimson)", boxShadow: "0 0 12px rgba(255, 26, 60, 0.4)" }} 
        />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "800", fontFamily: "var(--font-heading)", letterSpacing: "0.05em", color: "#ffffff" }}>
              NYAYA<span style={{ color: "var(--red-crimson)" }}>AI</span>
            </span>
            <span className="forensic-badge badge-crimson" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
              🩸 FORENSIC HEMATOLOGY v2.4
            </span>
          </div>
          <p style={{ fontSize: "0.72rem", color: "#f1f5f9", margin: 0 }}>
            Forensic Victim Identification & Missing-Person Matching Directorate
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* Security & System Integrity Banner */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(230, 0, 38, 0.16)",
          padding: "0.35rem 0.85rem",
          borderRadius: "var(--radius-full)",
          border: "1px solid rgba(255, 26, 60, 0.4)",
          fontSize: "0.75rem",
          color: "#ffffff",
          fontWeight: "600"
        }}>
          <Lock size={12} color="var(--red-crimson)" />
          <span>FIPS-140 & SHA-256 Tamper-Proof Cryptoseal</span>
        </div>

        {/* Forensic Immersion Guide Button */}
        <button 
          onClick={onOpenGuide}
          className="btn btn-secondary"
          style={{ fontSize: "0.775rem", padding: "0.4rem 0.85rem" }}
          title="Casper's Dictum & Aquatic Decomposition Reference"
        >
          <BookOpen size={14} color="var(--red-crimson)" />
          <span style={{ color: "#ffffff" }}>Water Immersion & Blood Analysis</span>
        </button>

        {/* User Profile / Menu */}
        {user && (
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(25, 8, 12, 0.85)",
                border: "1px solid rgba(230, 0, 38, 0.35)",
                padding: "0.35rem 0.8rem",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                color: "#ffffff"
              }}
            >
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e60026, #8a0316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.75rem",
                color: "#ffffff",
                boxShadow: "0 0 10px rgba(230, 0, 38, 0.5)"
              }}>
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", lineHeight: 1.1, color: "#ffffff" }}>{user.full_name}</div>
                <div style={{ fontSize: "0.675rem", color: "var(--red-crimson)", fontWeight: "600" }}>{user.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div style={{
                position: "absolute",
                right: 0,
                top: "115%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-card)",
                width: "240px",
                padding: "0.75rem",
                zIndex: 200
              }}>
                <div style={{ paddingBottom: "0.5rem", borderBottom: "1px solid rgba(230, 0, 38, 0.2)", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#ffffff" }}>Badge: {user.badge_number || "INV-001"}</div>
                  <div style={{ fontSize: "0.7rem", color: "#fca5a5" }}>{user.department}</div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#ffffff",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "700"
                  }}
                >
                  <LogOut size={14} color="#ff4d6d" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
