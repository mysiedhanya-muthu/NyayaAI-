import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  ShieldCheck, 
  Dna, 
  Smile, 
  Camera, 
  FileCheck2, 
  Plus, 
  ArrowRightLeft, 
  Search,
  Hash,
  Clock,
  Droplets
} from "lucide-react";

export default function EvidenceVault() {
  const [evidence, setEvidence] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedItemForCustody, setSelectedItemForCustody] = useState(null);
  const [transferOfficer, setTransferOfficer] = useState("");
  const [transferPurpose, setTransferPurpose] = useState("");
  const [transferLocation, setTransferLocation] = useState("CFSL Forensic Hematology Wing");
  const [transferring, setTransferring] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Evidence Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("DNA Profile");
  const [newCaseType, setNewCaseType] = useState("UID");
  const [newCaseId, setNewCaseId] = useState(1);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      const data = await api.getEvidence();
      setEvidence(data);
    } catch (err) {
      console.error("Failed to load evidence:", err);
    }
  };

  const handleCustodySubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForCustody) return;
    setTransferring(true);
    try {
      await api.transferCustody(selectedItemForCustody.id, {
        transfer_to_officer: transferOfficer,
        purpose: transferPurpose,
        transfer_location: transferLocation
      });
      alert("Chain of custody transfer successfully recorded in immutable ledger.");
      setSelectedItemForCustody(null);
      setTransferOfficer("");
      setTransferPurpose("");
      loadEvidence();
    } catch (err) {
      alert("Custody transfer failed: " + err.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addEvidence({
        case_type: newCaseType,
        case_id: Number(newCaseId),
        item_title: newTitle,
        category: newCategory,
        file_name: `${newCategory.toLowerCase().replace(/ /g, "_")}.dat`
      });
      alert("Evidence exhibit secured with SHA-256 seal.");
      setShowUploadModal(false);
      setNewTitle("");
      loadEvidence();
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const filtered = evidence.filter(item => {
    const matchesSearch = item.item_title.toLowerCase().includes(search.toLowerCase()) ||
                          item.file_hash.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" ? true : item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={26} color="var(--red-crimson)" />
            <h2 style={{ fontSize: "1.55rem", color: "#ffffff", margin: 0 }}>
              Tamper-Evident Forensic Evidence Vault
            </h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#f1f5f9", margin: "0.2rem 0 0" }}>
            SHA-256 digital cryptoseals, chain-of-custody transfer logging, and biometric exhibit vault
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Secure New Evidence Exhibit</span>
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
              placeholder="Search evidence title or SHA-256 hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
            />
          </div>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: "auto", fontSize: "0.825rem", color: "#ffffff" }}
          >
            <option value="ALL">All Forensic Categories</option>
            <option value="DNA Profile">DNA STR Profiles</option>
            <option value="Dental OPG">Dental OPG Radiographs</option>
            <option value="Personal Artifact">Personal Artifacts & Hardware</option>
            <option value="Autopsy Photo">Autopsy Photography</option>
          </select>
        </div>
      </div>

      {/* Evidence Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filtered.map((item) => (
          <div key={item.id} className="forensic-card" style={{ display: "flex", flexDirection: "column", borderTop: "3px solid var(--red-crimson)" }}>
            <div className="card-header" style={{ padding: "1rem 1.25rem" }}>
              <div>
                <span className="forensic-badge badge-crimson" style={{ fontSize: "0.68rem", marginBottom: "0.25rem", color: "#ffffff" }}>
                  {item.case_type} Case #{item.case_id}
                </span>
                <h4 style={{ fontSize: "1rem", color: "#ffffff", lineHeight: 1.3 }}>
                  {item.item_title}
                </h4>
              </div>
              <span className="forensic-badge badge-purple" style={{ fontSize: "0.65rem", color: "#ffffff" }}>
                {item.category}
              </span>
            </div>

            <div className="card-body" style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Tamper Evident SHA-256 Hash Box */}
              <div style={{
                background: "rgba(14, 4, 7, 0.8)",
                border: "1px solid rgba(230, 0, 38, 0.35)",
                borderRadius: "var(--radius-sm)",
                padding: "0.6rem 0.75rem",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ff4d6d", fontSize: "0.72rem", fontWeight: "700", marginBottom: "0.2rem" }}>
                  <Hash size={12} />
                  <span>SHA-256 Cryptographic Forensic Seal</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#ffffff", wordBreak: "break-all" }}>
                  {item.file_hash}
                </div>
              </div>

              {/* Chain of Custody Trail */}
              <div style={{ marginBottom: "1rem", flex: 1 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#ffffff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Clock size={13} color="var(--red-crimson)" />
                  <span>Chain of Custody Ledger ({item.chain_of_custody?.length || 0} Transfers)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(item.chain_of_custody || []).slice(0, 2).map((log, i) => (
                    <div key={i} style={{ fontSize: "0.75rem", background: "rgba(230,0,38,0.08)", padding: "0.4rem 0.6rem", borderRadius: "4px", border: "1px solid rgba(230,0,38,0.2)" }}>
                      <div style={{ color: "#ff4d6d", fontWeight: "700" }}>{log.officer}</div>
                      <div style={{ color: "#ffffff" }}>{log.action}</div>
                      <div style={{ color: "#fca5a5", fontSize: "0.68rem" }}>{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(230, 0, 38, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#f1f5f9" }}>
                  Secured by: {item.uploaded_by}
                </span>
                <button
                  onClick={() => setSelectedItemForCustody(item)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", color: "#ffffff" }}
                >
                  <ArrowRightLeft size={13} /> Log Custody Transfer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custody Transfer Modal */}
      {selectedItemForCustody && (
        <div className="modal-overlay" onClick={() => setSelectedItemForCustody(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", border: "1px solid var(--red-crimson)" }}>
            <div className="card-header">
              <h3 style={{ fontSize: "1.1rem", color: "#ffffff" }}>Record Chain of Custody Transfer</h3>
              <button onClick={() => setSelectedItemForCustody(null)} className="btn btn-secondary" style={{ padding: "0.3rem" }}>✕</button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "0.82rem", color: "#f1f5f9", marginBottom: "1rem" }}>
                Exhibit: <strong style={{ color: "#ffffff" }}>{selectedItemForCustody.item_title}</strong> (Hash: {selectedItemForCustody.file_hash.slice(0, 16)}...)
              </p>

              <form onSubmit={handleCustodySubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Transfer To Receiving Officer</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dr. Suresh Kumar (Forensic Odontologist)"
                    value={transferOfficer}
                    onChange={(e) => setTransferOfficer(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Purpose of Transfer</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Comparative Odontology Examination under stereomicroscope"
                    value={transferPurpose}
                    onChange={(e) => setTransferPurpose(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Receiving Laboratory / Wing</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={transferLocation}
                    onChange={(e) => setTransferLocation(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button type="button" onClick={() => setSelectedItemForCustody(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={transferring} className="btn btn-primary">
                    <ShieldCheck size={16} />
                    <span>{transferring ? "Recording Seal..." : "Sign Custody Transfer"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Exhibit Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", border: "1px solid var(--red-crimson)" }}>
            <div className="card-header">
              <h3 style={{ fontSize: "1.1rem", color: "#ffffff" }}>Secure New Evidence Exhibit</h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ padding: "0.3rem" }}>✕</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleUploadSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Exhibit Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Femur Bone Marrow DNA STR Amplification Chart"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: "#ffffff" }}>Case Association</label>
                    <select
                      className="form-select"
                      value={newCaseType}
                      onChange={(e) => setNewCaseType(e.target.value)}
                    >
                      <option value="UID">Unidentified Deceased (UID)</option>
                      <option value="MP">Missing Person (MP)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: "#ffffff" }}>Case ID / Number</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={newCaseId}
                      onChange={(e) => setNewCaseId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Evidence Category</label>
                  <select
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="DNA Profile">DNA STR Profile</option>
                    <option value="Dental OPG">Dental OPG Radiograph</option>
                    <option value="Personal Artifact">Personal Artifact / Implant</option>
                    <option value="Autopsy Photo">Autopsy / Immersion Photography</option>
                    <option value="Fingerprint Lift">Fingerprint Friction Ridge Lift</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <ShieldCheck size={16} />
                    <span>Secure Exhibit in Vault</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
