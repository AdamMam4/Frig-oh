from fastapi import APIRouter, Depends, HTTPException, status
from app.models import UserCreate, UserBase
from app.services.auth import AuthService
from app.services.user import UserService

router = APIRouter()
auth_service = AuthService()
user_service = UserService()

@router.post("/register", response_model=UserBase)
async def register(user: UserCreate):
    # Check if user exists
    if await user_service.get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return await user_service.create_user(user)

@router.post("/login")
async def login(user: UserCreate):
    db_user = await user_service.get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not registered"
        )
    
    if not auth_service.verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}