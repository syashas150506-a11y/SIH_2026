import sys
import os
from pathlib import Path
from gtts import gTTS

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def generate_patient_speech(file_path: str, text: str = None):
    """
    Generates a realistic patient voice recording for pipeline testing using gTTS.
    """
    if text is None:
        text = (
            "Hello Doctor. I have had a severe headache since yesterday morning. "
            "It is on the right side of my head and throbbing. I feel a bit nauseous too. "
            "I took paracetamol last night but it didn't help much."
        )

    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    print(f"🎙️ Synthesizing realistic patient speech audio...")
    tts = gTTS(text=text, lang='en', slow=False)
    
    # Save as mp3 or wav
    tts.save(str(path))
    print(f"✅ Generated sample patient voice file: {path.resolve()}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "sample_patient_voice.mp3"
    generate_patient_speech(out_file)
