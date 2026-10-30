import React, { useState } from "react";

// Tooth names for tooltip reference
const toothNames = {
  "18": "Upper Right 3rd Molar", "17": "Upper Right 2nd Molar", "16": "Upper Right 1st Molar",
  "15": "Upper Right 2nd Premolar", "14": "Upper Right 1st Premolar", "13": "Upper Right Canine",
  "12": "Upper Right Lateral Incisor", "11": "Upper Right Central Incisor",
  "21": "Upper Left Central Incisor", "22": "Upper Left Lateral Incisor", "23": "Upper Left Canine",
  "24": "Upper Left 1st Premolar", "25": "Upper Left 2nd Premolar", "26": "Upper Left 1st Molar",
  "27": "Upper Left 2nd Molar", "28": "Upper Left 3rd Molar",
  "48": "Lower Right 3rd Molar", "47": "Lower Right 2nd Molar", "46": "Lower Right 1st Molar",
  "45": "Lower Right 2nd Premolar", "44": "Lower Right 1st Premolar", "43": "Lower Right Canine",
  "42": "Lower Right Lateral Incisor", "41": "Lower Right Central Incisor",
  "31": "Lower Left Central Incisor", "32": "Lower Left Lateral Incisor", "33": "Lower Left Canine",
  "34": "Lower Left 1st Premolar", "35": "Lower Left 2nd Premolar", "36": "Lower Left 1st Molar",
  "37": "Lower Left 2nd Molar", "38": "Lower Left 3rd Molar"
};

const upperRow = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lowerRow = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

const statusColors = {
  intact: { bg: "rgba(230, 0, 38, 0.15)", border: "#ff4d6d", label: "Intact / Sound" },
  amalgam_filling: { bg: "rgba(120, 20, 30, 0.6)", border: "#f87171", label: "Amalgam (Silver)" },
  composite: { bg: "rgba(185, 28, 28, 0.45)", border: "#fca5a5", label: "Composite Restoration" },
  crown_ceramic: { bg: "rgba(255, 26, 60, 0.5)", border: "#ff1a3c", label: "Ceramic Crown" },
  crown_gold: { bg: "rgba(245, 158, 11, 0.45)", border: "#fbbf24", label: "Gold Crown" },
  implant: { bg: "rgba(153, 27, 27, 0.6)", border: "#f87171", label: "Titanium Implant" },
  rct: { bg: "rgba(220, 38, 38, 0.5)", border: "#ff4d6d", label: "Root Canal" },
  missing_antemortem: { bg: "rgba(25, 6, 10, 0.8)", border: "#7f1d1d", label: "Missing (Antemortem)" },
  missing_postmortem: { bg: "rgba(239, 68, 68, 0.35)", border: "#ef4444", label: "Missing (Post-Mortem Avulsion)" }
};

export default function OdontogramChart({ 
  dentalRecord = {}, 
  comparisonRecord = null, 
  isEditable = false, 
  onChange = null,
  title = "Forensic Odontology Odontogram (FDI Chart)" 
}) {
  const [selectedTooth, setSelectedTooth] = useState("16");

  const getToothDisplay = (toothNum) => {
    const status = dentalRecord[toothNum] || "intact";
    const compStatus = comparisonRecord ? (comparisonRecord[toothNum] || "intact") : null;
    
    // Check if comparison match or conflict
    let isMatch = false;
    let isConflict = false;
    
    if (comparisonRecord) {
      if (status === compStatus && status !== "intact") {
        isMatch = true;
      } else if (compStatus === "missing_antemortem" && status === "intact") {
        isConflict = true;
      }
    }

    const styleInfo = statusColors[status] || statusColors.intact;

    return {
      status,
      compStatus,
      isMatch,
      isConflict,
      bg: isConflict ? "rgba(239, 68, 68, 0.5)" : (isMatch ? "rgba(255, 26, 60, 0.45)" : styleInfo.bg),
      borderColor: isConflict ? "#ef4444" : (isMatch ? "#ff1a3c" : styleInfo.border),
      label: styleInfo.label
    };
  };

  const handleToothClick = (toothNum) => {
    setSelectedTooth(toothNum);
    if (isEditable && onChange) {
      const states = Object.keys(statusColors);
      const curr = dentalRecord[toothNum] || "intact";
      const nextIdx = (states.indexOf(curr) + 1) % states.length;
      const nextStatus = states[nextIdx];
      onChange({ ...dentalRecord, [toothNum]: nextStatus });
    }
  };

  return (
    <div className="forensic-card" style={{ padding: "1.25rem", border: "1px solid rgba(230, 0, 38, 0.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h4 style={{ fontSize: "1.05rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🦷</span> {title}
          </h4>
          <p style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
            {comparisonRecord 
              ? "Dual Antemortem vs Postmortem comparative analysis (Glowing Crimson: Concordance, Red: Anatomical Conflict)" 
              : isEditable ? "Click any tooth to cycle forensic conditions" : "Standard 32-tooth permanent dentition charting"}
          </p>
        </div>
        {selectedTooth && (
          <div style={{ textAlign: "right" }}>
            <span className="forensic-badge badge-crimson" style={{ fontFamily: "var(--font-mono)", color: "#ffffff" }}>
              Tooth #{selectedTooth}: {toothNames[selectedTooth]}
            </span>
          </div>
        )}
      </div>

      {/* Maxillary (Upper Arch) */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#ff4d6d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem", fontWeight: "700" }}>
          Maxillary Arch (Upper Dentition)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: "4px" }}>
          {upperRow.map((toothNum) => {
            const info = getToothDisplay(toothNum);
            const isSelected = selectedTooth === toothNum;
            return (
              <button
                key={toothNum}
                onClick={() => handleToothClick(toothNum)}
                style={{
                  background: info.bg,
                  border: `1.5px solid ${isSelected ? "var(--red-crimson)" : info.borderColor}`,
                  borderRadius: "6px",
                  padding: "0.5rem 0.2rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 0 12px rgba(255, 26, 60, 0.6)" : "none"
                }}
                title={`#${toothNum} - ${toothNames[toothNum]}: ${info.label}`}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#ffffff" }}>{toothNum}</span>
                <span style={{ fontSize: "0.58rem", marginTop: "2px" }}>
                  {info.status.includes("missing") ? "❌" : info.status.includes("crown") ? "👑" : info.status.includes("implant") ? "🔩" : "🦷"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandibular (Lower Arch) */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", color: "#ff4d6d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem", fontWeight: "700" }}>
          Mandibular Arch (Lower Dentition)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: "4px" }}>
          {lowerRow.map((toothNum) => {
            const info = getToothDisplay(toothNum);
            const isSelected = selectedTooth === toothNum;
            return (
              <button
                key={toothNum}
                onClick={() => handleToothClick(toothNum)}
                style={{
                  background: info.bg,
                  border: `1.5px solid ${isSelected ? "var(--red-crimson)" : info.borderColor}`,
                  borderRadius: "6px",
                  padding: "0.5rem 0.2rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 0 12px rgba(255, 26, 60, 0.6)" : "none"
                }}
                title={`#${toothNum} - ${toothNames[toothNum]}: ${info.label}`}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#ffffff" }}>{toothNum}</span>
                <span style={{ fontSize: "0.58rem", marginTop: "2px" }}>
                  {info.status.includes("missing") ? "❌" : info.status.includes("crown") ? "👑" : info.status.includes("implant") ? "🔩" : "🦷"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Odontology Legend */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        paddingTop: "0.75rem",
        borderTop: "1px solid rgba(230, 0, 38, 0.2)",
        fontSize: "0.75rem"
      }}>
        {Object.entries(statusColors).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              background: val.bg,
              border: `1px solid ${val.border}`
            }}></span>
            <span style={{ color: "#ffffff", fontWeight: "600" }}>{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
