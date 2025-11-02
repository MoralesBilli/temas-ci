from flask import Blueprint, request,jsonify
from Extensiones import db
from Funciones.Agregar_docente import crear_docente as crear_docente2
Usuarios_bp = Blueprint('usuarios',__name__)
from Funciones.Registrar_moviminto import registrar_audi
from Funciones.Decodificar import token_required
from Modelos.Modelos import Inicio_Sesion

@Usuarios_bp.route('/api/crear-usuario',methods=['POST'])
@token_required
def crear_docente(id_login):
    try:
        clave_docente = request.form.get('clave')
        nombre = request.form.get('nombre')
        apellido_paterno = request.form.get('apellidopa')
        apellido_materno = request.form.get('apellidoma')
        num_telefono = request.form.get('telefono')
        correo =  request.form.get('correo')

        exito, mensaje = crear_docente2(clave_docente, nombre, apellido_paterno, apellido_materno, num_telefono, correo)
        if exito:
            docente = Inicio_Sesion.query.filter_by(id=id_login).first()
            if not docente:
                raise ValueError("No se encontró el docente con ese ID de sesión.")

            id_docente=docente.id_docente

            registrar_audi('Alumnos','Importar grupo',id_docente)
            return jsonify({'status':'success','message':mensaje}), 201
        
        else:
            return jsonify({'error':mensaje}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error':'Error al registrar al docente'})