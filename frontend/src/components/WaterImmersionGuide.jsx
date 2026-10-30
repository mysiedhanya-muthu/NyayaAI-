import React from "react";
import { X, Waves, Compass, Sparkles, BookOpen, Clock, Activity, ShieldAlert, Droplets } from "lucide-react";

export default function WaterImmersionGuide({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: "980px", border: "1px solid var(--red-crimson)", background: "rgba(10, 3, 5, 0.98)" }}
      >
        <div className="card-header" style={{ background: "rgba(16, 5, 8, 0.98)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Droplets size={24} color="var(--red-crimson)" />
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#ffffff" }}>
                Forensic Hematology & Aquatic Victim Identification Guide (Casper's Dictum)
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#f1f5f9", margin: 0 }}>
                Protocol guide for deceased victims recovered from rivers, lakes, canals, and reservoirs
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div className="card-body">
          {/* Banner Image */}
          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(230, 0, 38, 0.4)" }}>
            <img 
              src="/forensic_workflow.jpg" 
              alt="Forensic Science Laboratory" 
              style={{ width: "100%", height: "250px", objectFit: "cover" }} 
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(7, 2, 4, 0.95) 0%, transparent 60%)",
              display: "flex",
              alignItems: "flex-end",
              padding: "1rem 1.5rem"
            }}>
              <div>
                <span className="forensic-badge badge-crimson" style={{ marginBottom: "0.25rem", color: "#ffffff" }}>
                  🩸 Forensic Hematology & Biometrics
                </span>
                <h4 style={{ fontSize: "1.15rem", color: "#ffffff" }}>
                  Overcoming Fingerprint Degradation Through Blood, STR DNA & Odontology Synthesis
                </h4>
              </div>
            </div>
          </div>

          {/* Casper's Dictum Box */}
          <div style={{
            background: "linear-gradient(135deg, rgba(230, 0, 38, 0.2), rgba(120, 10, 20, 0.35))",
            border: "1px solid rgba(255, 26, 60, 0.5)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem"
          }}>
            <h4 style={{ fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <Clock size={16} color="var(--red-crimson)" /> Casper's Dictum (Decomposition Rate in Aquatic Environments)
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#ffffff", lineHeight: 1.5 }}>
              In forensic pathology, <strong>Casper's Dictum</strong> states that a body decomposes at approximately the same rate in:
              <br />
              <span style={{ fontFamily: "var(--font-mono)", color: "#ff4d6d", display: "block", margin: "0.4rem 0", fontSize: "0.95rem", fontWeight: "700" }}>
                1 Week in Air ≈ 2 Weeks in Water ≈ 8 Weeks Underground
              </span>
              Because aquatic immersion impedes aerobic bacterial decomposition while promoting water maceration and epidermal detachment, visual facial identification and conventional fingerprint ink rolling typically fail within 48 to 96 hours.
            </p>
          </div>

          {/* 4 Stages Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(18, 5, 8, 0.8)", border: "1px solid rgba(230, 0, 38, 0.3)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#ff4d6d", fontWeight: "800", marginBottom: "0.25rem" }}>STAGE 1 (1 - 3 DAYS)</div>
              <h5 style={{ fontSize: "0.9rem", color: "#ffffff", marginBottom: "0.5rem" }}>Washerwoman Maceration</h5>
              <p style={{ fontSize: "0.78rem", color: "#f1f5f9", lineHeight: 1.4 }}>
                Skin on fingers and palms becomes pale, wrinkled, and saturated. Fingerprint scanning begins to degrade.
              </p>
            </div>

            <div style={{ background: "rgba(18, 5, 8, 0.8)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#fed7aa", fontWeight: "800", marginBottom: "0.25rem" }}>STAGE 2 (3 - 7 DAYS)</div>
              <h5 style={{ fontSize: "0.9rem", color: "#ffffff", marginBottom: "0.5rem" }}>Bloating & Epidermal Glove</h5>
              <p style={{ fontSize: "0.78rem", color: "#f1f5f9", lineHeight: 1.4 }}>
                Putrefactive gases cause body to rise to surface (floatation). Epidermis sloughs off like a loose glove. Standard fingerprinting completely fails.
              </p>
            </div>

            <div style={{ background: "rgba(18, 5, 8, 0.8)", border: "1px solid rgba(181, 23, 158, 0.4)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#f72585", fontWeight: "800", marginBottom: "0.25rem" }}>STAGE 3 (1 - 3 WEEKS)</div>
              <h5 style={{ fontSize: "0.9rem", color: "#ffffff", marginBottom: "0.5rem" }}>Saponification / Adipocere</h5>
              <p style={{ fontSize: "0.78rem", color: "#f1f5f9", lineHeight: 1.4 }}>
                Subcutaneous fat converts into grave-wax (adipocere). Soft tissue becomes soapy. Dental enamel and orthopedic implants remain pristine!
              </p>
            </div>

            <div style={{ background: "rgba(18, 5, 8, 0.8)", border: "1px solid rgba(239, 68, 68, 0.5)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#ff4d6d", fontWeight: "800", marginBottom: "0.25rem" }}>STAGE 4 (&gt; 3 WEEKS)</div>
              <h5 style={{ fontSize: "0.9rem", color: "#ffffff", marginBottom: "0.5rem" }}>Skeletonization</h5>
              <p style={{ fontSize: "0.78rem", color: "#f1f5f9", lineHeight: 1.4 }}>
                Aquatic currents and fauna expose bone. Deep femur marrow provides clean STR DNA; jaws provide definitive odontogram matching.
              </p>
            </div>
          </div>

          {/* How NyayaAI Solves It */}
          <div style={{ background: "rgba(230, 0, 38, 0.12)", border: "1px solid rgba(255, 26, 60, 0.4)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
            <h4 style={{ fontSize: "1rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Sparkles size={16} color="var(--red-crimson)" /> How NyayaAI Solves Water-Immersion Identification
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.825rem", color: "#ffffff" }}>
              <div>
                <strong style={{ color: "#ff4d6d" }}>1. Dynamic Degradation Re-Weighting:</strong> When water maceration makes fingerprints unavailable, the algorithm automatically redistributes decision weight to DNA STR loci (35%) and Dental Odontology (30%).
              </div>
              <div>
                <strong style={{ color: "#ff4d6d" }}>2. Hydrological River Flow Analysis:</strong> Uses Haversine drift radius from last-seen bridges/embankments to recovery barrages.
              </div>
              <div>
                <strong style={{ color: "#ff4d6d" }}>3. Odontology Resilience:</strong> Enamel is the hardest biological substance, withstanding water and currents for years.
              </div>
              <div>
                <strong style={{ color: "#ff4d6d" }}>4. Explainable AI for Inquests:</strong> Instead of a black-box answer, NyayaAI provides clear evidence breakdowns to empower the investigating officer and magistrate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
