import json
import math
import datetime
from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if None in (lat1, lon1, lat2, lon2):
        return 0.0
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_dna_score(uid_dna_str: str, mp_dna_str: str) -> Tuple[float, List[str], List[str]]:
    """
    Forensic STR Loci comparison (16-24 loci standard).
    Handles direct comparison, kinship half-sharing, and water degradation drop-outs.
    """
    positive_notes = []
    discrepancy_notes = []
    
    if not uid_dna_str or not mp_dna_str:
        return 50.0, ["DNA profile unavailable or pending lab amplification"], []
    
    try:
        uid_loci = json.loads(uid_dna_str)
        mp_loci = json.loads(mp_dna_str)
    except Exception:
        return 50.0, ["DNA data format non-standard"], []
        
    common_loci = set(uid_loci.keys()).intersection(set(mp_loci.keys()))
    if not common_loci:
        return 50.0, ["No overlapping amplified STR loci available"], []
        
    amplified_count = 0
    full_matches = 0
    partial_matches = 0
    mismatches = 0
    
    for locus in common_loci:
        uid_alleles = uid_loci[locus]
        mp_alleles = mp_loci[locus]
        
        # Check for dropout
        if not uid_alleles or "dropout" in [str(x).lower() for x in uid_alleles]:
            continue
        if not mp_alleles or "dropout" in [str(x).lower() for x in mp_alleles]:
            continue
            
        amplified_count += 1
        u_set = set(str(a) for a in uid_alleles)
        m_set = set(str(a) for a in mp_alleles)
        
        if u_set == m_set:
            full_matches += 1
        elif len(u_set.intersection(m_set)) >= 1:
            partial_matches += 1  # Sharing at least 1 allele (consistent with kinship or mutation)
        else:
            mismatches += 1
            discrepancy_notes.append(f"STR locus {locus} non-concordant: UID alleles {uid_alleles} vs MP {mp_alleles}")

    if amplified_count == 0:
        return 50.0, ["Degraded aquatic recovery: STR loci suffered amplification drop-out"], []
        
    score = ((full_matches * 1.0 + partial_matches * 0.5) / amplified_count) * 100.0
    
    if full_matches >= 10 and mismatches == 0:
        positive_notes.append(f"Strong STR concordance: {full_matches}/{amplified_count} loci identical without exclusionary mismatches")
    elif full_matches >= 6:
        positive_notes.append(f"Moderate STR concordance: {full_matches} identical loci, {partial_matches} shared alleles")
        
    return round(score, 1), positive_notes, discrepancy_notes


def calculate_dental_score(uid_dental_str: str, mp_dental_str: str) -> Tuple[float, List[str], List[str]]:
    """
    Forensic Odontology 32-Tooth Comparison Matrix.
    Forensic dental records survive severe water immersion and adipocere decomposition.
    """
    positive_notes = []
    discrepancy_notes = []
    
    if not uid_dental_str or not mp_dental_str:
        return 50.0, ["Dental chart pending specialist charting"], []
        
    try:
        uid_teeth = json.loads(uid_dental_str)
        mp_teeth = json.loads(mp_dental_str)
    except Exception:
        return 50.0, ["Dental record format non-standard"], []
        
    restoration_types = {"amalgam_filling", "composite", "crown_ceramic", "crown_gold", "implant", "rct"}
    
    matching_restorations = 0
    matching_missing_antemortem = 0
    intact_matches = 0
    severe_conflicts = 0
    evaluated_teeth = 0
    
    for tooth_num, uid_status in uid_teeth.items():
        if tooth_num in mp_teeth:
            evaluated_teeth += 1
            mp_status = mp_teeth[tooth_num]
            
            # Exact restoration match (Very high evidentiary value)
            if uid_status == mp_status and uid_status in restoration_types:
                matching_restorations += 1
                positive_notes.append(f"Tooth #{tooth_num}: Concordant {uid_status.replace('_', ' ').title()}")
            elif uid_status == mp_status and uid_status == "missing_antemortem":
                matching_missing_antemortem += 1
                positive_notes.append(f"Tooth #{tooth_num}: Antemortem absence matches")
            elif uid_status == "intact" and mp_status == "intact":
                intact_matches += 1
            elif uid_status == "missing_postmortem" and mp_status in ["intact", "amalgam_filling"]:
                # River rock trauma or post-mortem water avulsion is common
                pass
            elif mp_status == "missing_antemortem" and uid_status == "intact":
                # Anatomical conflict! If tooth was extracted years ago, UID cannot have it intact.
                severe_conflicts += 1
                discrepancy_notes.append(f"Odontology conflict: Tooth #{tooth_num} was extracted antemortem in MP, but intact in UID")
                
    if evaluated_teeth == 0:
        return 50.0, ["No overlapping dental entries"], []
        
    base_score = 50.0
    # Restorations and antemortem extractions are highly specific
    base_score += matching_restorations * 18.0
    base_score += matching_missing_antemortem * 10.0
    base_score += (intact_matches / evaluated_teeth) * 20.0
    base_score -= severe_conflicts * 35.0
    
    final_score = max(5.0, min(99.0, base_score))
    return round(final_score, 1), positive_notes, discrepancy_notes


def calculate_physical_score(uid_case: Any, mp_record: Any) -> Tuple[float, List[str], List[str]]:
    """
    Biological profile comparison: Biological Sex, Stature (Height), Age interval, Blood Group.
    """
    positive_notes = []
    discrepancy_notes = []
    
    # Sex check
    uid_sex = (uid_case.biological_sex or "Indeterminate").capitalize()
    mp_sex = (mp_record.biological_sex or "Unknown").capitalize()
    
    if uid_sex != "Indeterminate" and mp_sex != "Unknown" and uid_sex != mp_sex:
        discrepancy_notes.append(f"Biological sex mismatch: UID is {uid_sex}, MP recorded as {mp_sex}")
        return 10.0, positive_notes, discrepancy_notes
        
    score = 70.0
    
    # Height comparison
    mp_h = float(mp_record.height) if mp_record.height else None
    if mp_h and uid_case.estimated_height_min and uid_case.estimated_height_max:
        h_min = float(uid_case.estimated_height_min)
        h_max = float(uid_case.estimated_height_max)
        if h_min <= mp_h <= h_max:
            score += 15.0
            positive_notes.append(f"Stature consistent: MP height {mp_h}cm is within estimated range ({h_min}-{h_max}cm)")
        elif (h_min - 4.0) <= mp_h <= (h_max + 4.0):
            score += 8.0
            positive_notes.append(f"Stature borderline: MP height {mp_h}cm within ±4cm margin of error")
        else:
            score -= 20.0
            discrepancy_notes.append(f"Height divergence: MP is {mp_h}cm vs UID estimated range {h_min}-{h_max}cm")

    # Age comparison
    mp_age = int(mp_record.age) if mp_record.age else None
    if mp_age and uid_case.estimated_age_min and uid_case.estimated_age_max:
        a_min = int(uid_case.estimated_age_min)
        a_max = int(uid_case.estimated_age_max)
        if a_min <= mp_age <= a_max:
            score += 15.0
            positive_notes.append(f"Age concordance: MP age {mp_age} yrs falls within estimated osteological age ({a_min}-{a_max} yrs)")
        elif (a_min - 4) <= mp_age <= (a_max + 4):
            score += 8.0
            positive_notes.append(f"Age plausible: MP age {mp_age} yrs within ±4 yrs biological variation")
        else:
            score -= 15.0
            discrepancy_notes.append(f"Age discrepancy: MP age {mp_age} yrs vs UID estimated range {a_min}-{a_max} yrs")

    # Blood group comparison
    if uid_case.blood_group and mp_record.blood_group:
        if uid_case.blood_group not in ["Unknown/Hemolyzed", "Unknown"]:
            if uid_case.blood_group == mp_record.blood_group:
                score += 5.0
                positive_notes.append(f"Blood group match: {uid_case.blood_group}")
            else:
                score -= 15.0
                discrepancy_notes.append(f"Blood group conflict: UID {uid_case.blood_group} vs MP {mp_record.blood_group}")
        else:
            positive_notes.append("Blood group hemolyzed due to water immersion; omitted from penalty")

    return round(max(5.0, min(100.0, score)), 1), positive_notes, discrepancy_notes


def calculate_distinctive_score(uid_marks: str, mp_marks: str) -> Tuple[float, List[str], List[str]]:
    """
    Analyzes tattoos, orthopedic hardware, scars, surgical implants using TF-IDF and key terms.
    """
    positive_notes = []
    discrepancy_notes = []
    
    if not uid_marks or not mp_marks:
        return 40.0, ["No specific distinguishing marks recorded for comparison"], []
        
    text1 = uid_marks.lower().strip()
    text2 = mp_marks.lower().strip()
    
    # Exact keyword check for high-value forensic markers
    keywords = [
        "trishul", "tattoo", "om", "dragon", "scar", "appendectomy",
        "titanium", "plate", "rod", "piercing", "mole", "amputation",
        "fracture", "burn", "deformity", "implant", "cross", "peacock"
    ]
    
    matched_keywords = [kw for kw in keywords if kw in text1 and kw in text2]
    
    # TF-IDF Cosine Similarity
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([text1, text2])
        cosine_sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
    except Exception:
        cosine_sim = 0.0
        
    score = 30.0 + (cosine_sim * 45.0) + (len(matched_keywords) * 15.0)
    
    if matched_keywords:
        positive_notes.append(f"Distinctive marker alignment: Shared indicators '{', '.join(matched_keywords)}'")
    if cosine_sim > 0.4:
        positive_notes.append(f"High text semantic congruence ({int(cosine_sim*100)}%) in physical descriptors")
        
    return round(max(10.0, min(99.0, score)), 1), positive_notes, discrepancy_notes


def calculate_temporal_geo_score(uid_case: Any, mp_record: Any) -> Tuple[float, List[str], List[str]]:
    """
    Calculates Post-Mortem Interval (PMI) plausibility and Downstream River/Geospatial correlation.
    """
    positive_notes = []
    discrepancy_notes = []
    
    score = 70.0
    
    # Temporal comparison
    try:
        rec_date = datetime.datetime.strptime(uid_case.recovery_date, "%Y-%m-%d").date()
        disp_date = datetime.datetime.strptime(mp_record.disappearance_date, "%Y-%m-%d").date()
        days_elapsed = (rec_date - disp_date).days
        
        if days_elapsed < 0:
            discrepancy_notes.append(f"Anachronism: Body recovered before reported missing date ({days_elapsed} days)")
            return 5.0, positive_notes, discrepancy_notes
            
        pmi_min = uid_case.estimated_pmi_min_days or 1
        pmi_max = uid_case.estimated_pmi_max_days or 10
        
        # In water, Casper's dictum applies: decomposition is 2x slower than air
        if pmi_min - 2 <= days_elapsed <= pmi_max + 4:
            score += 20.0
            positive_notes.append(f"Temporal window optimal: Disappeared {days_elapsed} days prior to recovery, matching estimated PMI of {pmi_min}-{pmi_max} days")
        elif days_elapsed < pmi_min - 2:
            score -= 15.0
            discrepancy_notes.append(f"Temporal tension: Body decomposition suggests {pmi_min}+ days, but disappeared only {days_elapsed} days prior")
        else:
            score -= 20.0
            discrepancy_notes.append(f"Disappeared {days_elapsed} days ago, exceeding maximum estimated PMI of {pmi_max} days")
    except Exception as e:
        positive_notes.append(f"Temporal estimation based on reported narrative: {e}")

    # Geospatial comparison
    if (uid_case.recovery_lat and uid_case.recovery_lng and
        mp_record.last_seen_lat and mp_record.last_seen_lng):
        dist_km = haversine_distance_km(
            uid_case.recovery_lat, uid_case.recovery_lng,
            mp_record.last_seen_lat, mp_record.last_seen_lng
        )
        if dist_km <= 35.0:
            score += 15.0
            positive_notes.append(f"Geographic proximity consistent: Recovery site is {round(dist_km, 1)} km from last seen area (within hydrological drift corridor)")
        elif dist_km <= 100.0:
            score += 5.0
            positive_notes.append(f"Recovery site is {round(dist_km, 1)} km from last seen area (plausible river flow or transport)")
        else:
            score -= 20.0
            discrepancy_notes.append(f"Geographic distance {round(dist_km, 1)} km exceeds standard water drift radius without motorized transport")

    return round(max(5.0, min(100.0, score)), 1), positive_notes, discrepancy_notes


def evaluate_match_pair(uid_case: Any, mp_record: Any) -> Dict[str, Any]:
    """
    Master Multi-Modal Forensic Evaluation with Dynamic Degradation Weighting.
    """
    dna_score, dna_pos, dna_disc = calculate_dna_score(uid_case.dna_str_profile_json, mp_record.dna_str_profile_json)
    dental_score, dental_pos, dental_disc = calculate_dental_score(uid_case.dental_record_json, mp_record.dental_record_json)
    phys_score, phys_pos, phys_disc = calculate_physical_score(uid_case, mp_record)
    dist_score, dist_pos, dist_disc = calculate_distinctive_score(uid_case.distinguishing_marks, mp_record.distinguishing_marks)
    temp_score, temp_pos, temp_disc = calculate_temporal_geo_score(uid_case, mp_record)
    
    # Water immersion condition check
    is_water_case = bool(uid_case.water_body_type and uid_case.water_body_type != "None")
    fingerprints_degraded = (
        "degraded" in (uid_case.fingerprint_status or "").lower() or
        "maceration" in (uid_case.fingerprint_status or "").lower() or
        not mp_record.has_fingerprint_record
    )
    
    # Dynamic Weight Allocation
    if fingerprints_degraded:
        # Standard water recovery re-weighting
        weights = {
            "dna": 0.35,
            "dental": 0.30,
            "distinctive": 0.15,
            "physical": 0.10,
            "temporal_geo": 0.10,
            "fingerprint": 0.00
        }
        fp_score = 0.0
    else:
        weights = {
            "dna": 0.30,
            "dental": 0.25,
            "fingerprint": 0.15,
            "distinctive": 0.12,
            "physical": 0.10,
            "temporal_geo": 0.08
        }
        fp_score = uid_case.fingerprint_minutiae_score or 75.0

    overall_score = (
        dna_score * weights["dna"] +
        dental_score * weights["dental"] +
        phys_score * weights["physical"] +
        dist_score * weights["distinctive"] +
        temp_score * weights["temporal_geo"] +
        fp_score * weights["fingerprint"]
    )
    
    # Cap and classify
    overall_score = round(max(0.0, min(99.4, overall_score)), 1)
    
    if overall_score >= 82.0:
        confidence = "High Probability Lead"
    elif overall_score >= 65.0:
        confidence = "Moderate Lead"
    elif overall_score >= 40.0:
        confidence = "Low Compatibility"
    else:
        confidence = "Excluded / Incompatible"
        
    all_positive = dna_pos + dental_pos + phys_pos + dist_pos + temp_pos
    all_discrepancies = dna_disc + dental_disc + phys_disc + dist_disc + temp_disc
    
    # Generate Pathologist Guidance
    if overall_score >= 80.0:
        guidance = "Recommended Action: Priority review by Forensic Odontologist & DNA Analyst. Request antemortem dental radiographs and direct reference DNA from first-degree kin for judicial confirmation."
    elif overall_score >= 65.0:
        guidance = "Recommended Action: Secondary review. Compare specific photographic evidence of scars/tattoos and verify timeline of river current velocity."
    else:
        guidance = "Recommended Action: Retain as low-priority automated index. Check alternative jurisdictions or broader missing person registry."

    explanation = {
        "confidence_level": confidence,
        "overall_percentage": overall_score,
        "is_water_immersion_case": is_water_case,
        "water_condition_note": uid_case.immersion_stage,
        "weights_applied": weights,
        "positive_concordances": all_positive,
        "identified_discrepancies": all_discrepancies,
        "pathologist_guidance": guidance,
        "summary": f"Calculated {confidence} ({overall_score}%) based on multi-attribute forensic concordance matrix."
    }

    return {
        "overall_score": overall_score,
        "confidence_level": confidence,
        "dna_score": dna_score,
        "dental_score": dental_score,
        "physical_score": phys_score,
        "distinctive_score": dist_score,
        "temporal_geo_score": temp_score,
        "fingerprint_score": fp_score if not fingerprints_degraded else None,
        "weights_used_json": json.dumps(weights),
        "explanation_json": json.dumps(explanation)
    }
