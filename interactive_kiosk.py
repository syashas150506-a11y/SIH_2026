import sys
import time
import argparse
import threading
import json
import numpy as np
import sounddevice as sd
import soundfile as sf
from pathlib import Path
import whisper

from tts_engine import TTSEngine
from kiosk_manager import KioskManager
from clinical_formatter import ClinicalFormatter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def run_interactive_kiosk(device_index: int = None, model_name: str = "base", language: str = "auto", enable_voice: bool = True):
    """
    Main interactive hospital kiosk workflow with spoken Voice TTS feedback,
    symptom recording, clinical SOAP note structuring, and appointment token generation.
    """
    tts = TTSEngine() if enable_voice else None
    kiosk_mgr = KioskManager()
    formatter = ClinicalFormatter()

    print("\n============================================================")
    print("🏥  PATIENT INTERACTIVE VOICE KIOSK (SIH 2026)")
    print("============================================================\n")

    welcome_msg = "Welcome to the Patient Kiosk. Press ENTER when ready, then describe your symptoms clearly."
    if tts:
        tts.speak(welcome_msg)
    else:
        print(f"💬 {welcome_msg}")

    print("\n👉 Press ENTER to start recording your symptoms...")
    input()

    # Determine input microphone device
    if device_index is not None:
        try:
            dev_info = sd.query_devices(device_index)
            print(f"🎙️  Using microphone: [{device_index}] {dev_info['name']}")
        except Exception:
            device_index = sd.default.device[0]
    else:
        device_index = sd.default.device[0]

    sample_rate = 16000
    audio_chunks = []

    def audio_callback(indata, frames, time_info, status):
        audio_chunks.append(indata.copy())

    stream = sd.InputStream(
        samplerate=sample_rate,
        channels=1,
        dtype='float32',
        device=device_index,
        callback=audio_callback
    )

    rec_msg = "Recording in progress. Speak freely about your symptoms. Press ENTER when finished."
    if tts:
        tts.speak_async(rec_msg)

    print("\n🔴 *** RECORDING IN PROGRESS ***")
    print("💬 Speak fully about your symptoms (onset, duration, severity, location)...")
    print("⏹️  PRESS [ENTER] WHEN YOU ARE FINISHED SPEAKING...\n")

    with stream:
        input()

    print("✅ Recording finished!\n")

    if not audio_chunks:
        print("❌ Error: No audio captured.")
        sys.exit(1)

    audio_flat = np.concatenate(audio_chunks, axis=0).flatten()
    max_amp = np.abs(audio_flat).max()
    if max_amp > 0.005:
        audio_flat = (audio_flat / max_amp) * 0.90

    output_dir = Path("outputs")
    output_dir.mkdir(parents=True, exist_ok=True)
    audio_path = output_dir / "kiosk_patient_recording.wav"
    sf.write(str(audio_path), audio_flat, sample_rate)

    proc_msg = "Processing your voice recording. Analyzing clinical symptoms. Please wait a moment."
    if tts:
        tts.speak_async(proc_msg)
    print(f"⏳ {proc_msg}\n")

    # Load Whisper & Transcribe
    stt_model = whisper.load_model(model_name)
    transcribe_args = {
        "temperature": 0.0,
        "condition_on_previous_text": False,
        "no_speech_threshold": 0.5,
        "task": "translate"
    }
    if language and language.lower() != "auto":
        transcribe_args["language"] = language

    result = stt_model.transcribe(audio_flat, **transcribe_args)
    raw_transcript = result.get("text", "").strip()
    detected_lang = result.get("language", "unknown")

    print(f"📝 Raw Patient Transcript (Language: {detected_lang}):")
    print(f"   \"{raw_transcript}\"\n")

    # Structure Clinical Data
    clinical_result = formatter.format_transcript(raw_transcript)
    clinical_result["detected_language"] = detected_lang

    # Process Kiosk Triage & Appointment Token
    token_info = kiosk_mgr.process_patient_triage(clinical_result)
    clinical_result["token_info"] = token_info

    # Update Markdown with token pass info
    clinical_result["markdown_formatted"] = formatter.to_markdown(clinical_result)

    # Save outputs
    json_path = output_dir / "kiosk_patient_summary.json"
    md_path = output_dir / "kiosk_patient_summary.md"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(clinical_result, f, indent=2, ensure_ascii=False)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(clinical_result["markdown_formatted"])

    # Display Token Pass on Screen
    print(token_info["ascii_card"])
    print(f"📄 Full Physician Summary saved to: {md_path.resolve().as_uri()}\n")

    # Voice Out Status & Token to Patient
    if tts:
        tts.speak(token_info["voice_script"])

    print("\n✅ Kiosk Session Complete!\n")

def main():
    parser = argparse.ArgumentParser(description="Interactive Voice Kiosk (SIH 2026)")
    parser.add_argument("--device", "-d", type=int, default=None, help="Microphone device ID")
    parser.add_argument("--model", "-m", default="base", help="Whisper model size")
    parser.add_argument("--language", "-l", default="auto", help="Language code or 'auto'")
    parser.add_argument("--no-voice", action="store_true", help="Disable spoken voice feedback")

    args = parser.parse_args()
    run_interactive_kiosk(
        device_index=args.device,
        model_name=args.model,
        language=args.language,
        enable_voice=not args.no_voice
    )

if __name__ == "__main__":
    main()
