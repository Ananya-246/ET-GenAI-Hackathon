"""
Authentication service for user registration, login, and token management.
Uses bcrypt for password hashing and JWT for session tokens.
"""

import os
import bcrypt
import jwt
import logging
import traceback
from datetime import datetime, timedelta
from database.models import get_db

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("auth_service")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
TOKEN_EXPIRY_HOURS = int(os.getenv("TOKEN_EXPIRY_HOURS", "24"))


def _get_value(row, key, index=0):
    """
    Extract value from result row (works with both dict and tuple results).
    For dicts (Postgres), uses key; for tuples (SQLite), uses index.
    """
    if row is None:
        return None
    
    if isinstance(row, dict):
        return row.get(key)
    else:
        return row[index]


def hash_password(password):
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password, hashed):
    """Verify password against hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_jwt_token(user_id, email):
    """Create JWT token for user session."""
    payload = {
        "user_id": user_id,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def verify_jwt_token(token):
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired", "code": "TOKEN_EXPIRED"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token", "code": "INVALID_TOKEN"}


def register_user(email, password, name):
    """
    Register a new user.
    
    Args:
        email: User email (unique)
        password: User password (will be hashed)
        name: User display name
    
    Returns:
        dict with user_id and token on success, error dict on failure
    """
    # Validate input
    if not email or not password or not name:
        return {"error": "Missing required fields", "code": "INVALID_INPUT"}
    
    # Check password strength
    if len(password) < 8:
        return {"error": "Password must be at least 8 characters", "code": "WEAK_PASSWORD"}
    
    conn = get_db()
    try:
        # Check if user exists
        result = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email.lower(),)
        )
        if result.fetchone():
            return {"error": "Email already registered", "code": "USER_EXISTS"}
        
        # Create user
        hashed_password = hash_password(password)
        now = datetime.utcnow().isoformat()
        conn.execute(
            """
            INSERT INTO users (email, password, display_name, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (email.lower(), hashed_password, name, now)
        )
        conn.commit()
        
        # Fetch created user
        result = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email.lower(),)
        )
        user_row = result.fetchone()
        if not user_row:
            return {"error": "Failed to create user", "code": "CREATE_FAILED"}
        
        # Handle both dict (Postgres) and tuple (SQLite) results
        user_id = _get_value(user_row, "id", 0)
        if not user_id:
            return {"error": "Failed to retrieve user ID", "code": "CREATE_FAILED"}
        
        token = create_jwt_token(user_id, email)
        
        # Initialize user profile
        now = datetime.utcnow().isoformat()
        conn.execute(
            """
            INSERT INTO user_profile (user_id, persona, created_at)
            VALUES (?, ?, ?)
            """,
            (user_id, "technology", now)
        )
        conn.commit()
        
        return {
            "success": True,
            "user_id": user_id,
            "email": email,
            "token": token,
        }
    
    except Exception as e:
        logger.error(f"Registration error: {type(e).__name__}: {str(e)}")
        logger.error(traceback.format_exc())
        return {"error": f"Registration failed: {str(e)}", "code": "REGISTRATION_ERROR"}
    finally:
        conn.close()


def login_user(email, password):
    """
    Authenticate user and return JWT token.
    
    Args:
        email: User email
        password: User password (will be verified)
    
    Returns:
        dict with user_id and token on success, error dict on failure
    """
    if not email or not password:
        return {"error": "Missing email or password", "code": "INVALID_INPUT"}
    
    conn = get_db()
    try:
        # Fetch user
        result = conn.execute(
            "SELECT id, email, password, display_name FROM users WHERE email = ?",
            (email.lower(),)
        )
        user_row = result.fetchone()
        
        if not user_row:
            return {"error": "Invalid credentials", "code": "INVALID_CREDENTIALS"}
        
        # Handle both dict (Postgres) and tuple (SQLite) results
        user_id = _get_value(user_row, "id", 0)
        stored_hash = _get_value(user_row, "password", 2)
        display_name = _get_value(user_row, "display_name", 3)
        
        if not user_id or not stored_hash:
            return {"error": "Invalid user data", "code": "INVALID_CREDENTIALS"}
        
        # Verify password
        if not verify_password(password, stored_hash):
            return {"error": "Invalid credentials", "code": "INVALID_CREDENTIALS"}
        
        # Create token
        token = create_jwt_token(user_id, email)
        
        return {
            "success": True,
            "user_id": user_id,
            "email": email,
            "display_name": display_name,
            "token": token,
        }
    
    except Exception as e:
        logger.error(f"Login error: {type(e).__name__}: {str(e)}")
        logger.error(traceback.format_exc())
        return {"error": f"Login failed: {str(e)}", "code": "LOGIN_ERROR"}
    finally:
        conn.close()


def get_user_by_id(user_id):
    """Fetch user profile by user ID."""
    conn = get_db()
    try:
        result = conn.execute(
            "SELECT id, email, display_name, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        user_row = result.fetchone()
        
        if not user_row:
            return None
        
        # Handle both dict (Postgres) and tuple (SQLite) results
        return {
            "id": _get_value(user_row, "id", 0),
            "email": _get_value(user_row, "email", 1),
            "display_name": _get_value(user_row, "display_name", 2),
            "created_at": _get_value(user_row, "created_at", 3),
        }
    except Exception as e:
        logger.error(f"Get user error: {type(e).__name__}: {str(e)}")
        return None
    finally:
        conn.close()


def update_user_profile(user_id, **updates):
    """Update user profile fields."""
    conn = get_db()
    try:
        allowed_fields = ["display_name", "persona"]
        update_parts = []
        params = []
        
        for field, value in updates.items():
            if field in allowed_fields:
                update_parts.append(f"{field} = ?")
                params.append(value)
        
        if not update_parts:
            return {"error": "No valid fields to update", "code": "INVALID_UPDATE"}
        
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(update_parts)} WHERE id = ?"
        conn.execute(query, tuple(params))
        conn.commit()
        
        return {"success": True, "message": "Profile updated"}
    
    except Exception as e:
        logger.error(f"Update user error: {type(e).__name__}: {str(e)}")
        return {"error": f"Update failed: {str(e)}", "code": "UPDATE_ERROR"}
    finally:
        conn.close()
