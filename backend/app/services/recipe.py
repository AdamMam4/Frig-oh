from app.models import RecipeCreate
from app.database import recipes_collection
from bson import ObjectId
from typing import List


class RecipeService:
    async def create_recipe(
        self, recipe: RecipeCreate, user_id: ObjectId, is_ai_generated: bool = False
    ) -> dict:
        recipe_dict = recipe.dict()
        recipe_dict["user_id"] = user_id
        recipe_dict["is_ai_generated"] = is_ai_generated
        result = await recipes_collection.insert_one(recipe_dict)
        return await recipes_collection.find_one({"_id": result.inserted_id})

    async def get_recipe(self, recipe_id: str) -> dict:
        return await recipes_collection.find_one({"_id": ObjectId(recipe_id)})

    async def get_user_recipes(self, user_id: ObjectId) -> List[dict]:
        cursor = recipes_collection.find({"user_id": user_id})
        return await cursor.to_list(length=None)

    async def update_recipe(self, recipe_id: str, recipe_data: dict) -> dict:
        await recipes_collection.update_one(
            {"_id": ObjectId(recipe_id)}, {"$set": recipe_data}
        )
        return await self.get_recipe(recipe_id)

    async def delete_recipe(self, recipe_id: str) -> bool:
        result = await recipes_collection.delete_one({"_id": ObjectId(recipe_id)})
        return result.deleted_count > 0
