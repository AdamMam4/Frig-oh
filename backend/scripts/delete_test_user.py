import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL")

async def delete_test_user():
    try:
        print(f"Tentative de connexion à MongoDB: {MONGODB_URL}")
        # Connexion à MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.get_default_database()
        users_collection = db.users

        print("Suppression de l'utilisateur test...")
        result = await users_collection.delete_one({"email": "test@example.com"})
        if result.deleted_count > 0:
            print("Utilisateur de test supprimé avec succès")
        else:
            print("Aucun utilisateur de test trouvé à supprimer")

    except Exception as e:
        print("\nErreur lors de la suppression de l'utilisateur:")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(delete_test_user())