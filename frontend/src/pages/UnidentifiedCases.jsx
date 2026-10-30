import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  UserX, 
  Search, 
  Waves, 
  Calendar, 
  MapPin, 
  Fingerprint, 
  Dna, 
  Smile, 
  Sparkles, 
  FileText,
  Filter,
  Droplets
} from "lucide-react";

export default function UnidentifiedCases({ onSelectCase, onRunMatch, onNewCase }) {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [waterFilter, setWaterFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getUIDCases();
      setCases(data);
    } catch (err) {
      console.error("Failed to load UID cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter((c) => {
    const matchesSearch = 
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.recovery_location_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.distinguishing_marks && c.distinguishing_marks.toLowerCase().includes(search.toLowerCase()));

    const matchesWater = 
      waterFilter === "ALL" ? true :
      waterFilter === "WATER_ONLY" ? c.water_body_type !== "None" :
      c.water_body_type.toLowerCase() === waterFilter.toLowerCase();

    return matchesSearch && matchesWater;
  });

  return (
    <div className="page-content">
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Droplets size={24} color="var(--red-crimson)" />
            <h2 style={{ fontSize: "1.55rem", color: "#ffffff", margin: 0 }}>
              Unidentified Deceased (UID) Cases
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#f1f5f9", margin: "0.2rem 0 0" }}>
            Post-mortem profiles, aquatic decomposition tracking, and forensic evidence records
          </p>
        </div>

        <button onClick={onNewCase} className="btn btn-primary">
          <span style={{ color: "#ffffff" }}>+ Register New UID Body</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="forensic-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <Search size={16} color="#ff4d6d" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search case #, location, river name, tattoos, surgical implants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Filter size={14} color="#ff4d6d" />
            <select
              className="form-select"
              value={waterFilter}
              onChange={(e) => setWaterFilter(e.target.value)}
              style={{ width: "auto", fontSize: "0.825rem", color: "#ffffff" }}
            >
              <option value="ALL">All Environments</option>
              <option value="WATER_ONLY">All Aquatic Recoveries</option>
              <option value="River">River Cases</option>
              <option value="Canal">Canal Cases</option>
              <option value="Lake">Lake Cases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((c) => {
          return (
            <div
              key={c.id}
              className="forensic-card"
              style={{
                display: "flex",
                flexDirection: "column",
                borderTop: "3px solid var(--red-crimson)"
              }}
            >
              <div className="card-header" style={{ padding: "1rem 1.25rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--red-crimson)" }}>
                      {c.case_number}
                    </span>
                    <span className="forensic-badge badge-crimson" style={{ fontSize: "0.65rem", color: "#ffffff" }}>
                      {c.water_body_type}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
                    Recovered: {c.recovery_date}
                  </div>
                </div>

                <span className="forensic-badge badge-crimson" style={{ fontSize: "0.68rem", color: "#ffffff" }}>
                  {c.status}
                </span>
              </div>

              <div className="card-body" style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h4 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                  {c.title}
                </h4>

                <div style={{ fontSize: "0.78rem", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  <MapPin size={13} color="var(--red-crimson)" />
                  <span>{c.recovery_location_name}</span>
                </div>

                {/* Aquatic Indicator Box */}
                <div style={{
                  background: "rgba(18, 5, 8, 0.8)",
                  border: "1px solid rgba(230, 0, 38, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.65rem",
                  fontSize: "0.78rem",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{ color: "#ff4d6d", fontWeight: "700", fontSize: "0.7rem", marginBottom: "0.2rem" }}>
                    DECOMPOSITION STAGE:
                  </div>
                  <div style={{ color: "#ffffff", fontWeight: "600" }}>{c.immersion_stage}</div>
                  <div style={{ color: "#fca5a5", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                    Estimated PMI: {c.estimated_pmi_min_days} - {c.estimated_pmi_max_days} Days
                  </div>
                </div>

                {/* Physical Indicators & Marks */}
                <div style={{ fontSize: "0.8rem", color: "#ffffff", marginBottom: "1rem", flex: 1 }}>
                  <strong style={{ color: "#ff4d6d" }}>Marks / Tattoos:</strong> {c.distinguishing_marks || "None noted in initial triage."}
                </div>

                {/* Action Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(230, 0, 38, 0.15)" }}>
                  <button 
                    onClick={() => onSelectCase(c.id)} 
                    className="btn btn-secondary" 
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", color: "#ffffff" }}
                  >
                    <FileText size={13} /> Case Details
                  </button>

                  <button 
                    onClick={() => onRunMatch(c.id)} 
                    className="btn btn-primary" 
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                  >
                    <Sparkles size={13} /> Run AI Match
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
