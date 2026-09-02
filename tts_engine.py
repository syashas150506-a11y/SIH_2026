import os
import sys
import threading
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

class TTSEngine:
    """
    Cross-platform Text-to-Speech (TTS) Engine.
    Uses pyttsx3 with PowerShell System.Speech fallback on Windows.
    """

    def __init__(self, rate: int = 155, volume: float = 1.0):
        self.rate = rate
        self.volume = volume
        self._engine = None
        self._init_pyttsx3()

    def _init_pyttsx3(self):
        try:
            import pyttsx3
            self._engine = pyttsx3.init()
            self._engine.setProperty('rate', self.rate)
            self._engine.setProperty('volume', self.volume)
        except Exception as e:
            print(f"[TTS Warning] pyttsx3 init failed ({e}). Fallback to PowerShell SAPI.", file=sys.stderr)
            self._engine = None

    def speak(self, text: str):
        """Speaks text out loud synchronously."""
        if not text or not text.strip():
            return

        try:
            print(f"🗣️  [Kiosk Voice]: \"{text}\"")
        except Exception:
            print(f"[Kiosk Voice]: \"{text}\"")

        if self._engine:
            try:
                self._engine.say(text)
                self._engine.runAndWait()
                return
            except Exception as e:
                print(f"[TTS Warning] pyttsx3 error: {e}. Trying PowerShell SAPI...", file=sys.stderr)

        # Fallback for Windows PowerShell SpeechSynthesizer
        if sys.platform == "win32":
            try:
                clean_text = text.replace('"', '`"')
                ps_cmd = (
                    f"Add-Type -AssemblyName System.Speech; "
                    f"$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
                    f"$synth.Rate = 0; "
                    f"$synth.Speak(\"{clean_text}\")"
                )
                subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception as pe:
                print(f"[TTS Warning] PowerShell SAPI failed: {pe}", file=sys.stderr)

    def speak_async(self, text: str):
        """Speaks text out loud in a background thread without blocking."""
        thread = threading.Thread(target=self.speak, args=(text,), daemon=True)
        thread.start()
        return thread

if __name__ == "__main__":
    tts = TTSEngine()
    tts.speak("Welcome to the Patient Kiosk. Please state your symptoms clearly.")
