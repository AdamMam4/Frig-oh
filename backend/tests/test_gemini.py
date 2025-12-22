import os
from dotenv import load_dotenv
import google.generativeai as genai

# Charger les variables d'environnement
load_dotenv()

# Configuration de l'API Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key configurée : {'Oui' if GEMINI_API_KEY else 'Non'}")

try:
    # Configurer l'API
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Lister les modèles disponibles
    print("\nModèles disponibles :")
    for model in genai.list_models():
        print(f"- {model.name}")
        
    # Utiliser le premier modèle disponible
    model_name = genai.list_models()[0].name
    print(f"\nUtilisation du modèle : {model_name}")
    
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Dis bonjour en français")
    
    print("\nRéponse de Gemini :")
    print(response.text)
    
except Exception as e:
    print("\nErreur lors du test de Gemini :")
    print(str(e))