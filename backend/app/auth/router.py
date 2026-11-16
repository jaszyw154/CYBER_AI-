from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.deps import get_current_user
from app.auth.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.auth.service import (
    InvalidCredentialsError,
    UserExistsError,
    authenticate_user,
    create_access_token,
    create_user,
)
from app.config.settings import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    try:
        user = create_user(email=body.email, password=body.password, display_name=body.display_name)
    except UserExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    return UserResponse(
        id=user["id"],
        email=user["email"],
        display_name=user["display_name"],
        role=user["role"],
        created_at=user["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, response: Response):
    try:
        user = authenticate_user(email=body.email, password=body.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    settings = get_settings()
    token = create_access_token(subject=user["id"], extra_claims={"role": user["role"]})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.jwt_expire_seconds,
        secure=False,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.jwt_expire_seconds,
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        display_name=current_user["display_name"],
        role=current_user["role"],
        created_at=current_user["created_at"],
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"detail": "Logged out successfully"}
