import sys
import time
import argparse
import threading
import numpy as np
import sounddevice as sd
import soundfile as sf
from pathlib import Path
import whisper
from clinical_formatter import ClinicalFormatter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def list_microphones():
    """Prints all available audio input devices for user selection."""
    devices = sd.query_devices()
    print("\n🎤 --- AVAILABLE MICROPHONE DEVICES ---")
    input_devices = []
    for idx, dev in enumerate(devices):
        if dev['max_input_channels'] > 0:
            input_devices.append(idx)
            is_default = " [DEFAULT]" if idx == sd.default.device[0] else ""
            print(f"  [{idx}] {dev['name']}{is_default}")
    print("---------------------------------------\n")
    return input_devices

def record_continuous_voice(device_index: int = None, output_filename: str = "live_patient_recording.wav"):
    """
    Records continuous audio from microphone until the user presses ENTER.
    No time limits!
    """
    sample_rate = 16000  # 16kHz required by Whisper

    if device_index is not None:
        try:
            dev_info = sd.query_devices(device_index)
            print(f"🎙️  Using selected microphone: [{device_index}] {dev_info['name']}")
        except Exception as e:
            print(f"⚠️ Warning: Device [{device_index}] failed ({e}). Using default microphone.")
            device_index = sd.default.device[0]
    else:
        device_index = sd.default.device[0]
        dev_info = sd.query_devices(device_index)
        print(f"🎙️  Using microphone: [{device_index}] {dev_info['name']}")

    print("\n============================================================")
    input("👉 Press ENTER when you are ready to start recording...")
    print("============================================================\n")

    audio_chunks = []
    stop_event = threading.Event()

    def audio_callback(indata, frames, time_info, status):
        if status:
            print(f"⚠️ Stream status: {status}", file=sys.stderr)
        audio_chunks.append(indata.copy())

    # Start audio input stream
    stream = sd.InputStream(
        samplerate=sample_rate,
        channels=1,
        dtype='float32',
        device=device_index,
        callback=audio_callback
    )

    with stream:
        print("🔴 *** RECORDING IN PROGRESS ***")
        print("💬 Speak fully about your symptoms (Take all the time you need!)")
        print("⏹️  PRESS [ENTER] WHEN YOU ARE FINISHED SPEAKING...\n")
        input()  # Blocks until user presses ENTER
        stop_event.set()

    print("✅ Recording stopped! Processing audio...\n")

    if not audio_chunks:
        print("❌ Error: No audio data was captured.")
        sys.exit(1)

    # Concatenate all recorded chunks into single numpy array
    audio_flat = np.concatenate(audio_chunks, axis=0).flatten()
    max_amp = np.abs(audio_flat).max()
    duration_sec = len(audio_flat) / sample_rate

    print(f"📊 Recorded Duration: {duration_sec:.1f} seconds")
    print(f"📊 Recorded Peak Amplitude: {max_amp:.4f}")

    if max_amp < 0.005:
        print("\n⚠️ WARNING: Very low audio volume detected (near silence).")
        print("   Speak louder or choose your specific microphone device using --list-mics and --device ID.\n")
    else:
        # Normalize volume level for Whisper processing
        audio_flat = (audio_flat / max_amp) * 0.90

    audio_path = Path(output_filename).resolve()
    sf.write(str(audio_path), audio_flat, sample_rate)
    return str(audio_path), audio_flat

def transcribe_and_format_live(audio_flat, audio_path: str, model_name: str = "base", language: str = None, translate: bool = True):
    """Transcribes audio using Whisper with anti-hallucination configuration and translation support."""
    print(f"🎙️  [1/3] Loading OpenAI Whisper model ('{model_name}')...")
    start_time = time.time()
    stt_model = whisper.load_model(model_name)
    print(f"✅ Model loaded in {time.time() - start_time:.2f} seconds.")

    print("🔊 [2/3] Transcribing patient voice recording...")
    transcribe_args = {
        "temperature": 0.0,
        "condition_on_previous_text": False,
        "no_speech_threshold": 0.5
    }
    if language and language.lower() != "auto":
        transcribe_args["language"] = language

    if translate:
        transcribe_args["task"] = "translate"  # Translates Hindi/Tamil/Telugu/Kannada/etc. to English for the physician!

    result = stt_model.transcribe(audio_flat, **transcribe_args)
    raw_transcript = result.get("text", "").strip()
    detected_lang = result.get("language", "unknown")

    print("\n--- 📝 RAW PATIENT TRANSCRIPT ---")
    print(f"Detected Language: {detected_lang}")
    print(f"Transcript: \"{raw_transcript}\"\n")

    if not raw_transcript:
        print("⚠️ Warning: No clear speech recognized in the recording.")

    print("🩺 [3/3] Structuring into Physician-Ready Format...")
    formatter = ClinicalFormatter()
    clinical_result = formatter.format_transcript(raw_transcript)
    clinical_result["detected_language"] = detected_lang

    output_dir = Path("outputs")
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "live_patient_recording_clinical_summary.json"
    md_path = output_dir / "live_patient_recording_clinical_summary.md"

    import json
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(clinical_result, f, indent=2, ensure_ascii=False)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(clinical_result.get("markdown_formatted", ""))

    print(f"\n✨ Process complete! Clinical notes saved successfully.")
    print(f"📄 Markdown Report: {md_path.resolve().as_uri()}")
    print(f"📊 Structured JSON: {json_path.resolve().as_uri()}\n")
    print("=" * 60)
    print(clinical_result.get("markdown_formatted", ""))
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="Live Microphone Patient Voice Transcriber (SIH 2026)")
    parser.add_argument("--device", "-d", type=int, default=None, help="Microphone device ID (run with --list-mics to see IDs)")
    parser.add_argument("--list-mics", action="store_true", help="List all available microphone input devices and exit")
    parser.add_argument("--model", "-m", default="base", choices=["tiny", "base", "small", "medium"], help="Whisper model size")
    parser.add_argument("--language", "-l", default="auto", help="Language code (e.g. hi, ta, te, kn, en) or 'auto'")
    parser.add_argument("--no-translate", action="store_true", help="Keep native language text instead of translating to English")

    args = parser.parse_args()

    if args.list_mics:
        list_microphones()
        return

    audio_path, audio_flat = record_continuous_voice(device_index=args.device)
    transcribe_and_format_live(
        audio_flat,
        audio_path,
        model_name=args.model,
        language=args.language,
        translate=not args.no_translate
    )

if __name__ == "__main__":
    main()
