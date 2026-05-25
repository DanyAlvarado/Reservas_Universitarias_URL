from app.extensions import db

class Resource(db.Model):
    __tablename__ = "resources"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(20), nullable=False)  # lab|cubicle|projector|room
    location = db.Column(db.String(100))
    capacity = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "resource_type": self.resource_type,
                "location": self.location, "capacity": self.capacity}