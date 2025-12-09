from app.models import UserCreate
from app.database import users_collection
from app.services.auth import AuthService
from typing import Optional

class UserService:
    def __init__(self):
        self.auth_service = AuthService()

    async def create_user(self, user: UserCreate) -> dict:
        user_dict = user.dict()
        user_dict["hashed_password"] = self.auth_service.get_password_hash(user.password)
        del user_dict["password"]
        result = await users_collection.insert_one(user_dict)
        return await users_collection.find_one({"_id": result.inserted_id})

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        return await users_collection.find_one({"email": email})

    async def get_user_by_username(self, username: str) -> Optional[dict]:
        return await users_collection.find_one({"username": username})