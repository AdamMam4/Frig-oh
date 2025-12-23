import asyncio
import httpx
import json
from dotenv import load_dotenv
import os
import traceback

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://127.0.0.1:8000"  # Use IP address instead of localhost
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"

print("Configuration du test :")
print(f"URL de base : {BASE_URL}")
print(f"Email de test : {TEST_USER_EMAIL}")
print(f"Mot de passe : {TEST_USER_PASSWORD}")

async def test_recipe_creation():
    try:
        timeout = httpx.Timeout(30.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            print("\nTentative de connexion...")
            # 1. Login to obtain the token
            login_response = await client.post(
                f"{BASE_URL}/auth/login",
                json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
            )
            
            print(f"Statut de la connexion: {login_response.status_code}")
            print(f"Réponse de connexion: {login_response.text}")
            
            if login_response.status_code != 200:
                print("Erreur de connexion:", login_response.text)
                return
                
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 2. Create the recipe
            recipe_data = {
                "title": "Saumon aux œufs et paprika",
                "description": "Une délicieuse recette de saumon accompagné d'œufs et assaisonné au paprika",
                "ingredients": [
                    "2 pavés de saumon",
                    "4 œufs",
                    "1 cuillère à café de paprika",
                    "Sel et poivre",
                    "2 cuillères à soupe d'huile d'olive"
                ],
                "instructions": [
                    "1. Préchauffer le four à 180°C",
                    "2. Assaisonner les pavés de saumon avec du sel, du poivre et du paprika",
                    "3. Faire chauffer l'huile dans une poêle",
                    "4. Cuire le saumon 3-4 minutes de chaque côté",
                    "5. Faire cuire les œufs au plat dans la même poêle",
                    "6. Servir le saumon avec les œufs et saupoudrer de paprika"
                ],
                "cooking_time": 20,
                "difficulty": "EASY",
                "servings": 2
            }

            print("\nTentative de création de la recette...")
            response = await client.post(
                f"{BASE_URL}/recipes/",
                json=recipe_data,
                headers=headers
            )
            
            print("\nRésultat de la création de la recette:")
            print("Status code:", response.status_code)
            if response.status_code == 200:
                recipe = response.json()
                print("\nRecette créée avec succès:")
                print(json.dumps(recipe, indent=2, ensure_ascii=False))
            else:
                print("Erreur:", response.text)
    except Exception as e:
        print("\nUne erreur s'est produite:")
        print(traceback.format_exc())

# Run the test
if __name__ == "__main__":
    print("Démarrage du test...")
    try:
        asyncio.run(test_recipe_creation())
    except Exception as e:
        print("\nErreur principale:")
        print(traceback.format_exc())