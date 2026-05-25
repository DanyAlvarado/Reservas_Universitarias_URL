from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models import Reservation, Resource
from datetime import datetime, timezone

reservations_bp = Blueprint("reservations", __name__)

def has_conflict(resource_id, start, end):
    return Reservation.query.filter(
        Reservation.resource_id == resource_id,
        Reservation.status == "active",
        Reservation.start_time < end,
        Reservation.end_time > start
    ).first() is not None

@reservations_bp.post("/")
@jwt_required()
def create():
    data = request.get_json()
    start = datetime.fromisoformat(data["start_time"]).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(data["end_time"]).replace(tzinfo=timezone.utc)

    if start >= end:
        return jsonify({"error": "Hora inicio debe ser antes que hora fin"}), 400
    if start <= datetime.now(timezone.utc):
        return jsonify({"error": "No se puede reservar en el pasado"}), 400
    if has_conflict(data["resource_id"], start, end):
        return jsonify({"error": "El recurso ya está reservado en ese horario"}), 409

    r = Reservation(user_id=int(get_jwt_identity()), resource_id=data["resource_id"],
                    start_time=start, end_time=end, purpose=data.get("purpose"))
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201

@reservations_bp.get("/")
@jwt_required()
def list_reservations():
    user_id = int(get_jwt_identity())
    reservations = Reservation.query.filter_by(user_id=user_id).order_by(Reservation.start_time.desc()).all()
    return jsonify([r.to_dict() for r in reservations])

@reservations_bp.delete("/<int:rid>/cancel")
@jwt_required()
def cancel(rid):
    reservation = db.get_or_404(Reservation, rid)
    if reservation.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Sin permiso"}), 403
    if not reservation.can_cancel():
        return jsonify({"error": "Cancelación requiere al menos 30 min de anticipación"}), 409
    reservation.status = "cancelled"
    db.session.commit()
    return jsonify(reservation.to_dict())