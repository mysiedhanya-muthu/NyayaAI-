function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.trim().replace(/\/$/, "");
    const fullUrl = cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
      ? cleanUrl
      : `https://${cleanUrl}`;
    return `${fullUrl}/api`;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://127.0.0.1:8000/api";
}

const API_BASE = resolveApiBase();

function getAuthHeader() {
  const token = localStorage.getItem("nyaya_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    let errMessage = "Network response was not ok";
    try {
      const errData = await response.json();
      errMessage = errData.detail || errData.message || JSON.stringify(errData);
    } catch (e) {
      errMessage = response.statusText;
    }
    throw new Error(errMessage);
  }
  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getCurrentUser: () => request("/auth/me"),
  getDemoAccounts: () => request("/auth/demo-accounts"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, new_password) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) }),

  // Cases
  getStatistics: () => request("/cases/statistics"),
  getUIDCases: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/cases/uid${q ? `?${q}` : ""}`);
  },
  getUIDCase: (id) => request(`/cases/uid/${id}`),
  createUIDCase: (data) => request("/cases/uid", { method: "POST", body: JSON.stringify(data) }),

  getMPRecords: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/cases/mp${q ? `?${q}` : ""}`);
  },
  getMPRecord: (id) => request(`/cases/mp/${id}`),
  createMPRecord: (data) => request("/cases/mp", { method: "POST", body: JSON.stringify(data) }),

  // Match Engine
  runMatching: (uidId) => request(`/matches/run/${uidId}`, { method: "POST" }),
  getMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/matches${q ? `?${q}` : ""}`);
  },
  getMatchDetail: (matchId) => request(`/matches/${matchId}`),
  reviewMatch: (matchId, action, review_notes) => 
    request(`/matches/${matchId}/review`, { method: "POST", body: JSON.stringify({ action, review_notes }) }),
  getDossier: (matchId) => request(`/matches/${matchId}/dossier`),

  // Evidence
  getEvidence: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/evidence${q ? `?${q}` : ""}`);
  },
  addEvidence: (data) => request("/evidence", { method: "POST", body: JSON.stringify(data) }),
  transferCustody: (itemId, data) => request(`/evidence/${itemId}/custody`, { method: "POST", body: JSON.stringify(data) }),

  // Audit
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/audit${q ? `?${q}` : ""}`);
  }
};
