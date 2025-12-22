import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✅ API Key found: {api_key[:10]}...")
genai.configure(api_key=api_key)

print("\n📋 Listing all available models:\n")
try:
    for model in genai.list_models():
        print(f"Model: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Supported Methods: {model.supported_generation_methods}")
        print()
except Exception as e:
    print(f"❌ Error listing models: {e}")
