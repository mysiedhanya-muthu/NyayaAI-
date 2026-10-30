import React from "react";
import { Dna, CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";

export default function DnaMarkerMatrix({ uidProfile = {}, mpProfile = {}, title = "Forensic STR DNA Electropherogram Concordance" }) {
  const allLoci = Array.from(new Set([...Object.keys(uidProfile || {}), ...Object.keys(mpProfile || {})]));

  if (allLoci.length === 0) {
    return (
      <div className="forensic-card" style={{ padding: "1.25rem", textAlign: "center" }}>
        <Dna size={28} color="var(--red-crimson)" style={{ margin: "0 auto 0.5rem" }} />
        <h4 style={{ fontSize: "0.95rem", color: "#ffffff" }}>{title}</h4>
        <p style={{ fontSize: "0.8rem", color: "#f1f5f9" }}>
          Awaiting laboratory amplification or bone marrow STR extraction.
        </p>
      </div>
    );
  }

  let fullMatches = 0;
  let partialMatches = 0;
  let mismatches = 0;
  let dropouts = 0;

  const evaluatedLoci = allLoci.map((locus) => {
    const u = uidProfile[locus] || [];
    const m = mpProfile[locus] || [];
    
    const uStr = Array.isArray(u) ? u.join(", ") : String(u);
    const mStr = Array.isArray(m) ? m.join(", ") : String(m);

    let status = "mismatch";
    if (!u.length || !m.length || uStr.toLowerCase().includes("dropout") || mStr.toLowerCase().includes("dropout")) {
      status = "dropout";
      dropouts++;
    } else {
      const uSet = new Set(u.map(String));
      const mSet = new Set(m.map(String));
      if (uSet.size === mSet.size && [...uSet].every(x => mSet.has(x))) {
        status = "full_match";
        fullMatches++;
      } else if ([...uSet].some(x => mSet.has(x))) {
        status = "partial_match";
        partialMatches++;
      } else {
        status = "mismatch";
        mismatches++;
      }
    }

    return { locus, uStr, mStr, status };
  });

  return (
    <div className="forensic-card" style={{ padding: "1.25rem", border: "1px solid rgba(230, 0, 38, 0.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h4 style={{ fontSize: "1.05rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Dna size={18} color="var(--red-crimson)" /> {title}
          </h4>
          <p style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
            Standard 16-24 Autosomal STR Loci & Amelogenin Sex Marker Comparison
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="forensic-badge badge-crimson" style={{ color: "#ffffff" }}>
            {fullMatches} Full Concordances
          </span>
          {partialMatches > 0 && (
            <span className="forensic-badge badge-cyan" style={{ color: "#ffffff" }}>
              {partialMatches} Kinship Alleles
            </span>
          )}
          {dropouts > 0 && (
            <span className="forensic-badge badge-amber" style={{ color: "#ffffff" }}>
              {dropouts} Degraded Dropouts
            </span>
          )}
          {mismatches > 0 && (
            <span className="forensic-badge badge-crimson" style={{ background: "rgba(127, 29, 29, 0.5)", color: "#ffffff" }}>
              {mismatches} Exclusions
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
        maxHeight: "320px",
        overflowY: "auto",
        paddingRight: "0.25rem"
      }}>
        {evaluatedLoci.map((item) => {
          let borderCol = "rgba(230, 0, 38, 0.3)";
          let bgCol = "rgba(15, 4, 7, 0.75)";
          let icon = null;

          if (item.status === "full_match") {
            borderCol = "rgba(255, 26, 60, 0.75)";
            bgCol = "rgba(230, 0, 38, 0.22)";
            icon = <CheckCircle2 size={13} color="#ff4d6d" />;
          } else if (item.status === "partial_match") {
            borderCol = "rgba(220, 38, 38, 0.5)";
            bgCol = "rgba(185, 28, 28, 0.15)";
            icon = <CheckCircle2 size={13} color="#fca5a5" />;
          } else if (item.status === "dropout") {
            borderCol = "rgba(245, 158, 11, 0.5)";
            bgCol = "rgba(245, 158, 11, 0.12)";
            icon = <MinusCircle size={13} color="#fed7aa" />;
          } else {
            borderCol = "rgba(127, 29, 29, 0.8)";
            bgCol = "rgba(69, 10, 10, 0.4)";
            icon = <AlertTriangle size={13} color="#f87171" />;
          }

          return (
            <div
              key={item.locus}
              style={{
                background: bgCol,
                border: `1px solid ${borderCol}`,
                borderRadius: "var(--radius-md)",
                padding: "0.6rem 0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                  {item.locus}
                </span>
                {icon}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "#fca5a5" }}>UID:</span>
                <span style={{ color: "#ffffff", fontWeight: "700" }}>{item.uStr || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
                <span style={{ color: "#fca5a5" }}>MP:</span>
                <span style={{ color: "#ffffff", fontWeight: "700" }}>{item.mStr || "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
