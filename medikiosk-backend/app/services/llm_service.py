import json
import re

from app.config import GEMINI_API_KEY, GEMINI_MODEL, MOCK_MODE

if GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _mock_response(system_prompt: str) -> dict:
    """Canned response fallback when MOCK_MODE is explicitly active."""
    if "extraction" in system_prompt.lower():
        return {
            "diagnoses": ["Type 2 Diabetes Mellitus"],
            "medications": ["Metformin 500mg"],
            "investigations": ["FBS 140 mg/dL"],
            "document_date": "2026-07-02",
        }
    if "summary" in system_prompt.lower():
        return {
            "chief_complaint": "Chest pain since 2 hours",
            "hpi": "Sudden onset, radiating to left arm, associated sweating.",
            "past_history": "Type 2 Diabetes Mellitus",
            "drugs_allergies": "Metformin 500mg. No known allergies.",
            "family_history": "Not elicited.",
            "ros": "No other systemic complaints reported.",
            "investigations_summary": "FBS 140 mg/dL (12 Aug).",
        }
    return {
        "ai_question": "Does the pain spread to your arm or jaw?",
        "options": ["Yes", "No"],
        "is_complete": False,
        "red_flag": False,
        "red_flag_reason": None,
    }


def call_llm(system_prompt: str, conversation: list[dict], user_message: str) -> dict:
    """
    conversation: list of {"role": "user"|"model"|"patient"|"ai", "content": str}
    Returns a parsed dict. Calls Google Gemini API in real mode.
    """
    if MOCK_MODE:
        return _mock_response(system_prompt)

    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)

    # Use JSON mode for strict structured output from Gemini
    generation_config = {"response_mime_type": "application/json"}

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_prompt,
        generation_config=generation_config,
    )

    history = []
    for t in conversation:
        role = "model" if t.get("role") in ["ai", "model"] else "user"
        history.append({"role": role, "parts": [t.get("content", "")]})

    chat = model.start_chat(history=history)

    try:
        response = chat.send_message(user_message)
        cleaned_text = _strip_code_fences(response.text)
        return json.loads(cleaned_text)
    except (json.JSONDecodeError, ValueError):
        retry = chat.send_message(
            "Your last reply was not valid JSON. Respond again with ONLY valid JSON schema matching the instruction."
        )
        cleaned_text = _strip_code_fences(retry.text)
        return json.loads(cleaned_text)

