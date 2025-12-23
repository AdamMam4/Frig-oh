# Frig-oh Backend API

FastAPI backend for Frig-oh with image-based ingredient recognition.

## Features

- 🔐 JWT authentication
- 📝 Recipe management
- 📸 Image-based ingredient recognition (AI)
- 🤖 Automatic recipe generation
- 👤 User profile management

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```
- Windows CMD:
```cmd
.\venv\Scripts\activate.bat
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

## Run the server

```bash
python run.py
```

The API will be available at: http://localhost:8000

Interactive documentation (Swagger UI): http://localhost:8000/docs

## Photo/AI features

To use the image ingredient recognition and recipe generation features, see the full docs: `./docs/PHOTO_FEATURES.md`.

### Quick test:
```bash
# Test with the demo script
python scripts/example_photo_upload.py path/to/image.jpg
```

## Project structure

```
backend/
├── app/
│   ├── routes/          # API endpoints
│   │   ├── auth.py      # Authentication
│   │   └── recipes.py   # Recipes + Photo AI
│   ├── services/        # Business logic
│   │   ├── ai.py        # AI service (Gemini)
│   │   ├── auth.py      # Authentication service
│   │   ├── recipe.py    # Recipe service
│   │   └── user.py      # User service
│   ├── database.py      # MongoDB configuration
│   ├── models.py        # Data models
│   └── main.py          # FastAPI entrypoint
├── docs/
│   └── PHOTO_FEATURES.md # Photo/AI documentation
├── scripts/
│   └── example_photo_upload.py # Demo script
├── tests/
│   └── test_image_ingredients.py # Photo/AI tests
├── main.py              # Application entrypoint
├── run.py               # Launch script
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## Tests

```bash
# Run all tests
pytest

# Photo-related tests
pytest tests/test_image_ingredients.py -v
```

