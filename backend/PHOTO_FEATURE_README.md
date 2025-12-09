# 🍳 Photo-Based Ingredient Recognition - README

## 📸 What's New?

Your Frig-oh backend now supports **AI-powered photo analysis**! Users can:
- 📷 Upload photos of ingredients
- 🤖 Get AI-detected ingredient lists
- 📝 Generate recipes automatically
- 💾 Save recipes to their account

---

## 🎯 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Key
1. Get a Gemini API key: https://makersuite.google.com/app/apikey
2. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

### 3. Run the Server
```bash
python run.py
```

### 4. Test It!
```bash
# Option 1: Use the demo script
python scripts/example_photo_upload.py path/to/image.jpg

# Option 2: Use curl (after logging in)
curl -X POST "http://localhost:8000/recipes/analyze-ingredients" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@ingredients.jpg"
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[FEATURE_GUIDE.md](./docs/FEATURE_GUIDE.md)** | Complete visual guide with examples |
| **[QUICK_START_PHOTO.md](./docs/QUICK_START_PHOTO.md)** | Get started in 5 minutes |
| **[PHOTO_INGREDIENT_RECOGNITION.md](./docs/PHOTO_INGREDIENT_RECOGNITION.md)** | Full technical documentation |
| **[IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** | What was implemented |

---

## 🔌 API Endpoints

### 1️⃣ Analyze Ingredients Only
```http
POST /recipes/analyze-ingredients
```
Returns detected ingredients without generating a recipe.

**Example Response:**
```json
{
  "ingredients": ["tomatoes", "eggs", "onions"],
  "count": 3,
  "message": "Detected 3 ingredient(s) in the image"
}
```

### 2️⃣ Generate Recipe from Photo
```http
POST /recipes/generate-from-photo
```
Analyzes photo, generates recipe, and saves it.

**Example Response:**
```json
{
  "detected_ingredients": ["tomatoes", "eggs"],
  "recipe": {
    "title": "Tomato and Egg Scramble",
    "ingredients": [...],
    "instructions": [...],
    "cooking_time": 15,
    "servings": 2
  },
  "message": "Recipe generated and saved successfully"
}
```

---

## 💡 Usage Examples

### Python
```python
import requests

# Login
res = requests.post("http://localhost:8000/auth/login",
    json={"username": "user", "password": "pass"})
token = res.json()["access_token"]

# Upload photo
with open("ingredients.jpg", "rb") as f:
    res = requests.post(
        "http://localhost:8000/recipes/analyze-ingredients",
        files={"file": f},
        headers={"Authorization": f"Bearer {token}"}
    )
print(res.json()["ingredients"])
```

### JavaScript/Frontend
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/recipes/analyze-ingredients', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const data = await response.json();
console.log(data.ingredients);
```

---

## 📁 What Changed?

### Modified Files:
- ✏️ `backend/requirements.txt` - Added AI & image processing dependencies
- ✏️ `backend/app/services/ai.py` - Added image analysis method
- ✏️ `backend/app/routes/recipes.py` - Added 2 new endpoints

### New Files:
- 🆕 `backend/tests/test_image_ingredients.py` - Test suite
- 🆕 `backend/scripts/example_photo_upload.py` - Demo script
- 🆕 `backend/docs/FEATURE_GUIDE.md` - Complete guide
- 🆕 `backend/docs/QUICK_START_PHOTO.md` - Quick start
- 🆕 `backend/docs/PHOTO_INGREDIENT_RECOGNITION.md` - Full docs
- 🆕 `backend/docs/IMPLEMENTATION_SUMMARY.md` - Summary

---

## ✅ Features

- ✅ Upload images (JPEG, PNG, WebP, GIF, BMP)
- ✅ AI ingredient detection (Google Gemini Vision)
- ✅ Automatic recipe generation
- ✅ Save to user's recipe collection
- ✅ File validation (type, size)
- ✅ Authentication required
- ✅ Error handling
- ✅ No permanent image storage (privacy)

---

## 🔒 Security

- 🔐 JWT authentication required
- 📏 10MB file size limit
- 🖼️ Image type validation
- 🚫 No permanent storage of photos
- ✅ Input sanitization

---

## 🧪 Testing

### Run Tests
```bash
pytest tests/test_image_ingredients.py -v
```

### Manual Testing
```bash
python scripts/example_photo_upload.py test_image.jpg
```

### Postman
1. POST `/auth/login` → Get token
2. POST `/recipes/analyze-ingredients` → Upload image
3. Check response

---

## 🎨 Frontend Integration

When ready to add to the React frontend:

```typescript
// New component: PhotoUploadPage.tsx
const PhotoUploadPage = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/recipes/analyze-ingredients', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await res.json();
    setIngredients(data.ingredients);
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={e => 
        e.target.files && handleUpload(e.target.files[0])
      } />
      <IngredientList items={ingredients} />
    </div>
  );
};
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "GEMINI_API_KEY not found" | Add to `.env` file |
| "File must be an image" | Only upload image files |
| "No ingredients detected" | Use clearer, well-lit photo |
| "Unauthorized" | Login first |

---

## 📊 Performance

- **Response Time:** 2-5 seconds
- **Max File Size:** 10MB
- **Supported Formats:** JPEG, PNG, WebP, GIF, BMP
- **API Calls:** 1-2 per request

---

## 🚀 Next Steps

1. **Test the feature** with the example script
2. **Review the documentation** in `docs/`
3. **Create frontend UI** for photo upload
4. **Add to your app** navigation
5. **Deploy** to production

---

## 📞 Need Help?

- Check the documentation in `backend/docs/`
- Run the example script: `python scripts/example_photo_upload.py`
- View API docs: http://localhost:8000/docs

---

## 🎉 You're Ready!

The feature is fully implemented and ready to use. Follow the Quick Start guide to test it, then integrate it into your frontend when ready.

**Happy cooking! 🍳**
