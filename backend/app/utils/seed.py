from app.extensions import db
from app.models import User, Resource

def seed_db():
    users = [
        ("admin", "admin@url.edu.gt", "Admin Sistema", "admin", "admin123"),
        ("estudiante1", "est1@url.edu.gt", "Maria Garcia", "student", "123456"),
        ("estudiante2", "est2@url.edu.gt", "Carlos Mendoza", "student", "123456"),
    ]
    for username, email, full_name, role, password in users:
        if not User.query.filter_by(username=username).first():
            u = User(username=username, email=email, full_name=full_name, role=role)
            u.set_password(password)
            db.session.add(u)

    resources = []

    for salon in range(1, 11):
        resources.append((f"Lab T-{100 + salon}", "lab", "Edificio T, Nivel 1", 30))

    for edificio in ["O", "C", "M", "L"]:
        for nivel in [100, 200, 300, 400]:
            for salon in range(1, 11):
                resources.append((
                    f"Salon {edificio}-{nivel + salon}",
                    "room",
                    f"Edificio {edificio}, Nivel {nivel // 100}",
                    40
                ))

    for i in range(1, 7):
        resources.append((f"Cubiculo {i}", "cubicle", "Biblioteca, Planta Baja", 6))

    for i in range(1, 6):
        resources.append((f"Proyector P-0{i}", "projector", "Bodega Audiovisual", None))

    for name, rtype, location, capacity in resources:
        if not Resource.query.filter_by(name=name).first():
            db.session.add(Resource(name=name, resource_type=rtype,
                                    location=location, capacity=capacity))

    db.session.commit()
    print("Seed completado")