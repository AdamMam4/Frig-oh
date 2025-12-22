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

# Constants for image validation
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image_file(file: UploadFile) -> None:
    """
    Validate uploaded image file.
    
    Args:
        file: The uploaded file to validate
        
    Raises:
        HTTPException: If file validation fails
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

@router.post("/")
async def create_recipe(
    recipe: RecipeCreate, current_user=Depends(auth_service.get_current_user)
):
    return await recipe_service.create_recipe(recipe, current_user["_id"])


@router.get("/", response_model=List[Recipe])
async def get_user_recipes(current_user=Depends(auth_service.get_current_user)):
    return await recipe_service.get_user_recipes(current_user["_id"])


@router.post("/generate")
async def generate_recipe_from_ingredients(
    ingredients: List[str], current_user=Depends(auth_service.get_current_user)
):
    """
    Generate a recipe from a list of ingredients.
    
    Args:
        ingredients: List of ingredient names
        current_user: Authenticated user
        
    Returns:
        Generated recipe saved to the database
    """
    # Generate recipe using AI
    recipe = await ai_service.generate_recipe(ingredients)
    # Save the generated recipe
    recipe_data = RecipeCreate(
        title=recipe["title"],
        ingredients=recipe["ingredients"],
        instructions=recipe["instructions"],
        cooking_time=recipe["cooking_time"],
        servings=recipe["servings"],
    )
    return await recipe_service.create_recipe(
        recipe_data, current_user["_id"], is_ai_generated=True
    )


@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    recipe_id: str, current_user=Depends(auth_service.get_current_user)
):
    recipe = await recipe_service.get_recipe(recipe_id)
    if str(recipe["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this recipe",
        )
    return recipe

@router.post("/analyze-ingredients")
async def analyze_ingredients_from_photo(
    file: UploadFile = File(...),
    current_user = Depends(auth_service.get_current_user)
):
    """
    Analyze a photo and detect ingredients using AI vision.
    
    Args:
        file: Image file containing ingredients
        current_user: Authenticated user
        
    Returns:
        Dictionary with detected ingredients list and count
    """
    validate_image_file(file)
    
    try:
        image_data = await file.read()
        
        if len(image_data) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size must be less than {MAX_IMAGE_SIZE // (1024*1024)}MB"
            )
        
        ingredients = await ai_service.analyze_ingredients_from_image(image_data)
        
        return {
            "ingredients": ingredients,
            "count": len(ingredients),
            "message": f"Detected {len(ingredients)} ingredient(s) in the image"
        }
        
    except HTTPException:
        raise
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
    Generate and save a recipe from an ingredient photo.
    
    This endpoint:
    1. Analyzes the photo to detect ingredients (using AI vision)
    2. Calls the existing /generate endpoint to create the recipe
    
    Args:
        file: Image file containing ingredients
        current_user: Authenticated user
        
    Returns:
        Dictionary with detected ingredients and generated recipe
    """
    validate_image_file(file)
    
    try:
        image_data = await file.read()
        
        if len(image_data) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size must be less than {MAX_IMAGE_SIZE // (1024*1024)}MB"
            )
        
        # Step 1: Extract ingredients from image
        ingredients = await ai_service.analyze_ingredients_from_image(image_data)
        
        if not ingredients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No ingredients detected in the image"
            )
        
        # Step 2: Use existing recipe generation logic
        saved_recipe = await generate_recipe_from_ingredients(ingredients, current_user)
        
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
