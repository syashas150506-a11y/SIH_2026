import os
import sys
import json
import re
from typing import Dict, Any, Optional

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

class ClinicalFormatter:
    """
    Converts raw patient voice transcripts into structured, physician-ready SOAP notes.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._genai_client = None

        if self.api_key:
            try:
                from google import genai
                self._genai_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[Warning] Failed to initialize Gemini Client: {e}. Falling back to rule-based formatter.")

    def format_transcript(self, raw_transcript: str) -> Dict[str, Any]:
        """
        Main entry point to convert raw patient transcript into structured clinical data.
        Returns a dict containing SOAP note sections and formatted text.
        """
        if not raw_transcript or not raw_transcript.strip():
            return {
                "error": "Empty transcript provided.",
                "raw_transcript": "",
                "soap_note": {}
            }

        # Try AI structuring if available
        if self._genai_client:
            try:
                return self._format_with_ai(raw_transcript)
            except Exception as e:
                print(f"[Warning] AI structuring failed ({e}). Using rule-based fallback.")

        # Fallback to rule-based parsing
        return self._format_rule_based(raw_transcript)

    def _format_with_ai(self, raw_transcript: str) -> Dict[str, Any]:
        """Uses Gemini API to structure conversational patient speech into a SOAP note."""
        prompt = f"""
You are an expert AI clinical assistant for hospital kiosks and physician triage.
Analyze the following patient raw transcript recorded at a clinic kiosk:

<PATIENT_TRANSCRIPT>
{raw_transcript}
</PATIENT_TRANSCRIPT>

Convert this raw transcript into a physician-ready medical summary structured strictly as JSON with the following keys:
1. "chief_complaint": Concise statement of primary complaint (e.g. "Severe right-sided headache, nausea").
2. "history_of_present_illness": Detailed chronological narrative based on patient description (onset, duration, severity, location, relieving/aggravating factors).
3. "reported_symptoms": List of distinct symptoms mentioned.
4. "medications_and_treatments": Any self-medication, past treatments, or active medications mentioned.
5. "past_medical_history": Any past illnesses or chronic conditions mentioned, or "None mentioned".
6. "triage_priority": Suggested urgency ("Low", "Medium", "High", "Emergency") based on reported symptoms.
7. "summary_for_physician": 2-3 sentence executive bulleted summary for quick physician review.

Return ONLY valid JSON matching this schema.
"""
        response = self._genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        text = response.text.strip()
        # Clean JSON markdown fences if present
        text = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"^```\s*", "", text, flags=re.MULTILINE)
        text = text.strip()

        try:
            parsed = json.loads(text)
            parsed["raw_transcript"] = raw_transcript
            parsed["markdown_formatted"] = self.to_markdown(parsed)
            return parsed
        except json.JSONDecodeError:
            return self._format_rule_based(raw_transcript)

    def _format_rule_based(self, raw_transcript: str) -> Dict[str, Any]:
        """Rule-based clinical extraction fallback."""
        symptoms = []
        meds = []
        
        # Simple heuristic extraction
        words = raw_transcript.lower()
        
        symptom_keywords = [
            "headache", "fever", "cough", "nausea", "vomiting", "pain", "chest pain",
            "dizziness", "fatigue", "chills", "sore throat", "stomach ache", "cramps",
            "shortness of breath", "swelling", "rash"
        ]
        
        for keyword in symptom_keywords:
            if keyword in words:
                symptoms.append(keyword.capitalize())

        med_keywords = ["paracetamol", "aspirin", "ibuprofen", "tylenol", "antibiotic", "medicine", "pill"]
        for med in med_keywords:
            if med in words:
                meds.append(med.capitalize())

        parsed = {
            "chief_complaint": symptoms[0] if symptoms else "Patient self-reported consultation at kiosk",
            "history_of_present_illness": raw_transcript,
            "reported_symptoms": symptoms if symptoms else ["Not explicitly categorized"],
            "medications_and_treatments": meds if meds else ["None mentioned"],
            "past_medical_history": "Not mentioned",
            "triage_priority": "High" if any(s in words for s in ["chest pain", "shortness of breath", "severe"]) else "Routine",
            "summary_for_physician": f"Patient reports: {raw_transcript[:150]}..." if len(raw_transcript) > 150 else raw_transcript,
            "raw_transcript": raw_transcript
        }
        parsed["markdown_formatted"] = self.to_markdown(parsed)
        return parsed

    def to_markdown(self, clinical_data: Dict[str, Any]) -> str:
        """Renders the clinical data dict into a clean Markdown report for physicians."""
        md = []
        md.append("# 🏥 Patient Clinical Summary (Physician Ready)")
        
        token_info = clinical_data.get("token_info", {})
        if token_info:
            md.append("```")
            md.append("============================================================")
            md.append(f"🎫 APPOINTMENT TOKEN:  [{token_info.get('token_id', 'N/A')}]")
            md.append(f"🚨 TRIAGE PRIORITY:   {token_info.get('triage_priority', 'Routine').upper()}")
            md.append(f"🏢 DEPARTMENT:        {token_info.get('assigned_department', 'N/A')}")
            md.append(f"🚪 ASSIGNED ROOM:     {token_info.get('assigned_room', 'N/A')}")
            md.append(f"⏱️ ESTIMATED WAIT:    {token_info.get('estimated_wait_time', 'N/A')}")
            md.append("============================================================")
            md.append("```\n")
        else:
            md.append(f"**Triage Urgency Level**: `{clinical_data.get('triage_priority', 'Routine')}`\n")
        
        md.append("## 📌 Chief Complaint (CC)")
        md.append(f"- {clinical_data.get('chief_complaint', 'N/A')}\n")
        
        md.append("## 📜 History of Present Illness (HPI)")
        md.append(f"{clinical_data.get('history_of_present_illness', 'N/A')}\n")
        
        md.append("## 🩺 Reported Symptoms")
        symptoms = clinical_data.get("reported_symptoms", [])
        if isinstance(symptoms, list):
            for item in symptoms:
                md.append(f"- {item}")
        else:
            md.append(f"- {symptoms}")
        md.append("")

        md.append("## 💊 Current Medications & Interventions")
        meds = clinical_data.get("medications_and_treatments", [])
        if isinstance(meds, list):
            for item in meds:
                md.append(f"- {item}")
        else:
            md.append(f"- {meds}")
        md.append("")

        md.append("## 👨‍⚕️ Executive Summary for Physician")
        md.append(f"{clinical_data.get('summary_for_physician', 'N/A')}\n")

        md.append("---")
        md.append("### 🎙️ Raw Patient Audio Transcript")
        md.append(f"> \"{clinical_data.get('raw_transcript', '')}\"")

        return "\n".join(md)
