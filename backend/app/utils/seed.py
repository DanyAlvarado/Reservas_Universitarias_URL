from app import db
from app.models import User, Resource

def seed_db():
    # Usuarios
    users = [
        ("admin", "admin@url.edu.gt", "Admin Sistema", "admin", "admin123"),
        ("estudiante1", "est1@url.edu.gt", "María García", "student", "123456"),
        ("estudiante2", "est2@url.edu.gt", "Carlos Mendoza", "student", "123456"),
    ]
    for username, email, full_name, role, password in users:
        if not User.query.filter_by(username=username).first():
            u = User(username=username, email=email, full_name=full_name, role=role)
            u.set_password(password)
            db.session.add(u)

    # Recursos
    resources = [
        ("Laboratorio A-101", "lab", "Edificio A", 30),
        ("Laboratorio B-202", "lab", "Edificio B", 25),
        ("Cubículo 1", "cubicle", "Biblioteca", 6),
        ("Cubículo 2", "cubicle", "Biblioteca", 6),
        ("Proyector P-01", "projector", "Bodega AV", None),
        ("Salón Magna", "room", "Edificio Central", 120),
    ]
    for name, rtype, location, capacity in resources:
        if not Resource.query.filter_by(name=name).first():
            db.session.add(Resource(name=name, resource_type=rtype,
                                    location=location, capacity=capacity))
    db.session.commit()
    print("Seed completado")