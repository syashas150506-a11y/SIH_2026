import asyncio
import edge_tts

text = """
ನಮಸ್ಕಾರ, ನಾನು MediKiosk ಆರೋಗ್ಯ ಸಹಾಯಕ.
ನಿಮಗೆ ಎರಡು ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇರುವುದಾಗಿ ತಿಳಿಯಿತು.
ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ನೀರು ಕುಡಿಯಿರಿ.
"""

async def main():
    communicate = edge_tts.Communicate(
        text,
        "kn-IN-SapnaNeural"
    )

    await communicate.save("response.mp3")

    print("✅ Voice response saved as response.mp3")

asyncio.run(main())