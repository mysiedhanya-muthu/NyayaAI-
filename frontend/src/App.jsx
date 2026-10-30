import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MatchExplainerModal from "./components/MatchExplainerModal";
import ForensicReportModal from "./components/ForensicReportModal";
import WaterImmersionGuide from "./components/WaterImmersionGuide";

// Pages
import Dashboard from "./pages/Dashboard";
import ForensicMatchEngine from "./pages/ForensicMatchEngine";
import UnidentifiedCases from "./pages/UnidentifiedCases";
import MissingPersons from "./pages/MissingPersons";
import RegisterCase from "./pages/RegisterCase";
import EvidenceVault from "./pages/EvidenceVault";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login";

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modals state
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [showImmersionGuide, setShowImmersionGuide] = useState(false);

  // Match detail loader
  const handleOpenMatchDetail = async (matchId) => {
    try {
      const detail = await api.getMatchDetail(matchId);
      setSelectedMatchDetail(detail);
    } catch (err) {
      alert("Failed to load match detail: " + err.message);
    }
  };

  // Review match action
  const handleReviewMatch = async (matchId, action, reviewNotes) => {
    try {
      await api.reviewMatch(matchId, action, reviewNotes);
      alert(`Decision recorded: ${action}`);
      const updated = await api.getMatchDetail(matchId);
      setSelectedMatchDetail(updated);
    } catch (err) {
      alert("Review submission failed: " + err.message);
    }
  };

  // Dossier print loader
  const handleOpenDossier = async (matchId) => {
    try {
      const data = await api.getDossier(matchId);
      setDossierData(data);
    } catch (err) {
      alert("Failed to generate official dossier: " + err.message);
    }
  };

  // Navigation from dashboard
  const handleSelectCaseFromDashboard = (caseId) => {
    setActiveTab("match_engine");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        color: "var(--cyan-neon)",
        fontFamily: "var(--font-mono)",
        fontSize: "1.1rem"
      }}>
        Initializing NyayaAI Forensic Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setActiveTab("dashboard")} />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        <Navbar onOpenGuide={() => setShowImmersionGuide(true)} />

        {activeTab === "dashboard" && (
          <Dashboard 
            onSelectCase={handleSelectCaseFromDashboard}
            onSelectMatch={handleOpenMatchDetail}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "match_engine" && (
          <ForensicMatchEngine 
            onSelectMatch={handleOpenMatchDetail}
            onPrintDossier={handleOpenDossier}
          />
        )}

        {activeTab === "uid_cases" && (
          <UnidentifiedCases 
            onSelectCase={handleSelectCaseFromDashboard}
            onRunMatch={(id) => { setActiveTab("match_engine"); }}
            onNewCase={() => setActiveTab("register_case")}
          />
        )}

        {activeTab === "mp_records" && (
          <MissingPersons 
            onNewMP={() => setActiveTab("register_case")}
          />
        )}

        {activeTab === "register_case" && (
          <RegisterCase 
            onCaseCreated={(type, id) => {
              if (type === "uid") setActiveTab("uid_cases");
              else setActiveTab("mp_records");
            }}
          />
        )}

        {activeTab === "evidence_vault" && (
          <EvidenceVault />
        )}

        {activeTab === "audit_logs" && (
          <AuditLogs />
        )}
      </div>

      {/* Explainable AI Modal */}
      {selectedMatchDetail && (
        <MatchExplainerModal 
          matchDetail={selectedMatchDetail}
          onClose={() => setSelectedMatchDetail(null)}
          onReview={handleReviewMatch}
          onPrintDossier={handleOpenDossier}
        />
      )}

      {/* Official Forensic Report Dossier (Printable) */}
      {dossierData && (
        <ForensicReportModal 
          dossierData={dossierData}
          onClose={() => setDossierData(null)}
        />
      )}

      {/* Water Immersion Casper's Dictum Guide */}
      {showImmersionGuide && (
        <WaterImmersionGuide 
          onClose={() => setShowImmersionGuide(false)}
        />
      )}
    </div>
  );
}
