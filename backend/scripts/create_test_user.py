import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

async def create_test_user():
    try:
        print(f"Tentative de connexion à MongoDB: {MONGODB_URL}")
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        # Use explicit database name if provided in .env, otherwise fall back to driver's default
        if DATABASE_NAME:
            db = client[DATABASE_NAME]
        else:
            db = client.get_default_database()
        users_collection = db.users

        # Test user data
        password = "testpassword123"
        hashed_password = pwd_context.hash(password)
        # Include username to match Pydantic model expectations used by the API
        test_user = {
            "email": "test@example.com",
            "username": "testuser",
            "hashed_password": hashed_password,
            "is_active": True
        }

        print(f"Recherche de l'utilisateur existant avec l'email: {test_user['email']}")
        # Check if the user already exists
        existing_user = await users_collection.find_one({"email": test_user["email"]})
        if existing_user:
            print("L'utilisateur de test existe déjà")
            print(f"Mot de passe haché existant: {existing_user.get('hashed_password', 'Non trouvé')}")
        else:
            # Create the user
            print("Création d'un nouvel utilisateur...")
            result = await users_collection.insert_one(test_user)
            print(f"Utilisateur de test créé avec succès. ID: {result.inserted_id}")
            print(f"Mot de passe haché: {hashed_password}")

        # Verify the login
        print("\nTest de la connexion:")
        stored_user = await users_collection.find_one({"email": test_user["email"]})
        if stored_user:
            print("Utilisateur trouvé dans la base de données")
            is_valid = pwd_context.verify(password, stored_user["hashed_password"])
            print(f"Vérification du mot de passe: {'Succès' if is_valid else 'Échec'}")
        else:
            print("Impossible de trouver l'utilisateur dans la base de données")

    except Exception as e:
        print("\nErreur lors de la création de l'utilisateur:")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(create_test_user())