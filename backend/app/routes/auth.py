from fastapi import APIRouter, Depends, HTTPException, status
from app.models import UserCreate, UserBase, LoginRequest
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
async def login(payload: LoginRequest):
    """Authenticate using email + password only."""
    print(f"Tentative de connexion avec l'email: {payload.email}")
    db_user = await user_service.get_user_by_email(payload.email)

    if not db_user:
        print("Utilisateur non trouvé dans la base de données")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not registered"
        )

    print("Vérification du mot de passe...")
    if not auth_service.verify_password(payload.password, db_user["hashed_password"]):
        print("Mot de passe incorrect")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    print("Création du token d'accès...")
    access_token = auth_service.create_access_token(data={"sub": payload.email})
    print("Token créé avec succès")
    return {"access_token": access_token, "token_type": "bearer"}