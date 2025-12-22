# Photo-Based Ingredient Recognition

## Overview

This feature adds AI-powered image analysis :
1. **Detect ingredients** from photos using Google Gemini Vision
2. **Generate recipes** from detected ingredients

## Setup

Add Gemini API key to `backend/.env`:

Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Quick Test

```bash
python scripts/example_photo_upload.py path/to/image.jpg
```

## API Endpoints

### Analyze Ingredients Only
`POST /recipes/analyze-ingredients`

Returns a list of detected ingredients without generating a recipe.

**Response:**
```json
{
  "ingredients": ["tomatoes", "eggs", "onions", "garlic"],
  "count": 4,
  "message": "Detected 4 ingredient(s) in the image"
}
```

### Generate Recipe from Photo
`POST /recipes/generate-from-photo`

Analyzes photo, generates recipe, and saves it to the user's account.

**Response:**
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
- `analyze_ingredients_from_image()` - Uses Gemini 1.5 Flash Vision to detect ingredients
- `generate_recipe()` - Generates recipes from ingredient lists

**Routes** (`app/routes/recipes.py`)
- `/analyze-ingredients` - Image → Ingredients list
- `/generate-from-photo` - Image → Ingredients → Recipe (reuses existing `/generate` endpoint)

**Tech Stack:** Google Gemini 1.5 Flash, Pillow, FastAPI

## Validation
- ✅ Image files only (jpg, png, webp, gif, bmp)
- ✅ Max file size: 10MB
- ✅ JWT authentication required