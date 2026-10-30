import React from "react";
import { X, Printer, Shield, CheckCircle } from "lucide-react";

export default function ForensicReportModal({ dossierData, onClose }) {
  if (!dossierData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: "920px", 
          background: "#ffffff", 
          color: "#0f172a", 
          padding: "2.5rem",
          borderRadius: "8px",
          border: "2px solid #0284c7"
        }}
      >
        {/* Print & Close Controls (Hidden when printing) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }} className="no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0369a1", textTransform: "uppercase" }}>
              Official Identification Dossier Preview
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem", color: "#334155" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Official Header */}
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <img src="/logo.jpg" alt="NyayaAI" style={{ width: "48px", height: "48px", borderRadius: "6px" }} />
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  NYAYAAI FORENSIC IDENTIFICATION BUREAU
                </h2>
                <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0, fontWeight: "600" }}>
                  DIRECTORATE OF FORENSIC SCIENCE SERVICES • WATER RECOVERY IDENTIFICATION UNIT
                </p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
            <div style={{ fontWeight: "700", color: "#0369a1" }}>{dossierData.report_id}</div>
            <div style={{ color: "#64748b" }}>Date: {dossierData.generated_at}</div>
            <div style={{ color: "#16a34a", fontWeight: "600" }}>CONFIDENTIAL / JUDICIAL USE</div>
          </div>
        </div>

        {/* Case Matching Overview Table */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* UID */}
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "1rem", background: "#f8fafc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Post-Mortem Record (Unidentified Deceased)
            </div>
            <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0", width: "40%" }}>Case Number:</td>
                  <td style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{dossierData.case_overview.uid_case_number}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Recovery Date:</td>
                  <td>{dossierData.case_overview.recovery_date}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Water Recovery Site:</td>
                  <td>{dossierData.case_overview.recovery_site}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Immersion Condition:</td>
                  <td style={{ fontWeight: "600", color: "#0369a1" }}>{dossierData.case_overview.immersion_stage}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Estimated PMI:</td>
                  <td>{dossierData.case_overview.estimated_pmi}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MP */}
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "1rem", background: "#f8fafc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Antemortem Record (Missing Person)
            </div>
            <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0", width: "40%" }}>Case Number:</td>
                  <td style={{ fontWeight: "700", fontFamily: "var(--font-mono)" }}>{dossierData.missing_person_profile.mp_case_number}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Full Name:</td>
                  <td style={{ fontWeight: "700" }}>{dossierData.missing_person_profile.full_name}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Date Disappeared:</td>
                  <td>{dossierData.missing_person_profile.disappearance_date}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Last Seen Area:</td>
                  <td>{dossierData.missing_person_profile.last_seen}</td>
                </tr>
                <tr>
                  <td style={{ color: "#64748b", padding: "3px 0" }}>Police Station:</td>
                  <td>{dossierData.missing_person_profile.reporting_station}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Modal Score Table */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            Multi-Modal Forensic Indicator Concordance Evaluation
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem", border: "1px solid #cbd5e1" }}>
            <thead style={{ background: "#f1f5f9", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Forensic Discipline</th>
                <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Concordance Score</th>
                <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Weight Allocation</th>
                <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Status / Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "600" }}>DNA STR Profile (16 Loci)</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>{dossierData.scoring_summary.dna_score}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>35%</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>High discriminatory power</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "600" }}>Forensic Odontology (FDI Matrix)</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>{dossierData.scoring_summary.dental_score}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>30%</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Restorations & crowns verified</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "600" }}>Distinctive Tattoos / Implants</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>{dossierData.scoring_summary.distinctive_score}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>15%</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>NLP semantic concordance</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "600" }}>Temporal & Geospatial Flow</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>{dossierData.scoring_summary.temporal_geo_score}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>10%</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Consistent with river drift</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "600" }}>Physical & Stature Overlap</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>{dossierData.scoring_summary.physical_score}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>10%</td>
                <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Stature & age interval match</td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td style={{ padding: "10px 12px", border: "1px solid #cbd5e1", fontWeight: "800" }}>COMPOSITE CONFIDENCE SCORE</td>
                <td style={{ padding: "10px 12px", border: "1px solid #cbd5e1", fontWeight: "800", fontSize: "1.05rem", color: "#0284c7" }}>
                  {dossierData.scoring_summary.overall_score}
                </td>
                <td colSpan={2} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", fontWeight: "700", color: "#16a34a" }}>
                  {dossierData.scoring_summary.confidence_level}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Findings & Pathologist Action Guidance */}
        <div style={{ border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "6px", padding: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.35rem" }}>
            CHIEF PATHOLOGIST & INVESTIGATOR EVALUATION:
          </div>
          <p style={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.5, margin: 0 }}>
            {dossierData.explainable_findings.pathologist_guidance}
          </p>
        </div>

        {/* Verification Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px dashed #94a3b8" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: "40px" }}></div>
            <div style={{ borderTop: "1px solid #0f172a", paddingTop: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
              {dossierData.authorizing_officer.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{dossierData.authorizing_officer.role}</div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Badge: {dossierData.authorizing_officer.badge}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: "40px" }}></div>
            <div style={{ borderTop: "1px solid #0f172a", paddingTop: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
              Dr. Suresh Kumar, MDS
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Forensic Odontologist</div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>State Odontology Bureau</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: "40px" }}></div>
            <div style={{ borderTop: "1px solid #0f172a", paddingTop: "4px", fontSize: "0.75rem", fontWeight: "700" }}>
              Judicial Magistrate / Coroner
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Inquest Jurisdiction</div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Seal & Certification</div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div style={{ marginTop: "1.5rem", paddingTop: "0.75rem", borderTop: "1px solid #cbd5e1", fontSize: "0.65rem", color: "#64748b", textAlign: "justify" }}>
          <strong>STATUTORY NOTICE:</strong> {dossierData.legal_statutory_disclaimer}
        </div>
      </div>
    </div>
  );
}
