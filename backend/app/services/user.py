from app.models import UserCreate
from app.database import users_collection
from app.services.auth import AuthService
from typing import Optional


class UserService:
    def __init__(self):
        self.auth_service = AuthService()

    async def create_user(self, user: UserCreate) -> dict:
        user_dict = user.dict()
        user_dict["hashed_password"] = self.auth_service.get_password_hash(
            user.password
        )
        del user_dict["password"]
        result = await users_collection.insert_one(user_dict)
        return await users_collection.find_one({"_id": result.inserted_id})

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        return await users_collection.find_one({"email": email})

    async def update_user_password(self, email: str, hashed_password: str) -> bool:
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"hashed_password": hashed_password}}
        )
        return result.modified_count > 0

    async def update_username(self, email: str, new_username: str) -> bool:
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"username": new_username}}
        )
        return result.modified_count > 0
