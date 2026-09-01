import os
import re
import sys
import subprocess
import asyncio

from faster_whisper import WhisperModel
from google import genai
from dotenv import load_dotenv
import edge_tts

load_dotenv()

print("\n========== MediKiosk ==========\n")

# =========================================================
# SETTINGS
# =========================================================

MAX_QUESTIONS = 6

# =========================================================
# WHISPER
# =========================================================

print("Loading Whisper...")

whisper_model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

# =========================================================
# GEMINI
# =========================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# =========================================================
# RECORD VOICE
# =========================================================

def record_voice():

    subprocess.run(
        [sys.executable, "mic_test.py"],
        check=True
    )


# =========================================================
# SPEECH TO TEXT
# =========================================================

def speech_to_text():

    segments, info = whisper_model.transcribe(
        "mic_audio.wav",
        task="transcribe",
        beam_size=1,
        vad_filter=True
    )

    text = " ".join(
        segment.text for segment in segments
    ).strip()

    return text, info.language


# =========================================================
# TEXT TO SPEECH
# =========================================================

async def make_voice(text, language):

    text = re.sub(r"[*#_`]", "", text)

    voices = {
        "kn": "kn-IN-SapnaNeural",
        "hi": "hi-IN-SwaraNeural",
        "ta": "ta-IN-PallaviNeural",
        "te": "te-IN-ShrutiNeural",
        "ml": "ml-IN-SobhanaNeural",
        "en": "en-IN-NeerjaNeural"
    }

    voice = voices.get(
        language,
        "en-IN-NeerjaNeural"
    )

    communicate = edge_tts.Communicate(
        text,
        voice
    )

    await communicate.save("response.mp3")


def speak(text, language):

    try:
        asyncio.run(
            make_voice(text, language)
        )

        os.startfile("response.mp3")

    except Exception as e:

        print("TTS warning:", e)


# =========================================================
# GEMINI
# =========================================================

def ask_gemini(conversation):

    prompt = f"""
You are MediKiosk, a multilingual voice-based health
symptom assessment assistant.

Your ONLY job is to collect information by asking
ONE short question at a time.

IMPORTANT LANGUAGE RULE:

The user's speech may be Kannada, Hindi, Tamil, Telugu,
Malayalam, English, or another language.

Identify the language from the user's ORIGINAL answer.

Reply in the SAME LANGUAGE as the user's latest answer.

Do NOT automatically use English.
Do NOT automatically use Kannada.
Do NOT switch language unnecessarily.

IMPORTANT MEDICAL RULES:

Do NOT diagnose a disease.

Do NOT prescribe medicine.

Do NOT recommend medicine.

Do NOT give long health advice.

Your job is ONLY to ask relevant questions.

Ask questions dynamically based on what the user says.

Possible information to collect when relevant:

- Main health complaint
- Duration
- Age
- Sex
- Pregnancy possibility
- Severity
- Location
- Associated symptoms
- Existing medical conditions
- Current medicines
- Important warning signs

Do NOT ask irrelevant questions.

Ask exactly ONE question.

If an obvious emergency symptom is reported, respond exactly:

EMERGENCY: Please seek immediate medical attention.

Conversation:

{conversation}

Now ask the SINGLE most important next question.

Return ONLY the question.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text.strip()


# =========================================================
# WELCOME
# =========================================================

welcome = (
    "ನಮಸ್ಕಾರ! MediKiosk ಗೆ ಸುಸ್ವಾಗತ. "
    "ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ. "
    "ನಾನು ಕೆಲವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತೇನೆ."
)

print("🩺 MediKiosk:", welcome)

# Welcome is always Kannada
speak(welcome, "kn")


# =========================================================
# FIRST QUESTION
# =========================================================

question = "ನಿಮಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಇದೆ?"

print("\n🩺 MediKiosk:", question)

speak(question, "kn")


# =========================================================
# CONVERSATION
# =========================================================

conversation = []

# =========================================================
# QUESTION LOOP
# =========================================================

for question_number in range(MAX_QUESTIONS):

    print("\n--------------------------------")
    print(f"Question {question_number + 1}/{MAX_QUESTIONS}")
    print("--------------------------------")

    print("\n🎤 Your turn...")

    # Record
    record_voice()

    # Convert speech to text
    print("📝 Converting voice to text...")

    user_text, detected_language = speech_to_text()

    # Empty recording
    if not user_text:

        print("⚠️ No speech detected.")

        retry = "ನಿಮ್ಮ ಮಾತು ಸರಿಯಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ."

        print("🩺 MediKiosk:", retry)

        speak(retry, "kn")

        continue

    print("\n👤 User:", user_text)

    print(
        "🌐 Whisper language:",
        detected_language
    )

    # Store user answer
    conversation.append(
        f"User: {user_text}"
    )

    # =====================================================
    # GEMINI
    # =====================================================

    print("\n🤖 MediKiosk is thinking...")

    try:

        next_question = ask_gemini(
            "\n".join(conversation)
        )

    except Exception as e:

        print("\n❌ Gemini error:")
        print(e)

        print(
            "\n⚠️ Gemini request failed."
        )

        break

    # =====================================================
    # EMERGENCY
    # =====================================================

    if next_question.startswith("EMERGENCY:"):

        emergency_message = (
            "ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. "
            "ದಯವಿಟ್ಟು ತಕ್ಷಣ ಹತ್ತಿರದ ವೈದ್ಯರನ್ನು "
            "ಅಥವಾ ತುರ್ತು ಚಿಕಿತ್ಸಾ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ."
        )

        print("\n🚨 MediKiosk:", emergency_message)

        # Try using detected language
        speak(
            emergency_message,
            detected_language
            if detected_language in
            ["kn", "hi", "ta", "te", "ml", "en"]
            else "kn"
        )

        break

    # =====================================================
    # NEXT QUESTION
    # =====================================================

    print("\n🩺 MediKiosk:", next_question)

    conversation.append(
        f"MediKiosk: {next_question}"
    )

    # =====================================================
    # VOICE
    # =====================================================

    language_for_voice = detected_language

    if language_for_voice not in [
        "kn",
        "hi",
        "ta",
        "te",
        "ml",
        "en"
    ]:
        language_for_voice = "en"

    speak(
        next_question,
        language_for_voice
    )


# =========================================================
# END
# =========================================================

print("\n========== MediKiosk DONE ==========\n")