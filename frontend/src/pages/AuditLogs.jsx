import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { History, ShieldCheck, Search, Filter, Lock, Terminal, Droplets } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({ limit: 100 });
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const matchesSearch = 
      (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === "ALL" ? true : log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={26} color="var(--red-crimson)" />
            <h2 style={{ fontSize: "1.55rem", color: "#ffffff", margin: 0 }}>
              Judicial Audit Trail & Security Ledger
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#f1f5f9", margin: "0.2rem 0 0" }}>
            Immutable forensic access log complying with ISO/IEC 27037 for digital evidence admissibility
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="forensic-badge badge-crimson" style={{ color: "#ffffff" }}>
            <ShieldCheck size={13} color="#ff4d6d" /> ISO/IEC 27037 Certified
          </span>
          <span className="forensic-badge badge-crimson" style={{ background: "rgba(185, 28, 28, 0.35)", color: "#ffffff" }}>
            <Lock size={13} color="#ffffff" /> Tamper-Proof Audit Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="forensic-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <Search size={16} color="#ff4d6d" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search officer email, case #, or action details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
            />
          </div>

          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.825rem", color: "#ffffff" }}
          >
            <option value="ALL">All Forensic Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="MATCH_ENGINE_RUN">AI Match Engine Executions</option>
            <option value="VERIFY_MATCH_DECISION">Inquest Review Decisions</option>
            <option value="EXPORT_FORENSIC_DOSSIER">Dossier Exports</option>
            <option value="UPLOAD_EVIDENCE">Evidence Uploads</option>
            <option value="CHAIN_OF_CUSTODY_TRANSFER">Custody Transfers</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="forensic-card" style={{ padding: 0, overflow: "hidden", borderTop: "3px solid var(--red-crimson)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
            <thead style={{ background: "rgba(15, 4, 7, 0.98)", borderBottom: "1px solid var(--border-color)", color: "#ffffff" }}>
              <tr>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>Timestamp (UTC)</th>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>Action</th>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>Officer / System</th>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>Resource</th>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>Details</th>
                <th style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>IP / Node</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                let badgeStyle = "badge-crimson";
                return (
                  <tr 
                    key={log.id}
                    style={{ borderBottom: "1px solid rgba(230, 0, 38, 0.12)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(230, 0, 38, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "0.85rem 1.25rem", fontFamily: "var(--font-mono)", color: "#fca5a5", whiteSpace: "nowrap", fontWeight: "600" }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem" }}>
                      <span className={`forensic-badge ${badgeStyle}`} style={{ fontSize: "0.68rem", color: "#ffffff" }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#ffffff", fontWeight: "700" }}>
                      {log.user_email}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", fontFamily: "var(--font-mono)", color: "var(--red-crimson)", fontWeight: "700" }}>
                      {log.resource_id || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#ffffff" }}>
                      {log.details}
                    </td>
                    <td style={{ padding: "0.85rem 1.25rem", fontFamily: "var(--font-mono)", color: "#f1f5f9", fontSize: "0.75rem" }}>
                      {log.ip_address}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
