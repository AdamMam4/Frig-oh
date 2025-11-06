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

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
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

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_ai_generated: bool = Field(default=False)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True