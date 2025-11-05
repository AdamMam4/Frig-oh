from fastapi import APIRouter, Depends, HTTPException, status
from app.models import Recipe, RecipeCreate
from app.services.auth import AuthService
from app.services.recipe import RecipeService
from app.services.ai import AiService
from typing import List

router = APIRouter()
recipe_service = RecipeService()
ai_service = AiService()
auth_service = AuthService()

@router.post("/", response_model=Recipe)
async def create_recipe(
    recipe: RecipeCreate,
    current_user = Depends(auth_service.get_current_user)
):
    return await recipe_service.create_recipe(recipe, current_user["_id"])

@router.get("/", response_model=List[Recipe])
async def get_user_recipes(
    current_user = Depends(auth_service.get_current_user)
):
    return await recipe_service.get_user_recipes(current_user["_id"])

@router.post("/generate")
async def generate_recipe(
    ingredients: List[str],
    current_user = Depends(auth_service.get_current_user)
):
    # Generate recipe using AI
    recipe = await ai_service.generate_recipe(ingredients)
    # Save the generated recipe
    recipe_data = RecipeCreate(
        title=recipe["title"],
        ingredients=recipe["ingredients"],
        instructions=recipe["instructions"],
        cooking_time=recipe["cooking_time"],
        servings=recipe["servings"]
    )
    return await recipe_service.create_recipe(recipe_data, current_user["_id"], is_ai_generated=True)

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    recipe_id: str,
    current_user = Depends(auth_service.get_current_user)
):
    recipe = await recipe_service.get_recipe(recipe_id)
    if str(recipe["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this recipe"
        )
    return recipe