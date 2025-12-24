from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, recipes, favorites
import yaml
from pathlib import Path

app = FastAPI(title="Recipe API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
app.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])


@app.get("/")
async def root():
    return {"message": "Welcome to Recipe API. See /docs for documentation"}


# Override OpenAPI schema with YAML file (if present) so Swagger UI follows the provided spec
def load_external_openapi():
    try:
        base = Path(__file__).resolve().parents[1]  # backend/ directory
        openapi_path = base / "openapi.yaml"
        if openapi_path.exists():
            with openapi_path.open("r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                return data
    except Exception:
        pass
    return None


external_spec = load_external_openapi()
if external_spec:
    # Replace the app's OpenAPI with the loaded spec
    app.openapi_schema = external_spec
    def _openapi():
        return app.openapi_schema
    app.openapi = _openapi
