import argparse
import os
import sys
import json
import time
from pathlib import Path

# Ensure UTF-8 output encoding for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import whisper
import soundfile as sf
import numpy as np
from clinical_formatter import ClinicalFormatter

def load_audio_pure_python(file_path: str, target_sr: int = 16000) -> np.ndarray:
    """
    Loads audio using soundfile and converts to 16kHz mono float32 numpy array.
    This eliminates the external ffmpeg binary dependency.
    """
    data, sample_rate = sf.read(file_path, dtype='float32')
    if data.ndim > 1:
        data = data.mean(axis=1)  # Convert stereo to mono
    
    if sample_rate != target_sr:
        duration = len(data) / sample_rate
        target_length = int(duration * target_sr)
        data = np.interp(
            np.linspace(0, len(data), target_length, endpoint=False),
            np.arange(len(data)),
            data
        ).astype(np.float32)
    return data

def transcribe_and_format(audio_path: str, model_name: str = "base", language: str = None, output_dir: str = "outputs"):
    """
    Main workflow:
    1. Loads Whisper Speech-to-Text model.
    2. Transcribes patient audio near kiosk.
    3. Converts transcript to physician-ready SOAP note format.
    4. Saves results in Markdown and JSON formats.
    """
    audio_path = Path(audio_path).resolve()
    if not audio_path.exists():
        print(f"❌ Error: Audio file not found at: {audio_path}")
        sys.exit(1)

    print(f"🎙️  [1/3] Loading OpenAI Whisper model ('{model_name}')...")
    start_time = time.time()
    stt_model = whisper.load_model(model_name)
    print(f"✅ Model loaded in {time.time() - start_time:.2f} seconds.")

    print(f"🔊 [2/3] Transcribing patient voice recording: {audio_path.name}...")
    transcribe_args = {}
    if language and language.lower() != "auto":
        transcribe_args["language"] = language

    # Load audio array in pure python (no ffmpeg binary needed)
    audio_array = load_audio_pure_python(str(audio_path))
    result = stt_model.transcribe(audio_array, **transcribe_args)
    raw_transcript = result.get("text", "").strip()
    detected_lang = result.get("language", "unknown")

    print("\n--- 📝 RAW PATIENT TRANSCRIPT ---")
    print(f"Detected Language: {detected_lang}")
    print(f"Transcript: \"{raw_transcript}\"\n")

    print("🩺 [3/3] Structuring into Physician-Ready Format...")
    formatter = ClinicalFormatter()
    clinical_result = formatter.format_transcript(raw_transcript)
    clinical_result["detected_language"] = detected_lang

    # Prepare output directory
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    base_name = audio_path.stem
    json_path = out_dir / f"{base_name}_clinical_summary.json"
    md_path = out_dir / f"{base_name}_clinical_summary.md"

    # Save JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(clinical_result, f, indent=2, ensure_ascii=False)

    # Save Markdown
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(clinical_result.get("markdown_formatted", ""))

    print(f"\n✨ Process complete! Clinical notes generated successfully.")
    print(f"📄 Markdown Report: [link]({md_path.resolve().as_uri()})")
    print(f"📊 Structured JSON: [link]({json_path.resolve().as_uri()})\n")
    print("=" * 60)
    print(clinical_result.get("markdown_formatted", ""))
    print("=" * 60)

    return clinical_result

def main():
    parser = argparse.ArgumentParser(
        description="Patient Kiosk Voice-to-Text & Physician-Ready Formatter (SIH 2026)"
    )
    parser.add_argument(
        "--audio", "-a", required=True, help="Path to input patient audio file (.wav, .mp3, .m4a, etc.)"
    )
    parser.add_argument(
        "--model", "-m", default="base", choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model size to use (default: base)"
    )
    parser.add_argument(
        "--language", "-l", default="auto",
        help="Language code (e.g. en, hi, ta) or 'auto' for auto-detection"
    )
    parser.add_argument(
        "--output-dir", "-o", default="outputs",
        help="Directory to save structured clinical output files"
    )

    args = parser.parse_args()
    transcribe_and_format(args.audio, args.model, args.language, args.output_dir)

if __name__ == "__main__":
    main()
