import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  UserPlus, 
  UserCheck, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Droplets
} from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("pathologist@nyaya.ai");
  const [password, setPassword] = useState("Forensic@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Lead Investigator");
  const [regBadge, setRegBadge] = useState("");
  const [regDept, setRegDept] = useState("Forensic Investigation Directorate");

  // Forgot password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetTokenDispatched, setResetTokenDispatched] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Failed to authenticate. Verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.register({
        email: regEmail,
        password: regPassword,
        full_name: regFullName,
        role: regRole,
        badge_number: regBadge,
        department: regDept
      });
      alert("Registration successful. Logging in automatically...");
      await login(regEmail, regPassword);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError("");
    try {
      await login(demoEmail, demoPass);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.forgotPassword(forgotEmail);
      setResetTokenDispatched(res.demo_reset_token || "Token Dispatched to Official Inbox");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "radial-gradient(circle at 50% 30%, rgba(30, 8, 12, 0.95) 0%, rgba(5, 2, 3, 0.98) 80%), url('/blood_cells_dna.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img 
            src="/logo.jpg" 
            alt="NyayaAI Emblem" 
            style={{ 
              width: "82px", 
              height: "82px", 
              borderRadius: "16px", 
              margin: "0 auto 1rem", 
              border: "2px solid var(--red-crimson)",
              boxShadow: "0 0 30px rgba(230, 0, 38, 0.6)"
            }} 
          />
          <h1 style={{ fontSize: "2rem", letterSpacing: "0.05em", margin: "0 0 0.35rem", color: "#ffffff" }}>
            NYAYA<span style={{ color: "var(--red-crimson)" }}>AI</span>
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#ffffff", maxWidth: "420px", margin: "0 auto" }}>
            AI-Powered Forensic Victim Identification & Missing-Person Decision Support System
          </p>
        </div>

        {/* Main Card */}
        <div className="forensic-card" style={{ padding: "2rem", border: "1px solid rgba(255, 26, 60, 0.45)", background: "rgba(18, 5, 8, 0.92)" }}>
          {error && (
            <div style={{
              background: "rgba(220, 38, 38, 0.25)",
              border: "1px solid #ef4444",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#ffffff",
              fontSize: "0.825rem",
              fontWeight: "600"
            }}>
              <AlertCircle size={16} color="#ffffff" />
              <span>{error}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Authorized Personnel Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#ff4d6d" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="officer@nyaya.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label className="form-label" style={{ margin: 0, color: "#ffffff" }}>Cryptographic Access Key</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{ background: "none", border: "none", color: "var(--red-crimson)", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700" }}
                  >
                    Forgot Key?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <Key size={16} color="#ff4d6d" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: "2.4rem", color: "#ffffff" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", marginTop: "0.5rem" }}
              >
                <Lock size={16} color="#ffffff" />
                <span>{loading ? "Verifying Credentials..." : "Authenticate Forensic Session"}</span>
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  style={{ background: "none", border: "none", color: "#ffffff", fontSize: "0.825rem", cursor: "pointer" }}
                >
                  New Officer or Pathologist? <span style={{ color: "var(--red-crimson)", fontWeight: "700" }}>Register Personnel Record</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Full Name & Rank</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Verma, MD"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Official Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="r.verma@nyaya.ai"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Forensic Role</label>
                  <select
                    className="form-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="Lead Investigator">Lead Investigator</option>
                    <option value="Forensic Pathologist">Forensic Pathologist</option>
                    <option value="Forensic Odontologist">Forensic Odontologist</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: "#ffffff" }}>Badge / ID Number</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="INV-9901"
                    value={regBadge}
                    onChange={(e) => setRegBadge(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Department / Bureau</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "#ffffff" }}>Security Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Min 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", marginTop: "0.5rem" }}
              >
                <UserPlus size={16} color="#ffffff" />
                <span>{loading ? "Registering..." : "Complete Personnel Registration"}</span>
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  style={{ background: "none", border: "none", color: "#ffffff", fontSize: "0.825rem", cursor: "pointer" }}
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Personnel Access Bar */}
          <div style={{
            marginTop: "1.75rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(230, 0, 38, 0.25)"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.65rem", textAlign: "center", fontWeight: "700" }}>
              🩸 1-Click Client Evaluation Logins (Select Role)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => handleQuickDemo("pathologist@nyaya.ai", "Forensic@123")}
                style={{
                  background: "rgba(230, 0, 38, 0.15)",
                  border: "1px solid rgba(255, 26, 60, 0.45)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.75rem"
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff" }}>🔬 Pathologist</div>
                <div style={{ fontSize: "0.68rem", color: "#f1f5f9" }}>Dr. Ananya Roy, MD</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("investigator@nyaya.ai", "Investigate@123")}
                style={{
                  background: "rgba(185, 28, 28, 0.18)",
                  border: "1px solid rgba(239, 68, 68, 0.45)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.75rem"
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff" }}>🎖️ Investigator</div>
                <div style={{ fontSize: "0.68rem", color: "#f1f5f9" }}>Insp. Vikram Singh</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("odontologist@nyaya.ai", "Odonto@123")}
                style={{
                  background: "rgba(153, 27, 27, 0.2)",
                  border: "1px solid rgba(255, 80, 100, 0.45)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.75rem"
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff" }}>🦷 Odontologist</div>
                <div style={{ fontSize: "0.68rem", color: "#f1f5f9" }}>Dr. Suresh Kumar</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("admin@nyaya.ai", "Admin@123")}
                style={{
                  background: "rgba(127, 29, 29, 0.25)",
                  border: "1px solid rgba(255, 100, 120, 0.45)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.75rem"
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff" }}>🛡️ System Admin</div>
                <div style={{ fontSize: "0.68rem", color: "#f1f5f9" }}>Devansh Nambiar</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", border: "1px solid var(--red-crimson)" }}>
            <div className="card-header">
              <h3 style={{ fontSize: "1.1rem", color: "#ffffff" }}>Dispatch Password Reset Token</h3>
              <button onClick={() => setShowForgotModal(false)} className="btn btn-secondary" style={{ padding: "0.3rem" }}>✕</button>
            </div>
            <div className="card-body">
              {resetTokenDispatched ? (
                <div style={{ background: "rgba(230, 0, 38, 0.2)", padding: "1rem", borderRadius: "6px", color: "#ffffff", fontSize: "0.85rem", border: "1px solid var(--red-crimson)" }}>
                  <strong style={{ color: "#ffffff" }}>Reset Token Generated:</strong>
                  <div style={{ fontFamily: "var(--font-mono)", color: "#ff4d6d", margin: "0.5rem 0", fontSize: "0.95rem", fontWeight: "800" }}>
                    {resetTokenDispatched}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#f1f5f9", margin: 0 }}>
                    In production, this token is securely transmitted via SMS/Government email with rate limiting.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: "#ffffff" }}>Enter Registered Forensic Email</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="officer@nyaya.ai"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    Dispatch Reset Authorization Token
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
