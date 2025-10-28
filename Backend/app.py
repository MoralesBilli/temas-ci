from flask import Flask
from Extensiones import db
from Rutas.Rutas import blueprints
from dotenv import load_dotenv
import os


app = Flask(__name__)
load_dotenv()
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

for bp in blueprints:
    app.register_blueprint(bp)


if __name__ == '__main__':
    app.run(debug=True)