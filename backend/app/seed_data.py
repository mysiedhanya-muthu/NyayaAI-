import json
import datetime
from sqlalchemy.orm import Session
from .models import User, UnidentifiedBody, MissingPerson, ForensicMatchResult, EvidenceItem, AuditLog, UserRole
from .auth import hash_password
from .matching_engine import evaluate_match_pair

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    print("Seeding forensic users...")
    users = [
        User(
            email="investigator@nyaya.ai",
            full_name="Insp. Vikram Singh",
            role=UserRole.LEAD_INVESTIGATOR,
            badge_number="INV-ND-8491",
            department="State CID Special Missing Persons Unit",
            hashed_password=hash_password("Investigate@123"),
            is_active=True,
            is_verified=True
        ),
        User(
            email="pathologist@nyaya.ai",
            full_name="Dr. Ananya Roy, MD",
            role=UserRole.FORENSIC_PATHOLOGIST,
            badge_number="MED-FP-209",
            department="Central Forensic Science Laboratory (CFSL)",
            hashed_password=hash_password("Forensic@123"),
            is_active=True,
            is_verified=True
        ),
        User(
            email="odontologist@nyaya.ai",
            full_name="Dr. Suresh Kumar, MDS",
            role=UserRole.ODONTOLOGIST,
            badge_number="DEN-OD-441",
            department="Forensic Odontology Bureau",
            hashed_password=hash_password("Odonto@123"),
            is_active=True,
            is_verified=True
        ),
        User(
            email="admin@nyaya.ai",
            full_name="Devansh Nambiar",
            role=UserRole.ADMIN,
            badge_number="SYS-ADM-001",
            department="NyayaAI Security & Compliance Directorate",
            hashed_password=hash_password("Admin@123"),
            is_active=True,
            is_verified=True
        ),
    ]
    for u in users:
        db.add(u)
    db.commit()

    print("Seeding Unidentified Deceased (UID) Cases...")
    # Reference dental profiles
    uid1_dental = {
        "11": "intact", "12": "intact", "13": "intact", "14": "intact", "15": "intact", "16": "amalgam_filling", "17": "intact", "18": "missing_antemortem",
        "21": "crown_ceramic", "22": "intact", "23": "intact", "24": "intact", "25": "intact", "26": "amalgam_filling", "27": "intact", "28": "missing_antemortem",
        "31": "intact", "32": "intact", "33": "intact", "34": "intact", "35": "intact", "36": "intact", "37": "intact", "38": "missing_postmortem",
        "41": "intact", "42": "intact", "43": "intact", "44": "intact", "45": "intact", "46": "composite", "47": "intact", "48": "intact"
    }

    uid1_dna = {
        "D3S1358": ["15", "16"], "vWA": ["17", "18"], "FGA": ["21", "24"],
        "D8S1179": ["13", "14"], "D21S11": ["29", "30"], "D18S51": ["14", "17"],
        "D5S818": ["11", "12"], "D13S317": ["11", "12"], "D7S820": ["9", "10"],
        "TH01": ["7", "9.3"], "TPOX": ["8", "11"], "CSF1PO": ["10", "12"],
        "AMEL": ["X", "Y"]
    }

    uid2_dental = {
        "11": "intact", "12": "intact", "13": "intact", "14": "crown_gold", "15": "intact", "16": "intact", "17": "intact", "18": "missing_antemortem",
        "21": "intact", "22": "intact", "23": "intact", "24": "intact", "25": "intact", "26": "intact", "27": "intact", "28": "intact",
        "31": "intact", "32": "intact", "33": "intact", "34": "intact", "35": "intact", "36": "missing_antemortem", "37": "intact", "38": "intact",
        "41": "intact", "42": "intact", "43": "intact", "44": "intact", "45": "intact", "46": "amalgam_filling", "47": "intact", "48": "intact"
    }

    uid2_dna = {
        "D3S1358": ["14", "16"], "vWA": ["16", "17"], "FGA": ["20", "22"],
        "D8S1179": ["12", "14"], "D21S11": ["28", "31"], "D18S51": ["15", "16"],
        "D5S818": ["9", "11"], "D13S317": ["8", "11"], "D7S820": ["10", "11"],
        "TH01": ["6", "9"], "AMEL": ["X", "Y"]
    }

    uid3_dental = {
        "11": "composite", "12": "intact", "13": "intact", "14": "intact", "15": "intact", "16": "intact", "17": "intact", "18": "intact",
        "21": "composite", "22": "intact", "23": "intact", "24": "intact", "25": "intact", "26": "intact", "27": "intact", "28": "intact",
        "31": "intact", "32": "intact", "33": "intact", "34": "intact", "35": "intact", "36": "intact", "37": "intact", "38": "intact",
        "41": "intact", "42": "intact", "43": "intact", "44": "intact", "45": "intact", "46": "intact", "47": "intact", "48": "intact"
    }

    uid3_dna = {
        "D3S1358": ["16", "17"], "vWA": ["15", "18"], "FGA": ["22", "25"],
        "D8S1179": ["11", "13"], "D21S11": ["29", "31.2"], "D18S51": ["13", "16"],
        "AMEL": ["X", "X"]
    }

    uids = [
        UnidentifiedBody(
            case_number="UID-2024-W108",
            title="Male body recovered near Okhla Barrage downstream sluice gate",
            recovery_date="2026-10-25",
            recovery_location_name="Yamuna River, Okhla Barrage Basin, New Delhi",
            recovery_lat=28.5447,
            recovery_lng=77.3060,
            water_body_type="River",
            water_temperature_celsius=21.5,
            immersion_stage="Moderate Bloating, Epidermal Slippage & Washerwoman Hands",
            estimated_pmi_min_days=4,
            estimated_pmi_max_days=7,
            biological_sex="Male",
            estimated_age_min=27,
            estimated_age_max=34,
            estimated_height_min=171.0,
            estimated_height_max=176.0,
            blood_group="Unknown/Hemolyzed",
            distinguishing_marks="Distinctive Trishul and Om tattoo on dorsal aspect of right forearm. Healed surgical scar with titanium clavicle fixation plate on right shoulder.",
            clothing_effects="Dark blue denim trousers (size 32), black braided wrist amulet with small silver cylinder, stainless steel digital wristwatch.",
            dental_record_json=json.dumps(uid1_dental),
            dna_str_profile_json=json.dumps(uid1_dna),
            fingerprint_status="Degraded / Epidermal Maceration (Glove detachment)",
            fingerprint_minutiae_score=15.0,
            condition_notes="Submerged in river current. Epidermis detached like glove. Odontology completely intact, clavicle hardware retrieved for serial verification.",
            status="Potential Match Review",
            assigned_pathologist="Dr. Ananya Roy, MD"
        ),
        UnidentifiedBody(
            case_number="UID-2024-W112",
            title="Deceased male recovered from Hooghly River near dock slipway",
            recovery_date="2026-10-22",
            recovery_location_name="Hooghly River, Garden Reach Reachway, Kolkata",
            recovery_lat=22.5411,
            recovery_lng=88.3022,
            water_body_type="River",
            water_temperature_celsius=26.0,
            immersion_stage="Advanced Adipocere/Saponification formation, Partial Maceration",
            estimated_pmi_min_days=10,
            estimated_pmi_max_days=16,
            biological_sex="Male",
            estimated_age_min=39,
            estimated_age_max=46,
            estimated_height_min=163.0,
            estimated_height_max=169.0,
            blood_group="Unknown/Hemolyzed",
            distinguishing_marks="Oblique 7cm healed appendectomy scar in right lower quadrant. Crown in maxillary premolar (gold alloy).",
            clothing_effects="Remnants of brown cotton trousers, black leather belt with rectangular brass buckle.",
            dental_record_json=json.dumps(uid2_dental),
            dna_str_profile_json=json.dumps(uid2_dna),
            fingerprint_status="Inconclusive / Severe aquatic fauna activity",
            fingerprint_minutiae_score=0.0,
            condition_notes="Extensive saponification of subcutaneous tissues. Teeth and jaw intact for forensic odontology matching.",
            status="Under Investigation",
            assigned_pathologist="Dr. Ananya Roy, MD"
        ),
        UnidentifiedBody(
            case_number="UID-2024-W115",
            title="Young female recovered from Ganga Canal siphon inlet",
            recovery_date="2026-10-28",
            recovery_location_name="Upper Ganga Canal, Roorkee Bypass Siphon, Uttarakhand",
            recovery_lat=29.8543,
            recovery_lng=77.8880,
            water_body_type="Canal",
            water_temperature_celsius=18.0,
            immersion_stage="Early Maceration (Washerwoman skin on palms and soles)",
            estimated_pmi_min_days=1,
            estimated_pmi_max_days=3,
            biological_sex="Female",
            estimated_age_min=21,
            estimated_age_max=27,
            estimated_height_min=157.0,
            estimated_height_max=163.0,
            blood_group="B+",
            distinguishing_marks="Artistic Peacock feather tattoo with small initials on lateral side of left ankle. Double lobe piercing in left ear.",
            clothing_effects="Maroon embroidered kurti, black leggings, silver anklet with miniature bells on left ankle.",
            dental_record_json=json.dumps(uid3_dental),
            dna_str_profile_json=json.dumps(uid3_dna),
            fingerprint_status="Partial Minutiae (Recoverable with post-mortem silicone casting)",
            fingerprint_minutiae_score=68.0,
            condition_notes="Early water recovery. Excellent tissue preservation, friction ridges captured via modern forensic casting.",
            status="Open",
            assigned_pathologist="Dr. Suresh Kumar, MDS"
        ),
        UnidentifiedBody(
            case_number="UID-2024-W119",
            title="Elderly male recovered from Hussain Sagar Lake aeration zone",
            recovery_date="2026-10-20",
            recovery_location_name="Hussain Sagar Lake, Hyderabad, Telangana",
            recovery_lat=17.4239,
            recovery_lng=78.4738,
            water_body_type="Lake",
            water_temperature_celsius=24.5,
            immersion_stage="Moderate Bloating with facial soft-tissue degradation",
            estimated_pmi_min_days=5,
            estimated_pmi_max_days=8,
            biological_sex="Male",
            estimated_age_min=55,
            estimated_age_max=65,
            estimated_height_min=167.0,
            estimated_height_max=173.0,
            blood_group="O+",
            distinguishing_marks="Old healed burn scar on right shoulder. Full dental denture on mandibular arch.",
            clothing_effects="White khadi kurta, rudraksha bead bracelet on right wrist.",
            dental_record_json=json.dumps({"31": "missing_antemortem", "32": "missing_antemortem", "41": "missing_antemortem"}),
            dna_str_profile_json=json.dumps({"D3S1358": ["14", "15"], "AMEL": ["X", "Y"]}),
            fingerprint_status="Degraded / Maceration",
            fingerprint_minutiae_score=20.0,
            condition_notes="Full lower denture in situ. Waterlogged clothing.",
            status="Open",
            assigned_pathologist="Dr. Ananya Roy, MD"
        )
    ]
    for uid in uids:
        db.add(uid)
    db.commit()

    print("Seeding Missing Persons (MP) Repository...")
    mp1_dental = {
        "11": "intact", "12": "intact", "13": "intact", "14": "intact", "15": "intact", "16": "amalgam_filling", "17": "intact", "18": "missing_antemortem",
        "21": "crown_ceramic", "22": "intact", "23": "intact", "24": "intact", "25": "intact", "26": "amalgam_filling", "27": "intact", "28": "missing_antemortem",
        "31": "intact", "32": "intact", "33": "intact", "34": "intact", "35": "intact", "36": "intact", "37": "intact", "38": "intact",
        "41": "intact", "42": "intact", "43": "intact", "44": "intact", "45": "intact", "46": "composite", "47": "intact", "48": "intact"
    }

    mp1_dna = {
        "D3S1358": ["15", "16"], "vWA": ["17", "18"], "FGA": ["21", "24"],
        "D8S1179": ["13", "14"], "D21S11": ["29", "30"], "D18S51": ["14", "17"],
        "D5S818": ["11", "12"], "D13S317": ["11", "12"], "D7S820": ["9", "10"],
        "TH01": ["7", "9.3"], "TPOX": ["8", "11"], "CSF1PO": ["10", "12"],
        "AMEL": ["X", "Y"]
    }

    mp2_dental = {
        "11": "intact", "12": "intact", "13": "intact", "14": "crown_gold", "15": "intact", "16": "intact", "17": "intact", "18": "missing_antemortem",
        "21": "intact", "22": "intact", "23": "intact", "24": "intact", "25": "intact", "26": "intact", "27": "intact", "28": "intact",
        "31": "intact", "32": "intact", "33": "intact", "34": "intact", "35": "intact", "36": "missing_antemortem", "37": "intact", "38": "intact"
    }

    mp2_dna = {
        "D3S1358": ["14", "16"], "vWA": ["16", "17"], "FGA": ["20", "22"],
        "D8S1179": ["12", "14"], "D21S11": ["28", "31"], "D18S51": ["15", "16"],
        "AMEL": ["X", "Y"]
    }

    mp3_dental = {
        "11": "composite", "12": "intact", "13": "intact", "14": "intact",
        "21": "composite", "22": "intact", "23": "intact", "24": "intact",
        "31": "intact", "41": "intact"
    }

    mp3_dna = {
        "D3S1358": ["16", "17"], "vWA": ["15", "18"], "FGA": ["22", "25"],
        "D8S1179": ["11", "13"], "D21S11": ["29", "31.2"], "D18S51": ["13", "16"],
        "AMEL": ["X", "X"]
    }

    mps = [
        MissingPerson(
            case_number="MP-2024-0492",
            full_name="Rajesh Sharma",
            reported_date="2026-10-21",
            disappearance_date="2026-10-20",
            last_seen_location="Wazirabad Yamuna Bridge, North Delhi",
            last_seen_lat=28.7126,
            last_seen_lng=77.2319,
            age=30,
            biological_sex="Male",
            height=174.0,
            blood_group="B+",
            distinguishing_marks="Religious Trishul tattoo with Om on right forearm. Had right clavicle fracture in motorcycle accident (2021) repaired with titanium plate.",
            clothing_last_seen="Dark blue jeans, black round-neck T-shirt, digital wrist watch.",
            circumstances="Disappeared during torrential rainstorm near river barrage walkway. Family lodged missing complaint next morning.",
            dental_record_json=json.dumps(mp1_dental),
            dna_str_profile_json=json.dumps(mp1_dna),
            has_fingerprint_record=True,
            reporting_police_station="Wazirabad Police Station, Delhi",
            contact_person="Ramesh Sharma (Brother)",
            contact_phone="+91 98765 43210",
            status="Active Missing"
        ),
        MissingPerson(
            case_number="MP-2024-0318",
            full_name="Subhashis Das",
            reported_date="2026-10-10",
            disappearance_date="2026-10-09",
            last_seen_location="Howrah Ghat Ferry Terminal, Kolkata",
            last_seen_lat=22.5851,
            last_seen_lng=88.3418,
            age=43,
            biological_sex="Male",
            height=166.0,
            blood_group="O+",
            distinguishing_marks="Healed appendectomy scar. Gold alloy crown on upper right first premolar.",
            clothing_last_seen="Brown trousers, checked beige shirt, black leather belt.",
            circumstances="Reported missing after boarding late-evening ferry towards Garden Reach. Bag recovered unattended on ferry bench.",
            dental_record_json=json.dumps(mp2_dental),
            dna_str_profile_json=json.dumps(mp2_dna),
            has_fingerprint_record=False,
            reporting_police_station="Golabari PS, Howrah",
            contact_person="Maitreyi Das (Spouse)",
            contact_phone="+91 98301 23456",
            status="Active Missing"
        ),
        MissingPerson(
            case_number="MP-2024-0551",
            full_name="Priya Patel",
            reported_date="2026-10-27",
            disappearance_date="2026-10-26",
            last_seen_location="Canal Road near Roorkee IIT Gate, Roorkee",
            last_seen_lat=29.8644,
            last_seen_lng=77.8966,
            age=23,
            biological_sex="Female",
            height=161.0,
            blood_group="B+",
            distinguishing_marks="Peacock feather tattoo on left ankle. Double piercings in left ear lobe.",
            clothing_last_seen="Maroon traditional kurti, black leggings, silver anklet.",
            circumstances="Went for evening jog along Upper Ganga canal embankment and failed to return.",
            dental_record_json=json.dumps(mp3_dental),
            dna_str_profile_json=json.dumps(mp3_dna),
            has_fingerprint_record=True,
            reporting_police_station="Civil Lines PS, Roorkee",
            contact_person="Kamlesh Patel (Father)",
            contact_phone="+91 94120 78901",
            status="Active Missing"
        ),
        MissingPerson(
            case_number="MP-2024-0105",
            full_name="Anil Kumar Meena",
            reported_date="2026-09-15",
            disappearance_date="2026-09-14",
            last_seen_location="Jaipur City Center, Rajasthan",
            last_seen_lat=26.9124,
            last_seen_lng=75.7873,
            age=25,
            biological_sex="Male",
            height=182.0,
            blood_group="A+",
            distinguishing_marks="Scar on forehead, 182cm tall basketball player.",
            clothing_last_seen="Red athletic tracksuit",
            circumstances="Last seen at bus terminal.",
            dental_record_json=json.dumps({"11": "intact", "21": "intact"}),
            dna_str_profile_json=json.dumps({"D3S1358": ["12", "14"], "AMEL": ["X", "Y"]}),
            has_fingerprint_record=True,
            reporting_police_station="Sadar PS, Jaipur",
            contact_person="R. S. Meena",
            contact_phone="+91 94140 11223",
            status="Active Missing"
        )
    ]
    for mp in mps:
        db.add(mp)
    db.commit()

    print("Running initial forensic matching engine matrix...")
    # Evaluate UID-2024-W108 with all MPs
    uid_108 = db.query(UnidentifiedBody).filter_by(case_number="UID-2024-W108").first()
    mp_492 = db.query(MissingPerson).filter_by(case_number="MP-2024-0492").first()
    mp_318 = db.query(MissingPerson).filter_by(case_number="MP-2024-0318").first()
    mp_551 = db.query(MissingPerson).filter_by(case_number="MP-2024-0551").first()

    if uid_108 and mp_492:
        res = evaluate_match_pair(uid_108, mp_492)
        match_record = ForensicMatchResult(
            uid_id=uid_108.id,
            mp_id=mp_492.id,
            overall_score=res["overall_score"],
            confidence_level=res["confidence_level"],
            dna_score=res["dna_score"],
            dental_score=res["dental_score"],
            physical_score=res["physical_score"],
            distinctive_score=res["distinctive_score"],
            temporal_geo_score=res["temporal_geo_score"],
            fingerprint_score=res["fingerprint_score"],
            weights_used_json=res["weights_used_json"],
            explanation_json=res["explanation_json"],
            status="Pending Review"
        )
        db.add(match_record)

    if uid_108 and mp_318:
        res = evaluate_match_pair(uid_108, mp_318)
        db.add(ForensicMatchResult(
            uid_id=uid_108.id,
            mp_id=mp_318.id,
            overall_score=res["overall_score"],
            confidence_level=res["confidence_level"],
            dna_score=res["dna_score"],
            dental_score=res["dental_score"],
            physical_score=res["physical_score"],
            distinctive_score=res["distinctive_score"],
            temporal_geo_score=res["temporal_geo_score"],
            fingerprint_score=res["fingerprint_score"],
            weights_used_json=res["weights_used_json"],
            explanation_json=res["explanation_json"],
            status="Pending Review"
        ))

    # Evaluate UID-2024-W115 with MP-2024-0551
    uid_115 = db.query(UnidentifiedBody).filter_by(case_number="UID-2024-W115").first()
    if uid_115 and mp_551:
        res = evaluate_match_pair(uid_115, mp_551)
        db.add(ForensicMatchResult(
            uid_id=uid_115.id,
            mp_id=mp_551.id,
            overall_score=res["overall_score"],
            confidence_level=res["confidence_level"],
            dna_score=res["dna_score"],
            dental_score=res["dental_score"],
            physical_score=res["physical_score"],
            distinctive_score=res["distinctive_score"],
            temporal_geo_score=res["temporal_geo_score"],
            fingerprint_score=res["fingerprint_score"],
            weights_used_json=res["weights_used_json"],
            explanation_json=res["explanation_json"],
            status="Pending Review"
        ))

    # Add evidence items
    print("Seeding tamper-evident forensic evidence items...")
    evidence = [
        EvidenceItem(
            case_type="UID",
            case_id=uid_108.id if uid_108 else 1,
            item_title="Electropherogram DNA Profile - 16 Forensic STR Loci",
            category="DNA Profile",
            file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            file_size_bytes=2458900,
            chain_of_custody_log_json=json.dumps([
                {"officer": "Insp. Vikram Singh", "action": "Sample retrieved from river site", "timestamp": "2026-10-25 11:30:00"},
                {"officer": "Dr. Ananya Roy", "action": "Transferred to CFSL DNA Lab under cold chain", "timestamp": "2026-10-25 15:45:00"}
            ]),
            uploaded_by="Dr. Ananya Roy, MD"
        ),
        EvidenceItem(
            case_type="UID",
            case_id=uid_108.id if uid_108 else 1,
            item_title="Post-Mortem Odontogram & Dental Panoramic Radiograph (OPG)",
            category="Dental OPG",
            file_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
            file_size_bytes=4120300,
            chain_of_custody_log_json=json.dumps([
                {"officer": "Dr. Suresh Kumar", "action": "Forensic Odontology radiographic charting completed", "timestamp": "2026-10-26 10:15:00"}
            ]),
            uploaded_by="Dr. Suresh Kumar, MDS"
        ),
        EvidenceItem(
            case_type="UID",
            case_id=uid_108.id if uid_108 else 1,
            item_title="Clavicular Surgical Titanium Fixation Plate Radiograph",
            category="Personal Artifact",
            file_hash="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            file_size_bytes=1840200,
            chain_of_custody_log_json=json.dumps([
                {"officer": "Dr. Ananya Roy", "action": "X-ray confirmed orthopedic hardware with batch serial", "timestamp": "2026-10-26 14:00:00"}
            ]),
            uploaded_by="Dr. Ananya Roy, MD"
        )
    ]
    for ev in evidence:
        db.add(ev)
        
    # Initial audit logs
    audit = [
        AuditLog(
            user_id=1,
            user_email="investigator@nyaya.ai",
            action="CASE_REGISTERED",
            resource_type="UID_CASE",
            resource_id="UID-2024-W108",
            details="Registered new water recovery case from Okhla Barrage.",
            ip_address="127.0.0.1"
        ),
        AuditLog(
            user_id=2,
            user_email="pathologist@nyaya.ai",
            action="EVIDENCE_UPLOAD",
            resource_type="EVIDENCE",
            resource_id="EV-DNA-108",
            details="Attached 16 loci electropherogram STR chart.",
            ip_address="127.0.0.1"
        ),
        AuditLog(
            user_id=1,
            user_email="investigator@nyaya.ai",
            action="MATCH_EXECUTION",
            resource_type="MATCH_ENGINE",
            resource_id="UID-2024-W108",
            details="Executed explainable multi-modal matching engine across 4 missing person records.",
            ip_address="127.0.0.1"
        )
    ]
    for a in audit:
        db.add(a)

    db.commit()
    print("Database seeding completed successfully!")
