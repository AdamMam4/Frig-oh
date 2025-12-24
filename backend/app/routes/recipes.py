from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from app.models import Recipe, RecipeCreate, RecipeUpdate, RecipePreview
from app.services.auth import AuthService
from app.services.recipe import RecipeService
from app.services.ai import AiService
from typing import List
import os
import uuid
import shutil

router = APIRouter()
recipe_service = RecipeService()
ai_service = AiService()
auth_service = AuthService()

# Directory for uploaded images
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Constants for image validation
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


def normalize_ingredients(raw_ingredients):
    """Normalize ingredients to strings (Gemini may return objects or strings)"""
    normalized = []
    for ing in raw_ingredients:
        if isinstance(ing, str):
            normalized.append(ing)
        elif isinstance(ing, dict):
            parts = []
            if ing.get("quantity"):
                parts.append(str(ing["quantity"]))
            if ing.get("unit"):
                parts.append(ing["unit"])
            if ing.get("item"):
                parts.append(ing["item"])
            if ing.get("preparation"):
                parts.append(f"({ing['preparation']})")
            normalized.append(" ".join(parts).strip())
        else:
            normalized.append(str(ing))
    return normalized


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


@router.post("/generate", response_model=RecipePreview)
async def generate_recipe(
    ingredients: List[str], current_user=Depends(auth_service.get_current_user)
):
    """Generate a recipe preview using AI (does NOT save to database)"""
    # Generate recipe using AI
    recipe = await ai_service.generate_recipe(ingredients)
    
    # Return preview without saving
    return RecipePreview(
        title=recipe["title"],
        ingredients=normalize_ingredients(recipe["ingredients"]),
        instructions=recipe["instructions"],
        cooking_time=recipe["cooking_time"],
        servings=recipe["servings"],
        difficulty=recipe.get("difficulty", "Moyen"),
        image_url=None
    )


@router.post("/save")
async def save_recipe(
    recipe: RecipeCreate, current_user=Depends(auth_service.get_current_user)
):
    """Save a recipe (after user accepts the generated preview)"""
    return await recipe_service.create_recipe(
        recipe, current_user["_id"], is_ai_generated=True
    )


@router.patch("/{recipe_id}")
async def update_recipe(
    recipe_id: str,
    update: RecipeUpdate,
    current_user=Depends(auth_service.get_current_user)
):
    """Update a recipe (e.g., change image)"""
    recipe = await recipe_service.get_recipe(recipe_id)
    if str(recipe["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this recipe",
        )
    return await recipe_service.update_recipe(recipe_id, update.model_dump(exclude_none=True))


@router.post("/{recipe_id}/upload-image")
async def upload_recipe_image(
    recipe_id: str,
    file: UploadFile = File(...),
    current_user=Depends(auth_service.get_current_user)
):
    """Upload an image file for a recipe"""
    # Check recipe ownership
    recipe = await recipe_service.get_recipe(recipe_id)
    if str(recipe["user_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this recipe",
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non supporté. Utilisez: {', '.join(allowed_types)}",
        )
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{recipe_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update recipe with image URL
    image_url = f"/recipes/images/{unique_filename}"
    await recipe_service.update_recipe(recipe_id, {"image_url": image_url})
    
    return {"message": "Image uploadée avec succès", "image_url": image_url}


@router.get("/images/{filename}")
async def get_recipe_image(filename: str):
    """Serve uploaded recipe images"""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    return FileResponse(file_path)


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
    
    NOTE: This endpoint is currently unused but kept for potential future use.
    The frontend currently uses a two-step approach:
    1. POST /recipes/analyze-ingredients (detect ingredients from photo)
    2. POST /recipes/generate (generate recipe from ingredients list)
    
    This endpoint combines both steps into one.
    
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
        
        # Step 2: Generate recipe (return preview)
        recipe = await ai_service.generate_recipe(ingredients)
        
        return {
            "detected_ingredients": ingredients,
            "recipe": RecipePreview(
                title=recipe["title"],
                ingredients=normalize_ingredients(recipe["ingredients"]),
                instructions=recipe["instructions"],
                cooking_time=recipe["cooking_time"],
                servings=recipe["servings"],
                difficulty=recipe.get("difficulty", "Moyen"),
                image_url=None
            ),
            "message": "Recipe generated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image and generating recipe: {str(e)}"
        )
