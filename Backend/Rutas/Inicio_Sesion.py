from flask import Blueprint, request,jsonify,current_app
from Modelos.Modelos import Inicio_Sesion
import bcrypt
import jwt
from datetime import datetime, timedelta

Inicio_sesion_bp = Blueprint('inicio_sesion', __name__)

@Inicio_sesion_bp.route('/api/inicio_sesion', methods=['POST'])
def login():
    try:
        data = request.get_json()
        usuario = data.get('user')
        contraseña = data.get('password')

        inicio = Inicio_Sesion.query.filter(usuario=usuario).first()
        primera_vez = inicio.primer_acceso
        if not inicio:
            return jsonify({'error':'Usuario no encontrado'}),401

        if bcrypt.checkpw(contraseña.encode('utf-8'), inicio.contrasena.encode('utf-8')):
            token = jwt.encode({
                'id':inicio.id,
                'doce':inicio.id_docente,
                'exp':datetime.utcnow() + timedelta(hours=8)
            }, current_app.config['SECRET_KEY'], algorithm='HS256') 
            return jsonify({"success": True, "message": "Login exitoso", "token": token, 'acceso':primera_vez}),200
        else:
            return jsonify({"success": False, "error": "Credenciales incorrectas"}), 401
        
    except Exception as e:
        return jsonify({'error', 'Error al iniciar sesion'}),500
