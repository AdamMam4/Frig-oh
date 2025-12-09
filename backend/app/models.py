from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

class UserBase(BaseModel):
    email: str = Field(..., example="user@example.com")
    username: str = Field(..., min_length=3, max_length=50, example="johndoe")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="strongpassword123")

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    ingredients: List[str]
    instructions: List[str]
    cooking_time: int = Field(..., gt=0, description="Cooking time in minutes")
    servings: int = Field(..., gt=0)

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_ai_generated: bool = Field(default=False)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True
        populate_by_name = True