from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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

@router.post("/analyze-ingredients")
async def analyze_ingredients_from_photo(
    file: UploadFile = File(...),
    current_user = Depends(auth_service.get_current_user)
):
    """
    Upload a photo of ingredients and get a list of detected ingredients.
    
    This endpoint accepts an image file, analyzes it using AI vision,
    and returns a list of ingredient names found in the image.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Read image data
    try:
        image_data = await file.read()
        
        # Check file size (limit to 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Analyze ingredients using AI
        ingredients = await ai_service.analyze_ingredients_from_image(image_data)
        
        return {
            "ingredients": ingredients,
            "count": len(ingredients),
            "message": f"Detected {len(ingredients)} ingredient(s) in the image"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/generate-from-photo")
async def generate_recipe_from_photo(
    file: UploadFile = File(...),
    current_user = Depends(auth_service.get_current_user)
):
    """
    Upload a photo of ingredients and automatically generate and save a recipe.
    
    This endpoint combines image analysis with recipe generation:
    1. Analyzes the photo to extract ingredients
    2. Generates a recipe using those ingredients
    3. Saves the recipe to the user's account
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Read and analyze image
        image_data = await file.read()
        
        # Check file size (limit to 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Step 1: Extract ingredients from image
        ingredients = await ai_service.analyze_ingredients_from_image(image_data)
        
        if not ingredients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No ingredients detected in the image"
            )
        
        # Step 2: Generate recipe from ingredients
        recipe = await ai_service.generate_recipe(ingredients)
        
        # Step 3: Save the generated recipe
        recipe_data = RecipeCreate(
            title=recipe["title"],
            ingredients=recipe["ingredients"],
            instructions=recipe["instructions"],
            cooking_time=recipe["cooking_time"],
            servings=recipe["servings"]
        )
        
        saved_recipe = await recipe_service.create_recipe(
            recipe_data, 
            current_user["_id"], 
            is_ai_generated=True
        )
        
        return {
            "detected_ingredients": ingredients,
            "recipe": saved_recipe,
            "message": "Recipe generated and saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image and generating recipe: {str(e)}"
        )