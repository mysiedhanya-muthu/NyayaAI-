import React from "react";
import { 
  LayoutDashboard, 
  UserX, 
  Users, 
  Cpu, 
  FilePlus2, 
  ShieldCheck, 
  History, 
  Activity,
  Droplets
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "match_engine", label: "AI Matching Engine", icon: Cpu, badge: "Blood AI" },
    { id: "uid_cases", label: "Unidentified Deceased (UID)", icon: UserX },
    { id: "mp_records", label: "Missing Persons Registry", icon: Users },
    { id: "register_case", label: "New Case Intake", icon: FilePlus2 },
    { id: "evidence_vault", label: "Tamper-Evident Vault", icon: ShieldCheck },
    { id: "audit_logs", label: "Audit & Chain of Custody", icon: History },
  ];

  return (
    <aside style={{
      width: "260px",
      background: "rgba(7, 2, 4, 0.97)",
      borderRight: "1px solid var(--border-color)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 0.85rem",
      gap: "0.5rem"
    }}>
      <div style={{ padding: "0 0.75rem 1rem", borderBottom: "1px solid rgba(230, 0, 38, 0.2)", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff4d6d" }}>
          🩸 Forensic Investigation Unit
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                background: isActive ? "linear-gradient(90deg, rgba(230, 0, 38, 0.32), rgba(230, 0, 38, 0.1))" : "transparent",
                border: isActive ? "1px solid rgba(255, 26, 60, 0.65)" : "1px solid transparent",
                color: "#ffffff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: isActive ? "700" : "500",
                textAlign: "left",
                transition: "all 0.18s ease",
                boxShadow: isActive ? "0 0 15px rgba(230, 0, 38, 0.35)" : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={18} color={isActive ? "var(--red-crimson)" : "#f1f5f9"} />
                <span style={{ color: "#ffffff" }}>{item.label}</span>
              </div>
              {item.badge && (
                <span className="forensic-badge badge-crimson" style={{ fontSize: "0.6rem", padding: "0.1rem 0.45rem" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Node Telemetry */}
      <div style={{
        marginTop: "auto",
        background: "rgba(18, 5, 8, 0.8)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        border: "1px solid rgba(230, 0, 38, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <Activity size={14} color="var(--red-crimson)" />
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#ffffff" }}>Forensic Decision Engine</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "#f1f5f9", lineHeight: 1.5 }}>
          System Status: <span style={{ color: "#ff4d6d", fontWeight: "700" }}>Active</span><br />
          Blood & DNA Grid: <span style={{ color: "#ffffff", fontWeight: "600" }}>16 STR Loci</span><br />
          Immersion Model: <span style={{ color: "var(--red-crimson)", fontWeight: "600" }}>Casper's Dictum</span>
        </div>
      </div>
    </aside>
  );
}
