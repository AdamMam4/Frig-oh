from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        # Accept extra args/kwargs for compatibility with different pydantic versions
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class UserBase(BaseModel):
    email: str = Field(..., example="user@example.com")
    username: str = Field(..., min_length=3, max_length=50, example="johndoe")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="strongpassword123")


class LoginRequest(BaseModel):
    email: str = Field(..., example="user@example.com")
    password: str = Field(..., min_length=6, example="strongpassword123")


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., example="user@example.com")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., example="reset_token_here")
    new_password: str = Field(..., min_length=6, example="newstrongpassword123")


class UpdateUsernameRequest(BaseModel):
    new_username: str = Field(..., min_length=3, max_length=50, example="newusername")


class ChangePasswordRequest(BaseModel):
    """Request to initiate password change (sends verification code by email)"""
    pass


class VerifyPasswordChangeRequest(BaseModel):
    """Verify code and change password"""
    code: str = Field(..., example="123456")
    new_password: str = Field(..., min_length=6, example="newstrongpassword123")


class UserInDB(UserBase):
    # Use string representation for OpenAPI friendliness
    id: str = Field(default_factory=lambda: str(PyObjectId()), alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    ingredients: List[str]
    instructions: List[str]
    cooking_time: int = Field(..., gt=0, description="Cooking time in minutes")
    servings: int = Field(..., gt=0)
    difficulty: str = Field(default="Moyen", description="Difficulty level: Facile, Moyen, Difficile")
    image_url: Optional[str] = Field(default=None, description="URL de l'image de la recette")


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    """Model for updating recipe fields"""
    image_url: Optional[str] = Field(default=None, description="URL de l'image de la recette")


class RecipePreview(BaseModel):
    """Preview of a generated recipe (not yet saved)"""
    title: str
    ingredients: List[str]
    instructions: List[str]
    cooking_time: int
    servings: int
    difficulty: str = "Moyen"
    image_url: Optional[str] = None


class Recipe(RecipeBase):
    # Expose _id and user_id as strings in API schemas to avoid pydantic JSON schema issues
    id: str = Field(default_factory=lambda: str(PyObjectId()), alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_ai_generated: bool = Field(default=False)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(PyObjectId()), alias="_id")
    user_id: str
    recipe_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class UserStats(BaseModel):
    email: str
    username: str
    total_recipes: int
    ai_generated_recipes: int
    favorites_count: int
