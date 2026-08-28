RULES = [
    (["chest pain", "chest"], ["breathless", "shortness of breath", "sweating"],
     "Chest pain with breathlessness/sweating — possible cardiac emergency"),
    (["headache", "head"], ["vision", "confusion", "confused"],
     "Severe headache with vision changes/confusion — possible neurological emergency"),
    (["abdomen", "stomach", "abdominal"], ["vomiting blood", "blood in vomit"],
     "Abdominal pain with blood in vomit — possible GI emergency"),
]


def check_red_flags(conversation_text: str) -> tuple[bool, str | None]:
    text = conversation_text.lower()
    for site_terms, symptom_terms, reason in RULES:
        if any(s in text for s in site_terms) and any(sym in text for sym in symptom_terms):
            return True, reason
    return False, None
