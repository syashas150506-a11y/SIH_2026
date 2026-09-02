import os
import sys
import json
import random
from pathlib import Path
from typing import Dict, Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

class KioskManager:
    """
    Manages interactive kiosk triage, appointment token generation,
    department routing, estimated wait time, and voice announcements.
    """

    def __init__(self, counter_file: str = "outputs/token_counter.txt"):
        self.counter_file = Path(counter_file)
        self.counter_file.parent.mkdir(parents=True, exist_ok=True)
        self._token_counter = self._load_counter()

    def _load_counter(self) -> int:
        if self.counter_file.exists():
            try:
                with open(self.counter_file, "r") as f:
                    return int(f.read().strip())
            except Exception:
                pass
        return 101

    def _save_counter(self):
        try:
            with open(self.counter_file, "w") as f:
                f.write(str(self._token_counter))
        except Exception as e:
            print(f"⚠️ Warning: Could not save token counter: {e}", file=sys.stderr)

    def generate_token(self) -> str:
        token_str = f"TK-{self._token_counter}"
        self._token_counter += 1
        self._save_counter()
        return token_str

    def process_patient_triage(self, clinical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes clinical data to produce appointment token, department, room,
        wait time, and voice script.
        """
        token_id = self.generate_token()
        triage_priority = clinical_data.get("triage_priority", "Routine")
        raw_transcript = clinical_data.get("raw_transcript", "").lower()
        symptoms = [s.lower() for s in clinical_data.get("reported_symptoms", [])]

        # Determine department & room based on symptoms
        if triage_priority == "Emergency" or any(w in raw_transcript for w in ["chest pain", "shortness of breath", "severe pain", "bleeding", "unconscious"]):
            department = "Emergency Care Unit (ECU)"
            room = "Room 1 (Triage Bay)"
            triage_priority = "Emergency"
            wait_time = "0 mins (Immediate Attention)"
        elif any(w in raw_transcript for w in ["headache", "dizziness", "migraine", "numbness"]):
            department = "Neurology OPD"
            room = "Room 204"
            wait_time = "10 to 15 mins"
        elif any(w in raw_transcript for w in ["fever", "cough", "cold", "flu", "sore throat"]):
            department = "General Medicine OPD"
            room = "Room 102"
            wait_time = "15 to 20 mins"
        elif any(w in raw_transcript for w in ["stomach", "nausea", "vomiting", "diarrhea", "cramps"]):
            department = "Gastroenterology OPD"
            room = "Room 105"
            wait_time = "15 to 20 mins"
        elif any(w in raw_transcript for w in ["skin", "rash", "itching"]):
            department = "Dermatology OPD"
            room = "Room 301"
            wait_time = "20 to 25 mins"
        else:
            department = "General Medicine OPD"
            room = "Room 102"
            wait_time = "15 to 20 mins"

        # Voice Announcement Script
        if triage_priority == "Emergency":
            voice_script = (
                f"Attention. Your appointment token is {token_id}. "
                f"Your status is marked as High Priority Emergency. "
                f"Please report immediately to the {department}, {room}. "
                f"A nurse has been notified."
            )
        else:
            voice_script = (
                f"Thank you. Your symptoms have been analyzed. "
                f"Your appointment token number is {token_id}. "
                f"Your priority status is {triage_priority}. "
                f"Please proceed to {department}, {room}. "
                f"Your estimated wait time is {wait_time}. "
                f"Your summary is sent to the physician."
            )

        token_info = {
            "token_id": token_id,
            "triage_priority": triage_priority,
            "assigned_department": department,
            "assigned_room": room,
            "estimated_wait_time": wait_time,
            "voice_script": voice_script
        }

        # Format ASCII Token Pass Card for display
        ascii_card = f"""
============================================================
🏥  PATIENT KIOSK - APPOINTMENT TOKEN PASS
============================================================
  🎫 TOKEN NUMBER:      [{token_id}]
  🚨 TRIAGE PRIORITY:   {triage_priority.upper()}
  🏢 DEPARTMENT:        {department}
  🚪 ASSIGNED ROOM:     {room}
  ⏱️ ESTIMATED WAIT:    {wait_time}
============================================================
"""
        token_info["ascii_card"] = ascii_card
        return token_info

if __name__ == "__main__":
    km = KioskManager()
    sample_clinical = {
        "triage_priority": "Routine",
        "raw_transcript": "I have had a headache and fever for 2 days",
        "reported_symptoms": ["Headache", "Fever"]
    }
    res = km.process_patient_triage(sample_clinical)
    print(res["ascii_card"])
    print("Voice Script:", res["voice_script"])
