import sounddevice as sd
from scipy.io.wavfile import write

duration = 10
sample_rate = 16000

print("🎤 Recording started...")
print("Speak now!")

audio = sd.rec(
    int(duration * sample_rate),
    samplerate=sample_rate,
    channels=1,
    dtype="int16"
)

sd.wait()

write("mic_audio.wav", sample_rate, audio)

print("✅ Recording saved as mic_audio.wav")