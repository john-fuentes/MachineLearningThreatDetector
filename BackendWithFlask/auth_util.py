# BackendWithFlask/auth_util.py
from functools import wraps
from flask import request, jsonify
import jwt
from config import Config

def verify_flask_jwt():
    """Decode and verify JWT from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print(" Missing or invalid Authorization header")
        return None

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        print(" Verified Flask JWT:", payload)
        return payload
    except jwt.ExpiredSignatureError:
        print(" Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f" Invalid token: {e}")
        return None

def require_auth(f):
    """Decorator to protect routes with JWT verification."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        payload = verify_flask_jwt()
        if not payload:
            return jsonify({"error": "Unauthorized"}), 401
        return f(payload, *args, **kwargs)
    return wrapper
