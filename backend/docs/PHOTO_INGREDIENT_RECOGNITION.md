# Photo-Based Ingredient Recognition Feature

## Overview

This feature allows users to upload photos of ingredients and automatically:
1. **Detect ingredients** in the image using AI vision
2. **Generate recipes** based on the detected ingredients
3. **Save recipes** to their account

## Architecture

### Components

1. **AI Service** (`app/services/ai.py`)
   - `analyze_ingredients_from_image()`: Analyzes images using Google Gemini Vision API
   - `generate_recipe()`: Creates recipes from ingredient lists

2. **API Endpoints** (`app/routes/recipes.py`)
   - `POST /recipes/analyze-ingredients`: Detects ingredients only
   - `POST /recipes/generate-from-photo`: Full workflow (detect + generate + save)

### Technology Stack

- **Google Gemini Vision API** (gemini-1.5-flash): For image analysis
- **Google Gemini Pro**: For recipe generation
- **Pillow**: Image processing
- **FastAPI**: File upload handling

## API Endpoints

### 1. Analyze Ingredients from Photo

**Endpoint:** `POST /recipes/analyze-ingredients`

**Description:** Upload a photo and get a list of detected ingredients.

**Request:**
```bash
curl -X POST "http://localhost:8000/recipes/analyze-ingredients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

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

**Description:** Upload a photo, detect ingredients, generate a recipe, and save it.

**Request:**
```bash
curl -X POST "http://localhost:8000/recipes/generate-from-photo" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/ingredients.jpg"
```

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
    "created_at": "2025-11-12T10:30:00"
  },
  "message": "Recipe generated and saved successfully"
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Add your Google Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Gemini API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy it to your `.env` file

### 3. Run the Backend

```bash
cd backend
python run.py
```

The API will be available at `http://localhost:8000`

## Usage Examples

### Example 1: Python Requests

```python
import requests

# Login to get token
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "testuser", "password": "password123"}
)
token = login_response.json()["access_token"]

# Upload image and analyze ingredients
with open("ingredients.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/recipes/analyze-ingredients",
        files={"file": f},
        headers={"Authorization": f"Bearer {token}"}
    )
    
print(response.json())
```

### Example 2: JavaScript/Frontend

```javascript
async function analyzeIngredients(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/recipes/analyze-ingredients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  const data = await response.json();
  console.log('Detected ingredients:', data.ingredients);
  return data;
}

// Usage with file input
document.getElementById('imageInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await analyzeIngredients(file);
  console.log(result);
});
```

### Example 3: Generate Full Recipe from Photo

```python
import requests

token = "YOUR_TOKEN_HERE"

with open("fridge_contents.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/recipes/generate-from-photo",
        files={"file": f},
        headers={"Authorization": f"Bearer {token}"}
    )
    
data = response.json()
print(f"Detected: {data['detected_ingredients']}")
print(f"Recipe: {data['recipe']['title']}")
print(f"Instructions: {data['recipe']['instructions']}")
```

## Validation and Error Handling

The API includes several validation checks:

1. **File Type Validation**: Only image files are accepted
2. **File Size Limit**: Maximum 10MB per image
3. **Authentication**: Requires valid JWT token
4. **Ingredient Detection**: Returns error if no ingredients found
5. **JSON Parsing**: Handles malformed AI responses gracefully

### Error Responses

```json
// Invalid file type
{
  "detail": "File must be an image"
}

// File too large
{
  "detail": "File size must be less than 10MB"
}

// No ingredients detected
{
  "detail": "No ingredients detected in the image"
}
```

## Testing

Run the test suite:

```bash
cd backend
pytest tests/test_image_ingredients.py -v
```

## Supported Image Formats

- JPEG/JPG
- PNG
- WebP
- GIF
- BMP

## Performance Considerations

- **Image Processing**: Images are processed in memory
- **API Calls**: Each request makes 1-2 API calls to Gemini
- **Response Time**: Typically 2-5 seconds depending on image size
- **Rate Limits**: Subject to Google Gemini API rate limits

## Future Enhancements

1. **Batch Processing**: Upload multiple images at once
2. **Image Optimization**: Automatic resizing for faster processing
3. **Confidence Scores**: Return confidence levels for detected ingredients
4. **Ingredient Filtering**: Allow users to remove/add ingredients before generating
5. **Recipe Preferences**: Consider dietary restrictions and cuisine preferences
6. **Image Caching**: Cache analysis results to avoid redundant API calls

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Ensure `.env` file exists in the backend directory
   - Check that the API key is valid

2. **"Failed to analyze image"**
   - Check image quality (too dark, blurry images may fail)
   - Ensure ingredients are clearly visible
   - Try with a different image format

3. **"File too large"**
   - Compress the image before uploading
   - Use JPEG format for smaller file sizes

## Security Notes

- All endpoints require authentication
- File size is limited to prevent DoS attacks
- File type validation prevents malicious uploads
- Image data is not stored permanently on the server

## License

This feature is part of the Frig-oh project.
