from fastapi import APIRouter, Depends, HTTPException, status
from app.models import Recipe, Favorite
from app.services.auth import AuthService
from app.database import favorites_collection, recipes_collection
from bson import ObjectId
from bson.errors import InvalidId
from typing import List
from datetime import datetime

router = APIRouter()
auth_service = AuthService()


def is_valid_object_id(id_str: str) -> bool:
    """Check if a string is a valid MongoDB ObjectId."""
    try:
        ObjectId(id_str)
        return True
    except (InvalidId, TypeError):
        return False


@router.post("/{recipe_id}")
async def add_favorite(recipe_id: str, current_user=Depends(auth_service.get_current_user)):
    """Add a recipe to favorites."""
    user_id = str(current_user["_id"])
    
    # Check if the recipe exists (only for valid ObjectIds)
    if is_valid_object_id(recipe_id):
        recipe = await recipes_collection.find_one({"_id": ObjectId(recipe_id)})
        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recette non trouvée"
            )
    # For static recipes (simple IDs), accept them directly
    
    # Check if already in favorites
    existing = await favorites_collection.find_one({
        "user_id": user_id,
        "recipe_id": recipe_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette recette est déjà dans vos favoris"
        )
    
    # Add to favorites
    favorite = {
        "user_id": user_id,
        "recipe_id": recipe_id,
        "created_at": datetime.utcnow()
    }
    
    result = await favorites_collection.insert_one(favorite)
    return {"message": "Recette ajoutée aux favoris", "id": str(result.inserted_id)}


@router.delete("/{recipe_id}")
async def remove_favorite(recipe_id: str, current_user=Depends(auth_service.get_current_user)):
    """Remove a recipe from favorites."""
    user_id = str(current_user["_id"])
    
    result = await favorites_collection.delete_one({
        "user_id": user_id,
        "recipe_id": recipe_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cette recette n'est pas dans vos favoris"
        )
    
    return {"message": "Recette retirée des favoris"}


@router.get("/", response_model=List[Recipe])
async def get_favorites(current_user=Depends(auth_service.get_current_user)):
    """Get all favorite recipes for the current user."""
    user_id = str(current_user["_id"])
    
    # Retrieve all the user's favorites
    favorites_cursor = favorites_collection.find({"user_id": user_id})
    favorites = await favorites_cursor.to_list(length=None)
    
    if not favorites:
        return []
    
    # Separate valid MongoDB IDs from static IDs
    mongo_ids = []
    static_ids = []
    for fav in favorites:
        if is_valid_object_id(fav["recipe_id"]):
            mongo_ids.append(ObjectId(fav["recipe_id"]))
        else:
            static_ids.append(fav["recipe_id"])
    
    recipes = []
    
    # Retrieve recipes from the database
    if mongo_ids:
        recipes_cursor = recipes_collection.find({"_id": {"$in": mongo_ids}})
        db_recipes = await recipes_cursor.to_list(length=None)
        
        # Convert ObjectIds to strings
        for recipe in db_recipes:
            if "_id" in recipe:
                recipe["_id"] = str(recipe["_id"])
            if "user_id" in recipe:
                recipe["user_id"] = str(recipe["user_id"])
        
        recipes.extend(db_recipes)
    
    # Note: Static recipes are handled on the frontend
    # We only return the database recipes
    
    return recipes


@router.get("/check/{recipe_id}")
async def check_favorite(recipe_id: str, current_user=Depends(auth_service.get_current_user)):
    """Check if a recipe is in the user's favorites."""
    user_id = str(current_user["_id"])
    
    existing = await favorites_collection.find_one({
        "user_id": user_id,
        "recipe_id": recipe_id
    })
    
    return {"is_favorite": existing is not None}


@router.get("/ids")
async def get_favorite_ids(current_user=Depends(auth_service.get_current_user)):
    """Get all favorite recipe IDs for the current user."""
    user_id = str(current_user["_id"])
    
    favorites_cursor = favorites_collection.find({"user_id": user_id})
    favorites = await favorites_cursor.to_list(length=None)
    
    return {"favorite_ids": [fav["recipe_id"] for fav in favorites]}
