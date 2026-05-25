from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Resource, Reservation

resources_bp = Blueprint("resources", __name__)

@resources_bp.get("/")
@jwt_required()
def list_resources():
    rtype = request.args.get("type")
    q = Resource.query.filter_by(is_active=True)
    if rtype:
        q = q.filter_by(resource_type=rtype)
    return jsonify([r.to_dict() for r in q.all()])

@resources_bp.get("/<int:rid>/availability")
@jwt_required()
def availability(rid):
    resource = db.get_or_404(Resource, rid)
    date_str = request.args.get("date")
    from datetime import datetime
    date = datetime.strptime(date_str, "%Y-%m-%d").date()
    reservations = Reservation.query.filter(
        Reservation.resource_id == rid,
        Reservation.status == "active",
        db.func.date(Reservation.start_time) == date
    ).all()
    return jsonify({
        "resource": resource.to_dict(),
        "date": date_str,
        "busy_slots": [{"start": r.start_time.isoformat(), "end": r.end_time.isoformat()} for r in reservations]
    })