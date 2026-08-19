"""Reusable authentication and authorization dependencies."""

from fastapi import Depends, HTTPException, status

from app.core.security import decodejwt_current_user


def require_role(role: str):
    async def role_checker(user: dict = Depends(decodejwt_current_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"{role.capitalize()} access required")
        return user

    return role_checker


def require_any_role(*roles: str):
    async def role_checker(user: dict = Depends(decodejwt_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff or admin access required")
        return user

    return role_checker


superadminmiddleware = require_role("superadmin")
adminmiddleware = require_role("admin")
staffmiddleware = require_role("staff")
staff_or_admin_middleware = require_any_role("staff", "admin")
