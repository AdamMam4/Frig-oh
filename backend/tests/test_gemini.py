import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key configurée : {'Oui' if GEMINI_API_KEY else 'Non'}")

try:
    # Configure the API
    genai.configure(api_key=GEMINI_API_KEY)
    
    # List available models
    print("\nModèles disponibles :")
    for model in genai.list_models():
        print(f"- {model.name}")
        
    # Use the first available model
    model_name = genai.list_models()[0].name
    print(f"\nUtilisation du modèle : {model_name}")
    
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Dis bonjour en français")
    
    print("\nRéponse de Gemini :")
    print(response.text)
    
except Exception as e:
    print("\nErreur lors du test de Gemini :")
    print(str(e))