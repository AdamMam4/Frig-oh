import httpx

async def test_user_creation():
    try:
        print("Démarrage du test de création d'utilisateur...")
        
        # Create the user
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123"
        }
        print(f"Données utilisateur : {user_data}")
        
        print("Tentative de connexion à l'API...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                print("Envoi de la requête POST...")
                response = await client.post(
                    "http://127.0.0.1:8000/auth/register",
                    json=user_data
                )
                
                print(f"Statut de la création : {response.status_code}")
                print(f"Réponse : {response.text}")
            except httpx.ConnectError:
                print("Erreur de connexion : Impossible de se connecter au serveur")
            except httpx.TimeoutException:
                print("Erreur : La requête a dépassé le délai d'attente")
            
    except Exception as e:
        print(f"Erreur inattendue : {str(e)}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_user_creation())