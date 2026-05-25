from app import create_app, db
from app.utils.seed import seed_db

app = create_app()

@app.cli.command("seed")
def seed():
    with app.app_context():
        seed_db()

if __name__ == "__main__":
    app.run(debug=True, port=5000)