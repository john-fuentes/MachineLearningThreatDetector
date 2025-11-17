import random
from flask import Blueprint, request, jsonify, make_response
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from config import Config
from flask_mail import Message
from extensions import mail

auth_bp = Blueprint("auth", __name__)

# ==================== TEST ROUTE ====================
@auth_bp.route("/test-db")
def test_db():
    try:
        users = User.query.all()
        return {"users": [user.username for user in users]}
    except Exception as e:
        return {"error": str(e)}, 500


# ==================== SIGNUP ====================
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    
    if username and User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    
    email_code = str(random.randint(100000, 999999))
    expiration_time = datetime.utcnow() + timedelta(minutes=5)

    user = User(
        username=username, 
        email=email, 
        first_name=first_name,
        last_name=last_name,
        role="analyst",
        email_code=email_code,
        email_code_expiration=expiration_time
    )

    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    msg = Message('Verify your account', recipients=[email])
    msg.body = f"Hello {first_name or 'User'},\n\nYour code is: {email_code}"
    mail.send(msg)

    return jsonify({
        "message": "Account created! Check your email for the verification code"
    }), 201


# ==================== VERIFY EMAIL ====================
@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.json
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # 🔹 Check if code matches
    if user.email_code != code:
        return jsonify({"error": "Invalid code"}), 400

    # 🔹 Check if expired
    if user.email_code_expiration and user.email_code_expiration < datetime.utcnow():
        return jsonify({"error": "Code expired"}), 400

    # ✅ Success — mark verified
    user.email_verified = True
    user.email_code = None
    user.email_code_expiration = None
    db.session.commit()

    return jsonify({"message": "Email verified"}), 200


# ==================== LOGIN (REGULAR USERS) ====================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.email_verified:
        return jsonify({"error": "Email not verified"}), 403

    payload = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }

    token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    }), 200

@auth_bp.route("/exchange-token", methods=["POST"])
def exchange_token():
    data = request.get_json()
    email = data.get("email")
    name = data.get("name")

    if not email:
        return jsonify({"error": "Missing email"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Create a user record for Google users
        user = User(
            email=email,
            username=name or email.split("@")[0],
            first_name=name.split(" ")[0] if name else None,
            last_name=name.split(" ")[1] if name and len(name.split(" ")) > 1 else None,
            email_verified=True,
            role="analyst"
        )
        db.session.add(user)
        db.session.commit()

    # Generate HS256 JWT (valid for 1 hour)
    payload = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role
        }
    }), 200


# ==================== PASSWORD RESET ====================
@auth_bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return {"error": "User not found"}, 404
    
    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(minutes=5)},
        key=Config.SECRET_KEY,
        algorithm="HS256"
    )
    
    msg = Message(subject="Password Reset", recipients=[user.email])
    msg.body = f"Hello {user.username},\n\nUse this link to reset your password:\nhttp://localhost:3000/reset-password?token={token}"
    mail.send(msg)

    return {"message": "Check your email for reset link"}

# Serve the password reset page (GET)
@auth_bp.route("/reset-password", methods=["GET"])
def reset_password_page():
    token = request.args.get("token")
    if not token:
        return "Invalid or missing token", 400
    return f"Token received: {token}. Please use the frontend to submit your new password."

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    try:
        payload = jwt.decode(data["token"], Config.SECRET_KEY, algorithms=["HS256"])
        user = User.query.get(payload["user_id"])
        user.set_password(data["new_password"])
        db.session.commit()
        return {"message": "Password reset successful"}
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}, 400
    except Exception:
        return {"error": "Invalid token"}, 400
    
# ==================== RESEND CODE ====================
@auth_bp.route("/resend-verification-code", methods=["POST"])
def resend_verification_code():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return {"error": "User not found"}, 404

    if user.email_verified:
        return {"message": "Email already verified"}, 400

    # Generate new code and expiration
    email_code = str(random.randint(100000, 999999))
    expiration_time = datetime.utcnow() + timedelta(minutes=15)
    user.email_code = email_code
    user.email_code_expiration = expiration_time
    db.session.commit()

    # Send email
    msg = Message("Verify your account", recipients=[user.email])
    msg.body = f"Hello {user.first_name or 'User'},\n\nYour new verification code is: {email_code}"
    mail.send(msg)

    return {"message": "Verification code resent. Check your email."}

# ==================== VERIFY SESSION ====================
@auth_bp.route("/verify-session", methods=["GET"])
def verify_session():
    token = request.cookies.get("token")
    if not token:
        return jsonify({"authenticated": False}), 401

    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"authenticated": False}), 401
        return jsonify({
            "authenticated": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "username": user.username
            }
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"authenticated": False, "error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"authenticated": False, "error": "Invalid token"}), 401


# ==================== LOGOUT ====================
@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logged out"})
    response.set_cookie("token", "", expires=0)
    return response
