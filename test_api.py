from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

key = os.getenv("OPENAI_API_KEY")

if not key:
    print("API KEY NOT FOUND")
else:
    print("API KEY FOUND")

    client = OpenAI(api_key=key)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input="Say hello to MediKiosk"
    )

    print(response.output_text)
    