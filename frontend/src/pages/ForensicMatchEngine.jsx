import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Cpu, 
  Sparkles, 
  Waves, 
  Dna, 
  Smile, 
  Calendar, 
  Fingerprint, 
  ArrowRight, 
  FileText, 
  Printer, 
  ShieldCheck, 
  AlertTriangle,
  RotateCw,
  Droplets
} from "lucide-react";

export default function ForensicMatchEngine({ onSelectMatch, onPrintDossier }) {
  const [uids, setUids] = useState([]);
  const [selectedUidId, setSelectedUidId] = useState("");
  const [selectedUidCase, setSelectedUidCase] = useState(null);
  const [matches, setMatches] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterConfidence, setFilterConfidence] = useState("ALL");

  useEffect(() => {
    loadUIDs();
  }, []);

  const loadUIDs = async () => {
    try {
      setLoading(true);
      const data = await api.getUIDCases();
      setUids(data);
      if (data.length > 0) {
        setSelectedUidId(data[0].id);
        setSelectedUidCase(data[0]);
        loadMatchesForUID(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load UIDs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseChange = async (uidId) => {
    setSelectedUidId(uidId);
    const c = uids.find(u => String(u.id) === String(uidId));
    setSelectedUidCase(c || null);
    await loadMatchesForUID(uidId);
  };

  const loadMatchesForUID = async (uidId) => {
    try {
      const allMatches = await api.getMatches();
      const filtered = allMatches.filter(m => String(m.uid_id) === String(uidId));
      filtered.sort((a, b) => b.overall_score - a.overall_score);
      setMatches(filtered);
    } catch (err) {
      console.error("Failed to load matches for UID:", err);
    }
  };

  const runEvaluation = async () => {
    if (!selectedUidId) return;
    try {
      setRunning(true);
      await api.runMatching(selectedUidId);
      await loadMatchesForUID(selectedUidId);
    } catch (err) {
      alert("Error evaluating matches: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const displayedMatches = matches.filter(m => {
    if (filterConfidence === "ALL") return true;
    if (filterConfidence === "HIGH") return m.overall_score >= 80;
    if (filterConfidence === "MODERATE") return m.overall_score >= 60 && m.overall_score < 80;
    if (filterConfidence === "LOW") return m.overall_score < 60;
    return true;
  });

  return (
    <div className="page-content">
      {/* Title & Selector Bar */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem 2rem",
        marginBottom: "1.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.25rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Droplets size={22} color="var(--red-crimson)" />
            <h2 style={{ fontSize: "1.45rem", color: "#ffffff", margin: 0 }}>
              AI Multi-Modal Forensic Matching Engine
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#f1f5f9", margin: 0 }}>
            Dynamic weighting for decomposed water recoveries: STR DNA • Odontology • Tattoos • Temporal Drift
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ minWidth: "280px" }}>
            <label className="form-label" style={{ fontSize: "0.72rem", marginBottom: "0.2rem", color: "#ffffff" }}>Target Case (Unidentified Body)</label>
            <select
              className="form-select"
              value={selectedUidId}
              onChange={(e) => handleCaseChange(e.target.value)}
              style={{ fontWeight: "700", fontSize: "0.85rem", color: "#ffffff" }}
            >
              {uids.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.case_number} – {u.water_body_type} ({u.immersion_stage.split("&")[0].split(",")[0]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runEvaluation}
            disabled={running}
            className="btn btn-primary pulse-glow"
            style={{ height: "42px", marginTop: "1rem", whiteSpace: "nowrap" }}
          >
            {running ? <RotateCw className="spin" size={16} /> : <Sparkles size={16} color="#ffffff" />}
            <span style={{ color: "#ffffff" }}>{running ? "Evaluating Matrix..." : "Execute AI Matching Engine"}</span>
          </button>
        </div>
      </div>

      {/* Selected UID Case Details Card */}
      {selectedUidCase && (
        <div className="forensic-card" style={{ marginBottom: "1.75rem", borderLeft: "4px solid var(--red-crimson)" }}>
          <div className="card-header" style={{ padding: "1rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.05rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--red-crimson)" }}>
                {selectedUidCase.case_number}
              </span>
              <span className="forensic-badge badge-crimson" style={{ color: "#ffffff" }}>
                {selectedUidCase.water_body_type} Recovery
              </span>
              <span className="forensic-badge badge-amber" style={{ color: "#ffffff" }}>
                PMI: {selectedUidCase.estimated_pmi_min_days} - {selectedUidCase.estimated_pmi_max_days} Days
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
              Recovered: {selectedUidCase.recovery_date} • {selectedUidCase.recovery_location_name}
            </div>
          </div>
          <div className="card-body" style={{ padding: "1rem 1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "1.5rem", fontSize: "0.825rem" }}>
              <div>
                <div style={{ marginBottom: "0.4rem" }}>
                  <strong style={{ color: "#ffffff" }}>Physical Indicators & Tattoos:</strong>{" "}
                  <span style={{ color: "#f1f5f9" }}>{selectedUidCase.distinguishing_marks || "None reported"}</span>
                </div>
                <div>
                  <strong style={{ color: "#ffffff" }}>Clothing & Belongings:</strong>{" "}
                  <span style={{ color: "#f1f5f9" }}>{selectedUidCase.clothing_effects || "None"}</span>
                </div>
              </div>
              <div style={{ background: "rgba(18, 5, 8, 0.75)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(230, 0, 38, 0.3)" }}>
                <div style={{ color: "#ff4d6d", fontWeight: "700", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  AQUATIC DECOMPOSITION STATUS:
                </div>
                <div style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: "600" }}>{selectedUidCase.immersion_stage}</div>
                <div style={{ fontSize: "0.72rem", color: "#fca5a5", marginTop: "0.25rem" }}>
                  Fingerprint Status: {selectedUidCase.fingerprint_status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { id: "ALL", label: `All Candidates (${matches.length})` },
            { id: "HIGH", label: `High Leads ≥80% (${matches.filter(m => m.overall_score >= 80).length})` },
            { id: "MODERATE", label: `Moderate 60-79% (${matches.filter(m => m.overall_score >= 60 && m.overall_score < 80).length})` },
            { id: "LOW", label: `Low <60% (${matches.filter(m => m.overall_score < 60).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterConfidence(tab.id)}
              className={`btn ${filterConfidence === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.85rem", color: "#ffffff" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid / List */}
      {displayedMatches.length === 0 ? (
        <div className="forensic-card" style={{ padding: "3rem", textAlign: "center" }}>
          <AlertTriangle size={36} color="var(--red-crimson)" style={{ margin: "0 auto 0.75rem" }} />
          <h4 style={{ fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.35rem" }}>
            No Matching Candidates Under Current Filter
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#f1f5f9", marginBottom: "1rem" }}>
            Click "Execute AI Matching Engine" above to analyze active missing persons against this case.
          </p>
          <button onClick={runEvaluation} className="btn btn-primary">
            <Sparkles size={16} /> Run Evaluation Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {displayedMatches.map((m) => {
            const isHigh = m.overall_score >= 80;
            const scoreColor = isHigh ? "var(--red-crimson)" : "#ff758c";

            return (
              <div 
                key={m.id}
                className="forensic-card"
                style={{
                  padding: "1.25rem 1.5rem",
                  borderLeft: `4px solid ${scoreColor}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "#ffffff" }}>
                        {m.mp_name}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--red-crimson)", fontWeight: "700" }}>
                        ({m.mp_case_number})
                      </span>
                      <span className="forensic-badge badge-crimson" style={{ color: "#ffffff" }}>
                        {m.confidence_level}
                      </span>
                      <span className="forensic-badge badge-purple" style={{ fontSize: "0.65rem", color: "#ffffff" }}>
                        Status: {m.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#f1f5f9" }}>
                      Age: {m.mp_age} • Sex: {m.mp_sex} • Disappeared: {m.mp_disappearance_date || "Recorded"}
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.95rem", fontWeight: "900", fontFamily: "var(--font-heading)", color: scoreColor, lineHeight: 1 }}>
                      {m.overall_score}%
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                      Composite Likelihood
                    </div>
                  </div>
                </div>

                {/* Sub-Attribute Score Tiles */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
                  gap: "0.65rem", 
                  marginBottom: "1.25rem",
                  background: "rgba(18, 5, 8, 0.7)",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(230, 0, 38, 0.25)"
                }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: "700" }}>DNA STR (16 Loci)</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                      {m.dna_score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: "700" }}>Odontology (Teeth)</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                      {m.dental_score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: "700" }}>Tattoos / Implants</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                      {m.distinctive_score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: "700" }}>Temporal & River Drift</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                      {m.temporal_geo_score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#fca5a5", fontWeight: "700" }}>Stature / Sex Profile</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>
                      {m.physical_score}%
                    </div>
                  </div>
                </div>

                {/* Pathologist Notes & Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "#ffffff", maxWidth: "600px" }}>
                    <span style={{ color: "var(--red-crimson)", fontWeight: "800" }}>Explainability Summary:</span> {m.explanation_summary || "Multi-attribute concordance verified across antemortem and postmortem records."}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => onSelectMatch(m.id)}
                      className="btn btn-primary"
                      style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}
                    >
                      <Sparkles size={14} />
                      <span>Deep Dive & Explainability</span>
                    </button>
                    <button
                      onClick={() => onPrintDossier(m.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
                    >
                      <Printer size={14} />
                      <span>Print Dossier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
