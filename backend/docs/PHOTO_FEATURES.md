# Photo-Based Ingredient Recognition

## Overview

This feature adds AI-powered image analysis:
1. **Detect ingredients** from photos using Google Gemini Vision
2. **Generate recipes** from detected ingredients

## Setup

Add the Gemini API key to `backend/.env`.

Get a free API key from Google AI Studio: https://makersuite.google.com/app/apikey

## Quick test

```bash
python scripts/example_photo_upload.py path/to/image.jpg
```

## API Endpoints

### Analyze ingredients only
POST `/recipes/analyze-ingredients`

Returns a list of detected ingredients without generating a recipe.

Example response:

```json
{
  "ingredients": ["tomatoes", "eggs", "onions", "garlic"],
  "count": 4,
  "message": "Detected 4 ingredient(s) in the image"
}
```

### Generate recipe from photo
POST `/recipes/generate-from-photo`

Analyze the photo, generate a recipe, and save it to the user's account.

Example response:

```json
{
  "detected_ingredients": ["tomatoes", "eggs", "onions"],
  "recipe": {
    "title": "Spanish Tomato and Egg Scramble",
    "ingredients": ["3 tomatoes", "4 eggs", "1 onion"],
    "instructions": ["Dice the onions...", "Heat oil..."],
    "cooking_time": 15,
    "servings": 2,
    "is_ai_generated": true
  },
  "message": "Recipe generated and saved successfully"
}
```

## Implementation

**AI Service** (`app/services/ai.py`)
- `analyze_ingredients_from_image()` - Uses Gemini Vision to detect ingredients
- `generate_recipe()` - Generates recipes from ingredient lists

**Routes** (`app/routes/recipes.py`)
- `/analyze-ingredients` - Image → ingredients list
- `/generate-from-photo` - Image → ingredients → recipe (reuses existing `/generate` endpoint)

Tech stack: Google Gemini, Pillow, FastAPI

## Validation

- ✅ Accepts image file types only (jpg, png, webp, gif, bmp)
- ✅ Max file size: 10MB
- ✅ JWT authentication required