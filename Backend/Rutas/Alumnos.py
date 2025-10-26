from Extensiones import db
from Modelos.Modelos import Alumnos
from flask import jsonify, Blueprint

Alumnos_bp = Blueprint('alumnos',__name__)

@Alumnos_bp.route('/api/alumnos',methods=['GET'])
def func():
    try:
        lista = Alumnos.query.with_entities(Alumnos.no_control, Alumnos.nombre, Alumnos.apellido_paterno, Alumnos.apellido_materno, Alumnos.factores_de_riesgo,).all()
    except:
        return jsonify({'ERROR':'Error al cargar los alumnos'}),500
    
