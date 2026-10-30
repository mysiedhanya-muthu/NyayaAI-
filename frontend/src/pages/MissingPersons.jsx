import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Users, 
  Search, 
  Calendar, 
  MapPin, 
  Phone, 
  Building, 
  Dna, 
  Smile, 
  Plus,
  Droplets
} from "lucide-react";

export default function MissingPersons({ onNewMP }) {
  const [mps, setMps] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMPs();
  }, []);

  const loadMPs = async () => {
    try {
      setLoading(true);
      const data = await api.getMPRecords();
      setMps(data);
    } catch (err) {
      console.error("Failed to load MPs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = mps.filter((m) =>
    m.case_number.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.last_seen_location.toLowerCase().includes(search.toLowerCase()) ||
    (m.distinguishing_marks && m.distinguishing_marks.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-content">
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={24} color="var(--red-crimson)" />
            <h2 style={{ fontSize: "1.55rem", color: "#ffffff", margin: 0 }}>
              Missing Persons Antemortem Registry
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#f1f5f9", margin: "0.2rem 0 0" }}>
            Repository of registered missing individuals, dental histories, and kinship reference samples
          </p>
        </div>

        <button onClick={onNewMP} className="btn btn-primary">
          <Plus size={16} />
          <span>Register Missing Person</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="forensic-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#ff4d6d" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search missing person name, case #, last seen location, reported scars or tattoos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
          />
        </div>
      </div>

      {/* Grid of MPs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((mp) => {
          const hasDNA = !!mp.dna_str_profile_json && mp.dna_str_profile_json !== "{}";
          const hasDental = !!mp.dental_record_json && mp.dental_record_json !== "{}";

          return (
            <div 
              key={mp.id} 
              className="forensic-card" 
              style={{ display: "flex", flexDirection: "column", borderTop: "3px solid var(--red-crimson)" }}
            >
              <div className="card-header" style={{ padding: "1rem 1.25rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
                      {mp.full_name}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--red-crimson)", fontWeight: "700" }}>
                      ({mp.case_number})
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#f1f5f9" }}>
                    Reported: {mp.reported_date}
                  </div>
                </div>

                <span className="forensic-badge badge-crimson" style={{ color: "#ffffff" }}>
                  {mp.status}
                </span>
              </div>

              <div className="card-body" style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Physical Bio Row */}
                <div style={{ 
                  display: "flex", 
                  gap: "0.75rem", 
                  background: "rgba(18, 5, 8, 0.75)", 
                  padding: "0.5rem 0.75rem", 
                  borderRadius: "var(--radius-sm)", 
                  fontSize: "0.78rem",
                  marginBottom: "0.75rem",
                  border: "1px solid rgba(230, 0, 38, 0.25)"
                }}>
                  <div>Age: <strong style={{ color: "#ffffff" }}>{mp.age} Yrs</strong></div>
                  <div>•</div>
                  <div>Sex: <strong style={{ color: "#ffffff" }}>{mp.biological_sex}</strong></div>
                  <div>•</div>
                  <div>Height: <strong style={{ color: "#ffffff" }}>{mp.height} cm</strong></div>
                  <div>•</div>
                  <div>Blood: <strong style={{ color: "#ff4d6d" }}>{mp.blood_group || "Unknown"}</strong></div>
                </div>

                <div style={{ fontSize: "0.78rem", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <MapPin size={13} color="var(--red-crimson)" />
                  <span>Last Seen: {mp.last_seen_location} ({mp.disappearance_date})</span>
                </div>

                {mp.circumstances && (
                  <p style={{ fontSize: "0.78rem", color: "#ffffff", marginBottom: "0.75rem", fontStyle: "italic", background: "rgba(10, 2, 4, 0.6)", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(230,0,38,0.2)" }}>
                    "{mp.circumstances}"
                  </p>
                )}

                <div style={{ fontSize: "0.8rem", color: "#ffffff", marginBottom: "0.75rem", flex: 1 }}>
                  <strong style={{ color: "#ff4d6d" }}>Distinguishing Markers:</strong> {mp.distinguishing_marks || "None reported"}
                </div>

                {/* Evidence badges */}
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {hasDNA && (
                    <span className="forensic-badge badge-crimson" style={{ fontSize: "0.68rem", color: "#ffffff" }}>
                      <Dna size={12} color="#ffffff" /> Kinship DNA Profile
                    </span>
                  )}
                  {hasDental && (
                    <span className="forensic-badge badge-purple" style={{ fontSize: "0.68rem", color: "#ffffff" }}>
                      <Smile size={12} color="#ffffff" /> Antemortem Odontogram
                    </span>
                  )}
                </div>

                {/* Contact Footer */}
                <div style={{ 
                  paddingTop: "0.75rem", 
                  borderTop: "1px solid rgba(230, 0, 38, 0.15)", 
                  fontSize: "0.72rem", 
                  color: "#f1f5f9",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <span>Station: {mp.reporting_police_station || "Notified"}</span>
                  <span>Contact: {mp.contact_person || "Family"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
