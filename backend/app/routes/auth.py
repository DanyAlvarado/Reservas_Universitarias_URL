from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"error": "Credenciales incorrectas"}), 401
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"access_token": token, "user": user.to_dict()}), 200

@auth_bp.get("/me")
@jwt_required()
def me():
    user = db.get_or_404(User, int(get_jwt_identity()))
    return jsonify(user.to_dict())