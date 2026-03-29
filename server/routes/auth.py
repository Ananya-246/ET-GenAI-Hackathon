"""
Authentication endpoint routes.
Handles user registration, login, logout, and profile management.
"""

from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from services.auth_service import (
    register_user, login_user, verify_jwt_token, 
    get_user_by_id, update_user_profile
)
import os

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")


def token_required(f):
    """Decorator to verify JWT token in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Extract token from Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]  # "Bearer <token>"
            except IndexError:
                return {"error": "Invalid authorization header"}, 401
        
        if not token:
            return {"error": "Authorization token missing"}, 401
        
        # Verify token
        payload = verify_jwt_token(token)
        if "error" in payload:
            return {"error": payload.get("error")}, 401
        
        # Attach user_id to request context
        request.user_id = payload.get("user_id")
        request.email = payload.get("email")
        
        return f(*args, **kwargs)
    
    return decorated


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "securepwd123",
        "name": "John Doe"
    }
    
    Response:
    {
        "success": true,
        "user_id": 1,
        "email": "user@example.com",
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    data = request.get_json()
    
    if not data:
        return {"error": "Request body required"}, 400
    
    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    
    result = register_user(email, password, name)
    
    if "error" in result:
        return result, 400
    
    return result, 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT token.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "securepwd123"
    }
    
    Response:
    {
        "success": true,
        "user_id": 1,
        "email": "user@example.com",
        "display_name": "John Doe",
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    data = request.get_json()
    
    if not data:
        return {"error": "Request body required"}, 400
    
    email = data.get("email", "").strip()
    password = data.get("password", "")
    
    result = login_user(email, password)
    
    if "error" in result:
        return result, 401
    
    return result, 200


@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """
    Get authenticated user's profile.
    Requires Authorization header with valid JWT token.
    """
    user = get_user_by_id(request.user_id)
    
    if not user:
        return {"error": "User not found"}, 404
    
    return {
        "success": True,
        "user": user
    }, 200


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    """
    Update authenticated user's profile.
    Requires Authorization header with valid JWT token.
    
    Request body:
    {
        "display_name": "New Name",
        "persona": "technology"
    }
    """
    data = request.get_json()
    
    if not data:
        return {"error": "Request body required"}, 400
    
    result = update_user_profile(request.user_id, **data)
    
    if "error" in result:
        return result, 400
    
    # Fetch updated user
    user = get_user_by_id(request.user_id)
    
    return {
        "success": True,
        "user": user
    }, 200


@auth_bp.route("/verify", methods=["POST"])
@token_required
def verify():
    """
    Verify that the provided JWT token is valid.
    Requires Authorization header with valid JWT token.
    """
    user = get_user_by_id(request.user_id)
    
    if not user:
        return {"error": "User not found"}, 404
    
    return {
        "success": True,
        "user_id": request.user_id,
        "email": request.email
    }, 200


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    """
    Logout user (token invalidation on client side).
    This endpoint confirms the logout action.
    """
    return {
        "success": True,
        "message": "Successfully logged out"
    }, 200
