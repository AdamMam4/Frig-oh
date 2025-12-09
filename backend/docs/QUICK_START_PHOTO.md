# Quick Start Guide: Photo-Based Ingredient Recognition

## Setup (One-time)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Get Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### 3. Start the Server
```bash
cd backend
python run.py
```

## Using the Feature

### Option A: Analyze Ingredients Only

```bash
curl -X POST "http://localhost:8000/recipes/analyze-ingredients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@ingredients.jpg"
```

**Returns:**
```json
{
  "ingredients": ["tomatoes", "eggs", "onions"],
  "count": 3,
  "message": "Detected 3 ingredient(s) in the image"
}
```

### Option B: Generate Complete Recipe

```bash
curl -X POST "http://localhost:8000/recipes/generate-from-photo" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@ingredients.jpg"
```

**Returns:** Full recipe with ingredients and instructions

### Option C: Use Python Script

```bash
cd backend
python scripts/example_photo_upload.py /path/to/image.jpg
```

## Testing with Postman

1. **Login First:**
   - POST `http://localhost:8000/auth/login`
   - Body: `{"username": "your_user", "password": "your_pass"}`
   - Copy the `access_token`

2. **Upload Image:**
   - POST `http://localhost:8000/recipes/analyze-ingredients`
   - Headers: `Authorization: Bearer <your_token>`
   - Body: Form-data with key `file` and select your image

## Supported Formats

✅ JPEG, PNG, WebP, GIF, BMP  
✅ Max size: 10MB  
✅ Best results: Clear, well-lit photos

## Tips for Best Results

1. **Good lighting** - Take photos in bright conditions
2. **Clear focus** - Ensure ingredients are in focus
3. **Close-up shots** - Get closer to the ingredients
4. **Separate items** - Spread ingredients out when possible
5. **Clean background** - Avoid cluttered backgrounds

## Common Issues

**"GEMINI_API_KEY not found"**
→ Add API key to `.env` file

**"File must be an image"**
→ Only upload image files (jpg, png, etc.)

**"No ingredients detected"**
→ Try a clearer, better-lit photo

**"Unauthorized"**
→ Login first and use the token in Authorization header

## What's Next?

After getting ingredients, you can:
1. Edit the list manually
2. Use `/recipes/generate` endpoint with custom ingredient list
3. Save recipes to your account
4. Share recipes with others

## Need Help?

Check the full documentation:
- `backend/docs/PHOTO_INGREDIENT_RECOGNITION.md`
