from faster_whisper import WhisperModel
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

print("Loading Whisper...")

whisper_model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8"
)

print("Transcribing audio...")

segments, info = whisper_model.transcribe(
    "test_audio.mp3.mpeg",
    language="kn",
    task="transcribe",
    beam_size=5
)

transcript = " ".join(segment.text for segment in segments)

print("Detected language:", info.language)
print("User said:", transcript)

print("\nSending to Gemini...")

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=f"""
You are MediKiosk, a safe multilingual health assistant.

The user said:
{transcript}

Respond in Kannada.
Do not give a definite medical diagnosis.
Give general health guidance.
If symptoms could be an emergency, advise immediate medical care.
Ask relevant follow-up questions when needed.
Keep the response simple.
"""
)

print("\nMediKiosk Response:")
print(response.text)
