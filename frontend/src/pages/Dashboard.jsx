import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Users, 
  UserX, 
  Waves, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  FileText,
  Activity,
  Droplets,
  Calendar
} from "lucide-react";

export default function Dashboard({ onSelectCase, onSelectMatch, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [recentUIDs, setRecentUIDs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, matchesData, uidsData] = await Promise.all([
        api.getStatistics(),
        api.getMatches({ limit: 5 }),
        api.getUIDCases()
      ]);
      setStats(statsData);
      setRecentMatches(matchesData.slice(0, 5));
      setRecentUIDs(uidsData.slice(0, 4));
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      {/* Hero Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(25, 6, 11, 0.94) 0%, rgba(14, 3, 6, 0.92) 100%), url('/blood_cells_dna.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid rgba(255, 26, 60, 0.45)",
        borderRadius: "var(--radius-lg)",
        padding: "1.75rem 2rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 10px 35px rgba(0,0,0,0.8), 0 0 25px rgba(230, 0, 38, 0.25)"
      }}>
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span className="forensic-badge badge-crimson" style={{ color: "#ffffff", fontWeight: "800" }}>
              🩸 CFSL CENTRAL FORENSIC DIRECTIVE
            </span>
            <span className="forensic-badge badge-crimson" style={{ background: "rgba(185, 28, 28, 0.4)", color: "#ffffff" }}>
              SECURE ENCRYPTED NETWORK
            </span>
          </div>
          <h2 style={{ fontSize: "1.85rem", color: "#ffffff", marginBottom: "0.35rem", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
            Forensic Identification & Aquatic Victim Recovery System
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#ffffff", lineHeight: 1.5, margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
            Automated multi-modal matching engine for unidentified deceased individuals recovered from water bodies.
            Synthesizes DNA STR electropherograms, 32-tooth odontograms, orthopedic implants, and Casper's Dictum decomposition rates.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={() => onNavigate("match_engine")} 
            className="btn btn-primary pulse-glow"
            style={{ padding: "0.85rem 1.4rem", fontSize: "0.95rem" }}
          >
            <Cpu size={18} color="#ffffff" />
            <span>Launch AI Engine</span>
          </button>
          <button 
            onClick={() => onNavigate("register_case")} 
            className="btn btn-secondary"
            style={{ padding: "0.85rem 1.4rem", fontSize: "0.95rem" }}
          >
            <span>Register Intake</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Unidentified Deceased (UID)</div>
            <div className="stat-value" style={{ color: "#ffffff" }}>
              {stats?.total_unidentified_deceased ?? "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#ff4d6d", marginTop: "0.25rem", fontWeight: "600" }}>
              {stats?.water_immersion_cases ?? "—"} Aquatic Recoveries
            </div>
          </div>
          <div style={{ background: "rgba(230, 0, 38, 0.2)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 26, 60, 0.4)" }}>
            <UserX size={26} color="var(--red-crimson)" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Missing Persons Registered</div>
            <div className="stat-value" style={{ color: "#ffffff" }}>
              {stats?.total_missing_persons ?? "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "0.25rem", fontWeight: "600" }}>
              Antemortem Profiles Active
            </div>
          </div>
          <div style={{ background: "rgba(220, 38, 38, 0.2)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
            <Users size={26} color="#ff4d6d" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">High-Confidence Leads</div>
            <div className="stat-value" style={{ color: "var(--red-crimson)" }}>
              {stats?.high_confidence_leads ?? "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#ffffff", marginTop: "0.25rem" }}>
              Score &gt; 80% (Ready for Review)
            </div>
          </div>
          <div style={{ background: "rgba(230, 0, 38, 0.25)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--red-crimson)" }}>
            <Cpu size={26} color="var(--red-crimson)" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Confirmed Identifications</div>
            <div className="stat-value" style={{ color: "#ffffff" }}>
              {stats?.confirmed_identifications ?? "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#ff4d6d", marginTop: "0.25rem", fontWeight: "600" }}>
              Judicial Inquest Approved
            </div>
          </div>
          <div style={{ background: "rgba(185, 28, 28, 0.25)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 26, 60, 0.4)" }}>
            <CheckCircle2 size={26} color="var(--red-crimson)" />
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.75rem" }}>
        {/* Left: High-Confidence AI Matches */}
        <div className="forensic-card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: "1.15rem", color: "#ffffff" }}>Prioritized AI Forensic Matches</h3>
              <p style={{ fontSize: "0.75rem", color: "#f1f5f9", margin: 0 }}>
                Algorithmic rankings combining STR DNA, dental odontology, tattoos, and river flow
              </p>
            </div>
            <button 
              onClick={() => onNavigate("match_engine")} 
              className="btn btn-secondary" 
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
            >
              <span>View All Matches</span>
              <ArrowRight size={14} color="#ffffff" />
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {recentMatches.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#ffffff" }}>
                No evaluated matches yet. Run the AI matching engine to discover leads.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m.id)}
                    style={{
                      padding: "1rem 1.5rem",
                      borderBottom: "1px solid rgba(230, 0, 38, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(230, 0, 38, 0.12)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--red-crimson)" }}>
                          {m.uid_case_number}
                        </span>
                        <span style={{ color: "#ffffff" }}>⇄</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                          {m.mp_case_number} ({m.mp_name})
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
                        {m.uid_water_body ? `Recovered from ${m.uid_water_body}` : "Unidentified"} • {m.uid_immersion || "Aquatic immersion"}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ 
                          fontSize: "1.2rem", 
                          fontWeight: "900", 
                          fontFamily: "var(--font-heading)",
                          color: "var(--red-crimson)"
                        }}>
                          {m.overall_score}%
                        </div>
                        <span className="forensic-badge badge-crimson" style={{ fontSize: "0.65rem", padding: "0.1rem 0.45rem", color: "#ffffff" }}>
                          {m.confidence_level}
                        </span>
                      </div>
                      <ArrowRight size={16} color="var(--red-crimson)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Aquatic Immersion Cases & Distribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Immersion Breakdown Card */}
          <div className="forensic-card">
            <div className="card-header">
              <h4 style={{ fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Droplets size={16} color="var(--red-crimson)" /> Aquatic Decomposition Triage
              </h4>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { stage: "Washerwoman Maceration (0-3d)", count: 1, color: "var(--red-crimson)", pct: 25 },
                  { stage: "Moderate Bloating & Slippage (3-7d)", count: 2, color: "#ff4d6d", pct: 50 },
                  { stage: "Adipocere / Saponification (1-3w)", count: 1, color: "#fca5a5", pct: 25 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#ffffff", fontWeight: "600" }}>{item.stage}</span>
                      <span style={{ color: item.color, fontWeight: "800" }}>{item.count} Cases ({item.pct}%)</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Case List */}
          <div className="forensic-card">
            <div className="card-header">
              <h4 style={{ fontSize: "1rem", color: "#ffffff" }}>Recent Water Recovery Cases</h4>
              <button onClick={() => onNavigate("uid_cases")} className="btn btn-secondary" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}>
                View All
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentUIDs.map((uid) => (
                <div 
                  key={uid.id} 
                  onClick={() => onSelectCase(uid.id)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderBottom: "1px solid rgba(230, 0, 38, 0.12)",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(230, 0, 38, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--red-crimson)" }}>
                      {uid.case_number}
                    </span>
                    <span className="forensic-badge badge-crimson" style={{ fontSize: "0.62rem", color: "#ffffff" }}>
                      {uid.water_body_type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {uid.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#f1f5f9", marginTop: "0.2rem" }}>
                    Recovered: {uid.recovery_date} • {uid.recovery_location_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
