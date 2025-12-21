from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, recipes, favorites

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
