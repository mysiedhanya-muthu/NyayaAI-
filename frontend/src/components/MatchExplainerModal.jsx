import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Dna, 
  Smile, 
  MapPin, 
  Calendar, 
  Fingerprint, 
  FileCheck2, 
  UserCheck, 
  Printer, 
  Info,
  CheckCircle2,
  XCircle,
  Droplets
} from "lucide-react";
import OdontogramChart from "./OdontogramChart";
import DnaMarkerMatrix from "./DnaMarkerMatrix";

export default function MatchExplainerModal({ matchDetail, onClose, onReview, onPrintDossier }) {
  if (!matchDetail) return null;

  const { match, uid_case, mp_record, dental_comparison, dna_comparison } = matchDetail;
  const explanation = match.explanation || {};
  const [activeTab, setActiveTab] = useState("breakdown");
  const [reviewAction, setReviewAction] = useState("Confirmed Match");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await onReview(match.id, reviewAction, reviewNotes || `Reviewed by authorized officer as ${reviewAction}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#ff1a3c";
    if (score >= 60) return "#ff758c";
    return "#dc2626";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: "1050px", border: "1px solid rgba(255, 26, 60, 0.5)", background: "rgba(10, 3, 5, 0.98)" }}
      >
        {/* Header */}
        <div className="card-header" style={{ background: "rgba(15, 4, 7, 0.98)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="forensic-badge badge-crimson" style={{ fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                MATCH #{match.id}
              </span>
              <span className="forensic-badge badge-crimson" style={{ background: "rgba(230, 0, 38, 0.35)", border: "1px solid #ff1a3c", color: "#ffffff" }}>
                {match.confidence_level} ({match.overall_score}%)
              </span>
              <span className="forensic-badge badge-purple" style={{ color: "#ffffff" }}>
                Status: {match.status}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", marginTop: "0.35rem", color: "#ffffff" }}>
              Explainable AI Forensic Dossier: {uid_case?.case_number} ⇄ {mp_record?.case_number}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1.5rem",
          background: "rgba(18, 5, 8, 0.85)",
          borderBottom: "1px solid rgba(230, 0, 38, 0.25)"
        }}>
          {[
            { id: "breakdown", label: "Multi-Modal AI Breakdown", icon: Info },
            { id: "dental", label: "Odontology Comparison", icon: Smile },
            { id: "dna", label: "STR DNA Loci Grid", icon: Dna },
            { id: "review", label: "Inquest Decision & Review", icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
              >
                <Icon size={14} color="#ffffff" />
                <span style={{ color: "#ffffff" }}>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => onPrintDossier(match.id)}
            className="btn btn-primary"
            style={{ marginLeft: "auto", fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
          >
            <Printer size={14} color="#ffffff" />
            <span style={{ color: "#ffffff" }}>Generate Official Dossier</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="card-body">
          {activeTab === "breakdown" && (
            <div>
              {/* Summary Banner with Blood Red Ambiance */}
              <div style={{
                background: "linear-gradient(135deg, rgba(230, 0, 38, 0.22), rgba(70, 5, 12, 0.45))",
                border: "1px solid rgba(255, 26, 60, 0.5)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                boxShadow: "0 4px 20px rgba(230, 0, 38, 0.25)"
              }}>
                <ShieldCheck size={28} color="var(--red-crimson)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <h4 style={{ fontSize: "1.05rem", color: "#ffffff", marginBottom: "0.25rem" }}>
                    {explanation.summary || "Forensic Identification Match Matrix"}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#ffffff", lineHeight: 1.5 }}>
                    {explanation.pathologist_guidance}
                  </p>
                  {explanation.water_condition_note && (
                    <div style={{ fontSize: "0.78rem", color: "#ff4d6d", marginTop: "0.5rem", fontWeight: "600" }}>
                      🩸 <strong>Aquatic Indicator:</strong> {explanation.water_condition_note}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Modal Scoring Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { name: "DNA STR Concordance", score: match.dna_score, icon: Dna, desc: "16-loci electropherogram alignment" },
                  { name: "Forensic Odontology", score: match.dental_score, icon: Smile, desc: "32-tooth restoration & extraction matrix" },
                  { name: "Distinctive Markers & Tattoos", score: match.distinctive_score, icon: Fingerprint, desc: "NLP semantic scan of scars, hardware & tattoos" },
                  { name: "Temporal & River Drift Flow", score: match.temporal_geo_score, icon: Calendar, desc: "PMI vs disappearance date & river drift radius" },
                  { name: "Physical & Anthropological", score: match.physical_score, icon: UserCheck, desc: "Sex, stature overlap & estimated osteological age" },
                  { 
                    name: "Fingerprint Friction Ridges", 
                    score: match.fingerprint_score !== null ? match.fingerprint_score : "Bypassed", 
                    icon: Fingerprint, 
                    desc: match.fingerprint_score === null ? "Degraded by water maceration; weights shifted to DNA & Odontology" : "Minutiae match score" 
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const isBypassed = item.score === "Bypassed";
                  const numScore = isBypassed ? 0 : Number(item.score);
                  return (
                    <div 
                      key={idx}
                      style={{
                        background: "rgba(18, 5, 8, 0.85)",
                        border: "1px solid rgba(230, 0, 38, 0.3)",
                        borderRadius: "var(--radius-md)",
                        padding: "1rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Icon size={16} color="var(--red-crimson)" />
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff" }}>{item.name}</span>
                        </div>
                        <span style={{ 
                          fontSize: "1rem", 
                          fontWeight: "800", 
                          fontFamily: "var(--font-mono)", 
                          color: isBypassed ? "#ff758c" : getScoreColor(numScore) 
                        }}>
                          {isBypassed ? "DEGRADED" : `${numScore}%`}
                        </span>
                      </div>
                      <div className="progress-bar-container" style={{ marginBottom: "0.5rem" }}>
                        <div 
                          className="progress-bar-fill progress-fill-high" 
                          style={{ width: isBypassed ? "100%" : `${numScore}%`, background: isBypassed ? "rgba(245, 158, 11, 0.4)" : undefined }}
                        />
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#f1f5f9" }}>{item.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Concordance and Discrepancies Columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {/* Positive Concordances */}
                <div style={{
                  background: "rgba(185, 28, 28, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <CheckCircle2 size={16} color="var(--red-crimson)" />
                    <h5 style={{ fontSize: "0.88rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "800" }}>
                      Forensic Concordances ({explanation.positive_concordances?.length || 0})
                    </h5>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {(explanation.positive_concordances || []).map((note, i) => (
                      <li key={i} style={{ fontSize: "0.82rem", color: "#ffffff", display: "flex", gap: "0.5rem" }}>
                        <span style={{ color: "var(--red-crimson)", fontWeight: "700" }}>✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Discrepancies & Caution Flags */}
                <div style={{
                  background: "rgba(127, 29, 29, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <AlertTriangle size={16} color="#ff4d6d" />
                    <h5 style={{ fontSize: "0.88rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "800" }}>
                      Anomalies & Pathology Cautions ({explanation.identified_discrepancies?.length || 0})
                    </h5>
                  </div>
                  {(explanation.identified_discrepancies?.length || 0) === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "#ffffff" }}>
                      No anatomical or genetic exclusionary conflicts identified.
                    </p>
                  ) : (
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {explanation.identified_discrepancies.map((disc, i) => (
                        <li key={i} style={{ fontSize: "0.82rem", color: "#fca5a5", display: "flex", gap: "0.5rem" }}>
                          <span>⚠️</span>
                          <span>{disc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "dental" && (
            <OdontogramChart 
              dentalRecord={dental_comparison.uid} 
              comparisonRecord={dental_comparison.mp} 
              title="Forensic Odontology Comparison (UID Postmortem vs MP Antemortem Records)"
            />
          )}

          {activeTab === "dna" && (
            <DnaMarkerMatrix 
              uidProfile={dna_comparison.uid} 
              mpProfile={dna_comparison.mp}
              title="Electropherogram STR Concordance Matrix (UID vs MP Reference Sample)"
            />
          )}

          {activeTab === "review" && (
            <form onSubmit={handleReviewSubmit}>
              <div style={{
                background: "rgba(18, 5, 8, 0.8)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                marginBottom: "1.25rem"
              }}>
                <h4 style={{ fontSize: "1.05rem", color: "#ffffff", marginBottom: "0.5rem" }}>
                  Official Forensic Inquest Review & Judicial Certification
                </h4>
                <p style={{ fontSize: "0.82rem", color: "#f1f5f9", marginBottom: "1rem" }}>
                  Record expert review determination in the immutable audit log under statutory evidence provisions.
                </p>

                <div className="form-group">
                  <label className="form-label">Review Determination</label>
                  <select 
                    className="form-select"
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                  >
                    <option value="Confirmed Match">Confirmed Match (Ready for Inquest & Family Notification)</option>
                    <option value="Inconclusive / Request DNA Confirmation">Inconclusive (Request Direct Kinship DNA / Additional X-Ray)</option>
                    <option value="Rejected Match">Rejected Match (Exclusionary Evidence Found)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pathologist / Investigator Justification Notes</label>
                  <textarea 
                    className="form-textarea" 
                    rows={4}
                    placeholder="Enter formal justification, reference to radiographs, or additional testing requests..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    <FileCheck2 size={16} />
                    <span>{submittingReview ? "Submitting..." : "Submit Official Determination"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
