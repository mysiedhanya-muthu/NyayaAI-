# NyayaAI (न्यायAI) – Forensic Victim Identification & Missing-Person Matching System

NyayaAI is an AI-powered forensic assistance platform engineered to identify unidentified deceased individuals—specifically challenging cases where bodies are recovered from water bodies (rivers, lakes, canals, reservoirs) after prolonged immersion and conventional biometric recognition methods (such as friction ridge fingerprinting or facial photography) have failed due to epidermal maceration and putrefaction.

---

## 🌟 Key Highlights

1. **Multi-Modal AI/ML Matching Engine (Explainable AI)**
   - Synthesizes multiple forensic indicators:
     - **DNA STR Profiles (16-24 standard loci):** Autosomal STR electropherogram concordance analysis, kinship half-matching, and degradation drop-out handling.
     - **Forensic Odontology Matrix:** 32-tooth permanent dentition comparison (amalgam restorations, composites, ceramic/gold crowns, root canals, implants, and antemortem extractions).
     - **Distinctive Identifiers & Tattoos:** NLP semantic scanning of scars, tattoos, and orthopedic hardware serial numbers.
     - **Casper's Dictum & Aquatic Immersion Triage:** Decomposition estimation ($1\text{ wk in air} \approx 2\text{ wks in water} \approx 8\text{ wks underground}$), washerwoman skin, bloating floatation, adipocere/saponification, and downstream river drift radius.
     - **Anthropological Bio-Profile:** Stature overlap, osteological age interval, biological sex, and blood group.
   - **Dynamic Degradation Weighting:** When water maceration degrades fingerprints, the algorithm automatically re-distributes decision weight to protected enamel (teeth) and bone marrow STR DNA.

2. **Tamper-Evident Evidence Vault & Chain of Custody**
   - SHA-256 digital cryptoseals for digital evidence exhibits (autopsy photography, OPG dental radiographs, STR electropherograms).
   - Immutable custody transfer logging complying with ISO/IEC 27037 standards.

3. **Official Printable Forensic Identification Dossier**
   - One-click print/PDF export format tailored for judicial magistrates, coroners, and certified inquest proceedings.

4. **Security & Role-Based Access Control (RBAC)**
   - Role separation: **Lead Investigator**, **Forensic Pathologist**, **Forensic Odontologist**, and **System Administrator**.
   - Chronological audit trail logging every case access, algorithm execution, and review decision.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Vanilla CSS Design System, Lucide Icons
- **Backend:** Python 3.14, FastAPI, SQLAlchemy, SQLite (PostgreSQL Ready)
- **AI/ML:** scikit-learn, TF-IDF cosine similarity, multi-attribute concordance heuristic
- **Security:** NIST PBKDF2-HMAC-SHA256 password hashing, JWT Bearer tokens, SHA-256 tamper seals

---

## 🚀 Running the Project Locally

### 1. Backend (FastAPI)
The backend server runs on `http://127.0.0.1:8000`:
```bash
cd backend
python run.py
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend (React + Vite)
The frontend application runs on `http://127.0.0.1:5173`:
```bash
cd frontend
npm run dev
```

---

## 🔑 1-Click Client Evaluation Logins

The login page includes 1-click test buttons for the following roles:

| Role | Officer | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Forensic Pathologist** | Dr. Ananya Roy, MD | `pathologist@nyaya.ai` | `Forensic@123` | Autopsy evidence, STR loci review, inquest determinations |
| **Lead Investigator** | Insp. Vikram Singh | `investigator@nyaya.ai` | `Investigate@123` | Case intake, AI match execution, missing-person registry |
| **Forensic Odontologist** | Dr. Suresh Kumar, MDS | `odontologist@nyaya.ai` | `Odonto@123` | 32-tooth odontogram comparison & radiographic analysis |
| **System Administrator** | Devansh Nambiar | `admin@nyaya.ai` | `Admin@123` | System audit ledger, compliance, and user administration |

---

## ⚖️ Legal & Ethical AI Notice

NyayaAI is an investigative decision support platform. In adherence with evidence protocols, AI match scores serve to prioritize and explain candidates for expert confirmation and judicial inquest. It does not replace qualified forensic pathologists, genetic laboratory testing, or legally required identity certification.
