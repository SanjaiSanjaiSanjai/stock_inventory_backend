"""Authentication endpoints."""

import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core import security
from app.db.session import get_db
from app.models import SignUp
from app.schemas.auth import AuthResponse, LoginRequest, TokenResponse, UserCreate

router = APIRouter(tags=["authentication"])
EMAIL_PATTERN = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(key="refresh_token", value=token, httponly=True, samesite="lax", secure=True, max_age=15 * 60)


@router.post("/signup", response_model=AuthResponse)
async def signup(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    if not 3 <= len(user.username) <= 21:
        raise HTTPException(status_code=400, detail="Username must be between 3 and 21 characters")
    if not re.match(r"^[A-Za-z0-9_]+$", user.username):
        raise HTTPException(status_code=400, detail="Username must contain only letters, numbers and underscores")
    if not re.match(EMAIL_PATTERN, user.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if db.execute(select(SignUp).where(SignUp.email == user.email)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")

    user_model = SignUp(username=user.username, email=user.email, password=security.hash_password(user.password))
    try:
        db.add(user_model)
        db.commit()
        db.refresh(user_model)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from exc

    payload = {"id": user_model.id, "email": user_model.email, "role": user_model.role}
    _set_refresh_cookie(response, security.generate_refreshtoken(payload))
    return AuthResponse(data=user_model, token=security.generate_accesstoken(payload))


@router.post("/login", response_model=AuthResponse)
async def login(user: LoginRequest, response: Response, db: Session = Depends(get_db)):
    if not re.match(EMAIL_PATTERN, user.email) or len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Invalid user details")
    user_model = db.execute(select(SignUp).where(SignUp.email == user.email)).scalar_one_or_none()
    if not user_model or not security.verify_password(user.password, user_model.password):
        raise HTTPException(status_code=400, detail="Invalid user details")

    payload = {"id": user_model.id, "email": user_model.email, "role": user_model.role}
    _set_refresh_cookie(response, security.generate_refreshtoken(payload))
    return AuthResponse(data=user_model, token=security.generate_accesstoken(payload))


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_access_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Please login")
    return TokenResponse(token=security.generate_accesstoken(security.decode_refresh_token(refresh_token)))
