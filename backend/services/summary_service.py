def analyze_triage_and_summary(visit_reason: str, symptoms_text: str, scanned_text: str = "") -> tuple[str, str, bool]:
    """
    Analyzes patient intake input, detects emergency triage signals, 
    and synthesizes a structured clinical summary.
    
    Returns:
        (triage_severity, ai_summary, is_emergency)
    """
    text_lower = (visit_reason + " " + symptoms_text + " " + scanned_text).lower()
    
    # Critical keywords indicating immediate SOS emergency
    critical_keywords = [
        "chest pain", "heart attack", "stroke", "shortness of breath", "difficulty breathing",
        "unconscious", "fainting", "severe bleeding", "head trauma", "paralysis", "seizure",
        "high fever 104", "anaphylaxis", "sos", "emergency"
    ]
    
    high_keywords = [
        "fever", "fracture", "stomach pain", "vomiting", "dizziness", "infection",
        "burn", "deep cut", "dehydration"
    ]
    
    is_emergency = any(kw in text_lower for kw in critical_keywords)
    
    if is_emergency:
        severity = "CRITICAL_SOS"
    elif any(kw in text_lower for kw in high_keywords):
        severity = "HIGH"
    else:
        severity = "NORMAL"
        
    # Generate structured summary
    summary_parts = []
    summary_parts.append(f"• Visit Reason: {visit_reason.capitalize()}")
    if symptoms_text:
        summary_parts.append(f"• Reported Symptoms: {symptoms_text}")
    if scanned_text:
        summary_parts.append(f"• Document Findings: {scanned_text}")
        
    if severity == "CRITICAL_SOS":
        summary_parts.append("🚨 CLINICAL TRIAGE WARNING: Patient exhibits high-risk urgent symptoms. Immediate physician attention required.")
    elif severity == "HIGH":
        summary_parts.append("⚠️ CLINICAL NOTE: Priority intake recommended due to moderate-high symptom profile.")
    else:
        summary_parts.append("✓ CLINICAL NOTE: Standard consultation intake.")
        
    ai_summary = "\n".join(summary_parts)
    return severity, ai_summary, is_emergency
