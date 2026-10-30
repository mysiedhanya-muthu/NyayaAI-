import React, { useState } from "react";
import { api } from "../services/api";
import { 
  FilePlus2, 
  Waves, 
  User, 
  Dna, 
  Smile, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Droplets
} from "lucide-react";
import OdontogramChart from "../components/OdontogramChart";

export default function RegisterCase({ onCaseCreated }) {
  const [caseType, setCaseType] = useState("UID"); // "UID" or "MP"
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // UID Form State
  const [uidForm, setUidForm] = useState({
    title: "",
    recovery_date: new Date().toISOString().split("T")[0],
    recovery_location_name: "",
    recovery_lat: 28.5447,
    recovery_lng: 77.3060,
    water_body_type: "River",
    water_temperature_celsius: 22.0,
    immersion_stage: "Moderate Bloating & Skin Slippage",
    estimated_pmi_min_days: 3,
    estimated_pmi_max_days: 7,
    biological_sex: "Male",
    estimated_age_min: 25,
    estimated_age_max: 35,
    estimated_height_min: 168.0,
    estimated_height_max: 175.0,
    blood_group: "Unknown/Hemolyzed",
    distinguishing_marks: "",
    clothing_effects: "",
    fingerprint_status: "Degraded / Epidermal Maceration",
    fingerprint_minutiae_score: 0.0,
    condition_notes: "",
    assigned_pathologist: "Dr. Ananya Roy, MD"
  });

  // MP Form State
  const [mpForm, setMpForm] = useState({
    full_name: "",
    reported_date: new Date().toISOString().split("T")[0],
    disappearance_date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    last_seen_location: "",
    last_seen_lat: 28.7126,
    last_seen_lng: 77.2319,
    age: 28,
    biological_sex: "Male",
    height: 172.0,
    blood_group: "B+",
    distinguishing_marks: "",
    clothing_last_seen: "",
    circumstances: "",
    reporting_police_station: "Central Police Station",
    contact_person: "",
    contact_phone: ""
  });

  // Dental Record for interactive Odontogram
  const [dentalRecord, setDentalRecord] = useState({
    "16": "amalgam_filling",
    "21": "crown_ceramic",
    "18": "missing_antemortem",
    "28": "missing_antemortem"
  });

  const handleUIDSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    try {
      const payload = {
        ...uidForm,
        dental_record_json: JSON.stringify(dentalRecord),
        dna_str_profile_json: JSON.stringify({
          "D3S1358": ["15", "16"], "vWA": ["17", "18"], "FGA": ["21", "24"],
          "D8S1179": ["13", "14"], "AMEL": [uidForm.biological_sex === "Female" ? "X" : "X", uidForm.biological_sex === "Female" ? "X" : "Y"]
        })
      };
      const res = await api.createUIDCase(payload);
      setSuccessMessage(`UID Case Registered Successfully: Case #${res.case_number}`);
      if (onCaseCreated) onCaseCreated("uid", res.id);
    } catch (err) {
      alert("Failed to register UID case: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMPSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    try {
      const payload = {
        ...mpForm,
        dental_record_json: JSON.stringify(dentalRecord),
        dna_str_profile_json: JSON.stringify({
          "D3S1358": ["15", "16"], "vWA": ["17", "18"], "FGA": ["21", "24"],
          "D8S1179": ["13", "14"], "AMEL": [mpForm.biological_sex === "Female" ? "X" : "X", mpForm.biological_sex === "Female" ? "X" : "Y"]
        })
      };
      const res = await api.createMPRecord(payload);
      setSuccessMessage(`Missing Person Registered Successfully: Case #${res.case_number}`);
      if (onCaseCreated) onCaseCreated("mp", res.id);
    } catch (err) {
      alert("Failed to register MP record: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FilePlus2 size={26} color="var(--red-crimson)" />
          <h2 style={{ fontSize: "1.65rem", color: "#ffffff", margin: 0 }}>
            Forensic Case Registration & Intake Wizard
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#f1f5f9", margin: "0.25rem 0 0" }}>
          Intake module for Unidentified Deceased (UID) aquatic recoveries or Antemortem Missing Persons (MP)
        </p>
      </div>

      {/* Case Type Toggle Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem" }}>
        <button
          onClick={() => { setCaseType("UID"); setSuccessMessage(""); }}
          className={`btn ${caseType === "UID" ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: "0.95rem", fontSize: "1rem", color: "#ffffff" }}
        >
          <Droplets size={18} color="#ffffff" />
          <span>Register Unidentified Deceased Body (UID)</span>
        </button>

        <button
          onClick={() => { setCaseType("MP"); setSuccessMessage(""); }}
          className={`btn ${caseType === "MP" ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: "0.95rem", fontSize: "1rem", color: "#ffffff" }}
        >
          <User size={18} color="#ffffff" />
          <span>Register Missing Person Record (MP)</span>
        </button>
      </div>

      {successMessage && (
        <div style={{
          background: "rgba(220, 38, 38, 0.25)",
          border: "1px solid #ef4444",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "#ffffff",
          fontWeight: "700"
        }}>
          <CheckCircle2 size={20} color="#ff4d6d" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* UID Intake Form */}
      {caseType === "UID" ? (
        <form onSubmit={handleUIDSubmit}>
          <div className="forensic-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", color: "#ffffff", marginBottom: "1.25rem", borderBottom: "1px solid rgba(230,0,38,0.2)", paddingBottom: "0.5rem" }}>
              1. Recovery Location & Aquatic Environment
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Case Title / Recovery Headline</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Male body recovered near Yamuna Okhla Sluice Gate"
                  value={uidForm.title}
                  onChange={(e) => setUidForm({ ...uidForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Recovery Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={uidForm.recovery_date}
                  onChange={(e) => setUidForm({ ...uidForm, recovery_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Water Body Type</label>
                <select
                  className="form-select"
                  value={uidForm.water_body_type}
                  onChange={(e) => setUidForm({ ...uidForm, water_body_type: e.target.value })}
                >
                  <option value="River">River</option>
                  <option value="Canal">Canal</option>
                  <option value="Lake">Lake</option>
                  <option value="Reservoir">Reservoir / Barrage</option>
                  <option value="Sea/Ocean">Sea / Coastal</option>
                  <option value="None">Non-Aquatic / Land</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Detailed Recovery Location</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Yamuna River Basin, Downstream Okhla Barrage, New Delhi"
                value={uidForm.recovery_location_name}
                onChange={(e) => setUidForm({ ...uidForm, recovery_location_name: e.target.value })}
              />
            </div>
          </div>

          <div className="forensic-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", color: "#ffffff", marginBottom: "1.25rem", borderBottom: "1px solid rgba(230,0,38,0.2)", paddingBottom: "0.5rem" }}>
              2. Aquatic Decomposition & Biological Profile (Casper's Dictum)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Immersion Stage</label>
                <select
                  className="form-select"
                  value={uidForm.immersion_stage}
                  onChange={(e) => setUidForm({ ...uidForm, immersion_stage: e.target.value })}
                >
                  <option value="Early Maceration (Washerwoman skin on hands/feet)">Stage 1: Early Maceration (Washerwoman skin)</option>
                  <option value="Moderate Bloating & Skin Slippage">Stage 2: Moderate Bloating & Skin Slippage</option>
                  <option value="Advanced Adipocere/Saponification formation">Stage 3: Adipocere / Saponification</option>
                  <option value="Partial Skeletonization">Stage 4: Partial Skeletonization</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Est. PMI Min (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={uidForm.estimated_pmi_min_days}
                  onChange={(e) => setUidForm({ ...uidForm, estimated_pmi_min_days: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Est. PMI Max (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={uidForm.estimated_pmi_max_days}
                  onChange={(e) => setUidForm({ ...uidForm, estimated_pmi_max_days: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Biological Sex</label>
                <select
                  className="form-select"
                  value={uidForm.biological_sex}
                  onChange={(e) => setUidForm({ ...uidForm, biological_sex: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Indeterminate">Indeterminate (Osteological Review Needed)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Est. Age Range (Yrs)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min"
                    value={uidForm.estimated_age_min}
                    onChange={(e) => setUidForm({ ...uidForm, estimated_age_min: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max"
                    value={uidForm.estimated_age_max}
                    onChange={(e) => setUidForm({ ...uidForm, estimated_age_max: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Est. Height Range (cm)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min"
                    value={uidForm.estimated_height_min}
                    onChange={(e) => setUidForm({ ...uidForm, estimated_height_min: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max"
                    value={uidForm.estimated_height_max}
                    onChange={(e) => setUidForm({ ...uidForm, estimated_height_max: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Blood Group</label>
                <select
                  className="form-select"
                  value={uidForm.blood_group}
                  onChange={(e) => setUidForm({ ...uidForm, blood_group: e.target.value })}
                >
                  <option value="Unknown/Hemolyzed">Unknown / Hemolyzed (Standard for Water)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Distinguishing Physical Marks (Tattoos, Scars, Surgical Implants)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Trishul tattoo on right forearm, orthopedic titanium plate with screws on right clavicle..."
                value={uidForm.distinguishing_marks}
                onChange={(e) => setUidForm({ ...uidForm, distinguishing_marks: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Clothing, Footwear & Personal Artifacts</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Dark blue denim jeans (size 32), stainless steel wristwatch, black braided amulet..."
                value={uidForm.clothing_effects}
                onChange={(e) => setUidForm({ ...uidForm, clothing_effects: e.target.value })}
              />
            </div>
          </div>

          {/* Interactive Odontogram Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <OdontogramChart
              dentalRecord={dentalRecord}
              isEditable={true}
              onChange={setDentalRecord}
              title="3. Post-Mortem Forensic Odontogram Charting (Click any tooth to set status)"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              {submitting ? "Registering Body..." : "Submit UID Case to Registry"}
            </button>
          </div>
        </form>
      ) : (
        /* MP Intake Form */
        <form onSubmit={handleMPSubmit}>
          <div className="forensic-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", color: "#ffffff", marginBottom: "1.25rem", borderBottom: "1px solid rgba(230,0,38,0.2)", paddingBottom: "0.5rem" }}>
              1. Missing Individual Profile & Disappearance Timeline
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Full Name of Missing Person</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Rajesh Sharma"
                  value={mpForm.full_name}
                  onChange={(e) => setMpForm({ ...mpForm, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Disappearance Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={mpForm.disappearance_date}
                  onChange={(e) => setMpForm({ ...mpForm, disappearance_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Reported Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={mpForm.reported_date}
                  onChange={(e) => setMpForm({ ...mpForm, reported_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Last Known Location / Proximity to Water Corridor</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Wazirabad Yamuna Bridge walkway, North Delhi"
                value={mpForm.last_seen_location}
                onChange={(e) => setMpForm({ ...mpForm, last_seen_location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Circumstances of Disappearance</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Disappeared during heavy thunderstorm near river barrage. Family reported missing next morning."
                value={mpForm.circumstances}
                onChange={(e) => setMpForm({ ...mpForm, circumstances: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Age (Years)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={mpForm.age}
                  onChange={(e) => setMpForm({ ...mpForm, age: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Biological Sex</label>
                <select
                  className="form-select"
                  value={mpForm.biological_sex}
                  onChange={(e) => setMpForm({ ...mpForm, biological_sex: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Height (cm)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={mpForm.height}
                  onChange={(e) => setMpForm({ ...mpForm, height: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Blood Group</label>
                <select
                  className="form-select"
                  value={mpForm.blood_group}
                  onChange={(e) => setMpForm({ ...mpForm, blood_group: e.target.value })}
                >
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="AB+">AB+</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: "#ffffff" }}>Known Antemortem Distinguishing Marks (Tattoos, Surgical Implants, Scars)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Trishul tattoo on right forearm, right clavicle fracture repaired with titanium plate in 2021..."
                value={mpForm.distinguishing_marks}
                onChange={(e) => setMpForm({ ...mpForm, distinguishing_marks: e.target.value })}
              />
            </div>
          </div>

          {/* Interactive Odontogram Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <OdontogramChart
              dentalRecord={dentalRecord}
              isEditable={true}
              onChange={setDentalRecord}
              title="2. Antemortem Dental History Charting (From family dentist or health records)"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              {submitting ? "Registering Missing Person..." : "Submit Missing Person Record"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
