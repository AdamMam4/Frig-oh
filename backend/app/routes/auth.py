from fastapi import APIRouter, Depends, HTTPException, status
from app.models import UserCreate, UserBase, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, UserStats, UpdateUsernameRequest, ChangePasswordRequest, VerifyPasswordChangeRequest
from app.services.auth import AuthService
from app.services.user import UserService
from app.services.email import email_service
from app.database import password_reset_collection, recipes_collection, favorites_collection
from datetime import datetime, timedelta
import secrets
import random

router = APIRouter()
auth_service = AuthService()
user_service = UserService()


def generate_reset_code() -> str:
    """Generate a 6-digit reset code."""
    return str(random.randint(100000, 999999))


@router.post("/register", response_model=UserBase)
async def register(user: UserCreate):
    # Check if user exists
    if await user_service.get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
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
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email not registered"
        )

    print("Vérification du mot de passe...")
    if not auth_service.verify_password(payload.password, db_user["hashed_password"]):
        print("Mot de passe incorrect")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password"
        )

    print("Création du token d'accès...")
    access_token = auth_service.create_access_token(data={"sub": payload.email})
    print("Token créé avec succès")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """Request a password reset code sent by email."""
    db_user = await user_service.get_user_by_email(payload.email)

    if not db_user:
        # For security reasons, do not reveal whether the email exists
        return {"message": "Si cet email existe, un code de réinitialisation a été envoyé", "email_sent": False}

    # Generate a 6-digit code
    reset_code = generate_reset_code()
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Delete old codes for this user
    await password_reset_collection.delete_many({"email": payload.email})

    # Save the new code
    await password_reset_collection.insert_one({
        "email": payload.email,
        "token": reset_code,
        "expires_at": expires_at,
        "created_at": datetime.utcnow()
    })

    # Send the email
    email_sent = email_service.send_password_reset_email(payload.email, reset_code)
    
    if email_sent:
        return {
            "message": "Un code de réinitialisation a été envoyé à votre adresse email",
            "email_sent": True
        }
    else:
        # If the email could not be sent (service not configured), return the code for dev
        return {
            "message": "Service email non configuré. Voici votre code (dev uniquement)",
            "email_sent": False,
            "reset_code": reset_code  # Only if email is not configured
        }


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    """Reset the password using a valid reset token."""
    # Verify the token
    reset_record = await password_reset_collection.find_one({"token": payload.token})

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )

    if reset_record["expires_at"] < datetime.utcnow():
        # Delete the expired token
        await password_reset_collection.delete_one({"token": payload.token})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )

    # Update the password
    hashed_password = auth_service.get_password_hash(payload.new_password)
    await user_service.update_user_password(reset_record["email"], hashed_password)

    # Delete the used token
    await password_reset_collection.delete_one({"token": payload.token})

    return {"message": "Mot de passe réinitialisé avec succès"}


@router.get("/me", response_model=UserStats)
async def get_current_user_stats(current_user=Depends(auth_service.get_current_user)):
    """Get current user information and statistics."""
    user_id = current_user["_id"]
    
    # Count total recipes
    total_recipes = await recipes_collection.count_documents({"user_id": user_id})
    
    # Count AI-generated recipes
    ai_generated_recipes = await recipes_collection.count_documents({
        "user_id": user_id,
        "is_ai_generated": True
    })
    
    # Count favorites
    favorites_count = await favorites_collection.count_documents({"user_id": str(user_id)})
    
    return UserStats(
        email=current_user["email"],
        username=current_user.get("username", "Utilisateur"),
        total_recipes=total_recipes,
        ai_generated_recipes=ai_generated_recipes,
        favorites_count=favorites_count
    )


@router.put("/update-username")
async def update_username(payload: UpdateUsernameRequest, current_user=Depends(auth_service.get_current_user)):
    """Update the current user's username."""
    success = await user_service.update_username(current_user["email"], payload.new_username)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du nom d'utilisateur"
        )
    
    return {"message": "Nom d'utilisateur mis à jour avec succès", "username": payload.new_username}


@router.post("/request-password-change")
async def request_password_change(current_user=Depends(auth_service.get_current_user)):
    """Request a verification code to change password (sent by email)."""
    email = current_user["email"]
    
    # Generate a 6-digit code
    reset_code = generate_reset_code()
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Delete old codes for this user
    await password_reset_collection.delete_many({"email": email})

    # Save the new code
    await password_reset_collection.insert_one({
        "email": email,
        "token": reset_code,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
        "type": "password_change"
    })

    # Send the email
    email_sent = email_service.send_password_reset_email(email, reset_code)
    
    if email_sent:
        return {
            "message": "Un code de vérification a été envoyé à votre adresse email",
            "email_sent": True
        }
    else:
        # If the email could not be sent (service not configured), return the code for dev
        return {
            "message": "Service email non configuré. Voici votre code (dev uniquement)",
            "email_sent": False,
            "reset_code": reset_code
        }


@router.post("/verify-password-change")
async def verify_password_change(payload: VerifyPasswordChangeRequest, current_user=Depends(auth_service.get_current_user)):
    """Verify code and change password for authenticated user."""
    email = current_user["email"]
    
    # Verify the code
    reset_record = await password_reset_collection.find_one({"email": email, "token": payload.code})

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expiré"
        )

    if reset_record["expires_at"] < datetime.utcnow():
        await password_reset_collection.delete_one({"token": payload.code})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expiré"
        )

    # Update the password
    hashed_password = auth_service.get_password_hash(payload.new_password)
    await user_service.update_user_password(email, hashed_password)

    # Delete the used code
    await password_reset_collection.delete_one({"token": payload.code})

    return {"message": "Mot de passe modifié avec succès"}
