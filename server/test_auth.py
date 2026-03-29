#!/usr/bin/env python3
"""
Simple test script to verify authentication system is working.
Run this from the server directory: python test_auth.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from services.auth_service import register_user, login_user
from database.models import get_db

# Test database connection
print("[TEST] Checking database connection...")
try:
    conn = get_db()
    result = conn.execute("SELECT 1 as test")
    print(f"✓ Database connection successful")
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    sys.exit(1)

# Test user registration
print("\n[TEST] Testing user registration...")
test_email = "test@example.com"
test_password = "TestPassword123"
test_name = "Test User"

result = register_user(test_email, test_password, test_name)
print(f"Registration result: {result}")

if "error" in result:
    print(f"✗ Registration failed: {result['error']}")
    sys.exit(1)
else:
    user_id = result.get("user_id")
    token = result.get("token")
    print(f"✓ Registration successful! User ID: {user_id}")

# Test user login
print("\n[TEST] Testing user login...")
login_result = login_user(test_email, test_password)
print(f"Login result: {login_result}")

if "error" in login_result:
    print(f"✗ Login failed: {login_result['error']}")
    sys.exit(1)
else:
    print(f"✓ Login successful! Token: {login_result['token'][:20]}...")

print("\n[TEST] All authentication tests passed!")
