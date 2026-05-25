from app.extensions import db
from datetime import datetime, timezone, timedelta

class Reservation(db.Model):
    __tablename__ = "reservations"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey("resources.id"), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="active")  # active | cancelled
    purpose = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", foreign_keys=[user_id])
    resource = db.relationship("Resource")

    def can_cancel(self):
        now = datetime.now(timezone.utc)
        start = self.start_time.replace(tzinfo=timezone.utc) if not self.start_time.tzinfo else self.start_time
        return self.status == "active" and (start - now) >= timedelta(minutes=30)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id,
                "resource_id": self.resource_id, "resource_name": self.resource.name,
                "start_time": self.start_time.isoformat(), "end_time": self.end_time.isoformat(),
                "status": self.status, "purpose": self.purpose}