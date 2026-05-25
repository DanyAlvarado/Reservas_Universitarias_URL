from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt, migrate
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///reservas.db")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app.routes.auth import auth_bp
    from app.routes.resources import resources_bp
    from app.routes.reservations import reservations_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(reservations_bp, url_prefix="/api/reservations")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app