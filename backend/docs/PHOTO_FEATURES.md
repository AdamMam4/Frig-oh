# Photo-Based Ingredient Recognition

## Overview

This feature allows users to upload photos of ingredients and automatically:
1. **Detect ingredients** in the image using AI vision
2. **Generate recipes** based on the detected ingredients
3. **Save recipes** to their account

## Quick Start

### Prerequisites

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Add to `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

4. Start the server:
```bash
python run.py
```

### Testing the Feature

#### Option 1: Using the Demo Script
```bash
python scripts/example_photo_upload.py path/to/image.jpg
```

#### Option 2: Using cURL
```bash
# Login first
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_user","password":"your_pass"}'

# Analyze ingredients
curl -X POST "http://localhost:8000/recipes/analyze-ingredients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@ingredients.jpg"
```

## API Endpoints

### 1. Analyze Ingredients

**Endpoint:** `POST /recipes/analyze-ingredients`

Upload a photo and get a list of detected ingredients.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Headers: `Authorization: Bearer <token>`
- Body: Form data with `file` field containing image

**Response:**
```json
{
  "ingredients": ["tomatoes", "eggs", "onions", "garlic"],
  "count": 4,
  "message": "Detected 4 ingredient(s) in the image"
}
```

### 2. Generate Recipe from Photo

**Endpoint:** `POST /recipes/generate-from-photo`

Upload a photo, detect ingredients, generate a recipe, and save it.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Headers: `Authorization: Bearer <token>`
- Body: Form data with `file` field containing image

**Response:**
```json
{
  "detected_ingredients": ["tomatoes", "eggs", "onions"],
  "recipe": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Spanish Tomato and Egg Scramble",
    "ingredients": ["3 tomatoes", "4 eggs", "1 onion", "2 cloves garlic"],
    "instructions": [
      "Dice the onions and tomatoes",
      "Heat oil in a pan and sauté onions until soft",
      "Add tomatoes and cook for 5 minutes",
      "Beat eggs and pour into the pan",
      "Stir gently until eggs are cooked"
    ],
    "cooking_time": 15,
    "servings": 2,
    "is_ai_generated": true,
    "created_at": "2025-12-22T10:30:00"
  },
  "message": "Recipe generated and saved successfully"
}
```

## Code Examples

### Python
```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "user", "password": "pass"}
)
token = response.json()["access_token"]

# Upload and analyze image
with open("ingredients.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/recipes/analyze-ingredients",
        files={"file": f},
        headers={"Authorization": f"Bearer {token}"}
    )

print(response.json()["ingredients"])
```

### JavaScript/TypeScript
```javascript
async function analyzeIngredients(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/recipes/analyze-ingredients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  return data.ingredients;
}
```

## Features

✅ Upload images (JPEG, PNG, WebP, GIF, BMP)  
✅ AI ingredient detection (Google Gemini Vision)  
✅ Automatic recipe generation  
✅ Save to user's recipe collection  
✅ File validation (type, size up to 10MB)  
✅ JWT authentication required  
✅ Comprehensive error handling  
✅ No permanent image storage (privacy-focused)  

## Security

- 🔐 JWT authentication required for all endpoints
- 📏 10MB file size limit
- 🖼️ Image type validation
- 🚫 No permanent storage of uploaded photos
- ✅ Input sanitization and error handling

## Testing

### Run Unit Tests
```bash
pytest tests/test_image_ingredients.py -v
```

### Manual Testing with Postman
1. POST `/auth/login` → Get authentication token
2. POST `/recipes/analyze-ingredients` → Upload image with token
3. Verify response contains ingredient list

## Tips for Best Results

1. **Good lighting** - Take photos in bright, natural light
2. **Clear focus** - Ensure ingredients are sharp and in focus
3. **Close-up shots** - Get closer to show ingredient details
4. **Separate items** - Spread ingredients out when possible
5. **Clean background** - Avoid cluttered backgrounds

## Troubleshooting

**"GEMINI_API_KEY not found"**  
→ Add your API key to the `.env` file

**"File must be an image"**  
→ Only upload image files (jpg, png, webp, etc.)

**"File size must be less than 10MB"**  
→ Compress or resize your image

**"No ingredients detected"**  
→ Try a clearer, better-lit photo with visible ingredients

**"Unauthorized" or 401 error**  
→ Login first and include the token in the Authorization header

## Architecture

### Components

**AI Service** (`app/services/ai.py`)
- `analyze_ingredients_from_image()`: Detects ingredients using Gemini 1.5 Flash Vision
- `generate_recipe()`: Creates recipes from ingredient lists

**API Routes** (`app/routes/recipes.py`)
- Photo upload handling
- File validation
- Image processing workflow

**Technology Stack**
- Google Gemini 1.5 Flash (Vision and text generation)
- Pillow (Image processing)
- FastAPI (File upload handling)
- Python multipart (Form data support)

## Implementation Details

### File Validation
```python
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image_file(file: UploadFile) -> None:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
```

### Image Analysis Flow
1. User uploads image → FastAPI receives file
2. Validate file type and size
3. Convert to PIL Image
4. Send to Gemini Vision API with prompt
5. Parse JSON response
6. Return ingredient list

### Recipe Generation Flow
1. Detect ingredients from image
2. Pass ingredients to Gemini text model
3. Generate recipe with title, ingredients, instructions
4. Save to MongoDB with `is_ai_generated=true` flag
5. Return complete recipe to user

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Dietary restriction filtering
- [ ] Nutrition information
- [ ] Confidence scores for detected ingredients
- [ ] Batch image processing
- [ ] Image preprocessing for better detection
